import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// ── Robust JSON extractor ──────────────────────────────────────────────────────
// Handles: plain JSON, markdown ```json blocks, text BEFORE/AFTER the JSON object
function extractJson(content: string): Record<string, unknown> | null {
  // 1. Strip markdown fences and try direct parse
  const stripped = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    const p = JSON.parse(stripped);
    if (p && typeof p === "object" && !Array.isArray(p)) return p;
  } catch { /* fall through */ }

  // 2. Find the outermost { } block even if there is text before/after it
  const start = content.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let end = -1;
  for (let i = start; i < content.length; i++) {
    if (content[i] === "{") depth++;
    else if (content[i] === "}") {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) return null;
  try {
    const p = JSON.parse(content.slice(start, end + 1));
    if (p && typeof p === "object" && !Array.isArray(p)) return p;
  } catch { /* not valid JSON */ }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { messages, pageContext = "products" } = body as {
      messages: { role: string; content: string }[];
      pageContext: "products" | "categories";
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // ─── CATEGORY BOT ─────────────────────────────────────────────────────────
    if (pageContext === "categories") {
      const categories = await prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          seoTitle: true,
          parent: { select: { id: true, name: true } },
        },
        orderBy: [{ parentId: "asc" }, { name: "asc" }],
      });

      // ── Server-side duplicate pre-check ──────────────────────────────────────
      // Extract likely category name from the last user message
      const lastMsg = messages[messages.length - 1]?.content ?? "";
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9ऀ-ॿ\s]/g, "").trim();
      const normalizedMsg = normalize(lastMsg);

      const serverDuplicate = categories.find((cat) => {
        const n = normalize(cat.name);
        return (
          normalizedMsg === n ||
          normalizedMsg.startsWith(n + " ") ||
          normalizedMsg.endsWith(" " + n) ||
          normalizedMsg.includes(" " + n + " ")
        );
      });

      if (serverDuplicate) {
        const parent = serverDuplicate.parent ? ` (under ${serverDuplicate.parent.name})` : " (root level)";
        return NextResponse.json({
          message: `⚠️ "${serverDuplicate.name}"${parent} category store mein pehle se exist karti hai!\n\nKya aap:\n1. Koi alag naam rakhna chahte ho?\n2. Ya existing category mein changes karni hain?\n\nBatao — main help kar deta hoon.`,
          action: null,
          actionData: null,
        });
      }
      // ─────────────────────────────────────────────────────────────────────────

      const topLevel = categories.filter((c) => !c.parent);
      const children = categories.filter((c) => c.parent);

      // Build category tree with existing SEO titles so AI can see what's already used
      const lines: string[] = [];
      for (const cat of topLevel) {
        const seo = cat.seoTitle ? ` [SEO: "${cat.seoTitle}"]` : "";
        lines.push(`  • ${cat.name}${seo} [ID: ${cat.id}]`);
        for (const sub of children.filter((c) => c.parent?.name === cat.name)) {
          const subSeo = sub.seoTitle ? ` [SEO: "${sub.seoTitle}"]` : "";
          lines.push(`      ↳ ${sub.name}${subSeo} [ID: ${sub.id}]`);
        }
      }
      const categoryTree = lines.length ? lines.join("\n") : "  (no categories yet — this will be the first one)";

      const systemPrompt = `You are a Category Assistant for Sai Computer Bazar (SCB), an Indian computer hardware store.
Your ONLY job: help the admin create new store categories.

━━━ EXISTING CATEGORIES (with their current SEO titles) ━━━
${categoryTree}

━━━ STEP 0 — DUPLICATE CHECK (do this BEFORE anything else) ━━━

Look at the EXISTING CATEGORIES list above. Compare the admin's requested category name (case-insensitive).

If the name ALREADY EXISTS in the list:
→ DO NOT ask any questions. DO NOT generate JSON.
→ Respond ONLY: "⚠️ '[Name]' category pehle se store mein hai! Kya naya naam rakhna chahte ho, ya existing category edit karni hai?"

If SIMILAR name exists (like "Laptop" vs "Laptops"):
→ Warn first: "Dhyan do — '[ExistingName]' category pehle se hai. Kya yeh wahi category hai ya alag?"

Only if name is COMPLETELY NEW → proceed to STEP 1.

━━━ IMAGE HANDLING ━━━

If the message contains "[📷 Attached: N category thumbnail]":
→ Acknowledge warmly: "Photo mil gayi! ✅ Confirm ke baad ye thumbnail ban jaegi."
→ Do NOT say you cannot see the image. Do NOT ask for images again.
→ Continue with the normal flow (ask about root/subcategory if not yet answered).

━━━ STEP 1 — ASK ABOUT LEVEL ━━━

Ask (natural Hinglish, adapt wording):
"[Name] — yeh root-level (top-level) hogi ya kisi existing category ke andar subcategory?"

━━━ STEP 2 — GENERATE JSON ━━━

After admin answers → output ONLY the JSON. First character must be {. Nothing before or after it.

━━━ SEO — MUST BE UNIQUE ━━━

Look at the SEO titles already in use (shown in the category list above).
Your new seoTitle MUST:
- Have a different structure/format than any existing title
- Be specific to what THIS category actually sells (not generic)
- NOT use "[Name] - Buy Online | Sai Computer Bazar" if similar titles already exist

seoTitle: 50-60 chars. Be creative. Vary the format.
  For a brand (e.g. Balaji): Focus on the brand identity — "Balaji Branded Computer Parts & Accessories | SCB"
  For a type (e.g. SSDs): Focus on the use case — "Fast SSD Storage Drives - Best Prices in India | SCB"
  For accessories: Focus on what problems solved — "PC Cables & Connectors - Complete Your Build | SCB"

seoDescription: 120-160 chars. Write something SPECIFIC to this category.
  Mention actual product types, actual customer benefits. NO generic template.
  Each category description must read differently from the others.

seoKeywords: 6+ keywords. Mix: category-specific, brand if applicable, long-tail queries, city/India.

description: 300+ chars. Specific to THIS category — what products, who buys them, why SCB.

ogTitle: copy seoTitle exactly.
ogDescription: copy seoDescription exactly.
twitterTitle: copy seoTitle exactly.
twitterDescription: copy seoDescription exactly.

━━━ OUTPUT FORMAT ━━━

{"__action__":"CREATE_CATEGORY","name":"","slug":"","description":"","parentId":null,"displayOrder":0,"isVisible":true,"isFeatured":false,"seoTitle":"","seoDescription":"","seoKeywords":"","ogTitle":"","ogDescription":"","twitterTitle":"","twitterDescription":""}

Conversational replies: Hinglish, 1-3 lines. NEVER discuss products.`;

      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          temperature: 0.1,
          max_tokens: 2500,
        }),
      });

      if (!response.ok) {
        console.error("DeepSeek category error:", await response.text());
        return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
      }

      const data = await response.json();
      const content: string = data.choices?.[0]?.message?.content ?? "";

      let action: string | null = null;
      let actionData: Record<string, unknown> | null = null;

      const parsed = extractJson(content);
      if (parsed?.__action__ === "CREATE_CATEGORY" && parsed.name) {
        action = "CREATE_CATEGORY";
        actionData = parsed;
      }

      // Never expose raw JSON as a chat message — if we parsed an action, use a clean message
      const chatMessage =
        action === "CREATE_CATEGORY"
          ? null // widget will use its own clean message
          : content;

      return NextResponse.json({ message: chatMessage, action, actionData });
    }

    // ─── PRODUCT BOT ──────────────────────────────────────────────────────────
    const [categories, tags, badges, recentProducts] = await Promise.all([
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          parent: { select: { id: true, name: true } },
        },
        orderBy: [{ parentId: "asc" }, { name: "asc" }],
      }),
      prisma.tag.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
      prisma.badge.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
      prisma.product.findMany({
        select: {
          name: true,
          brand: true,
          model: true,
          sku: true,
          price: true,
          seoTitle: true,
          primaryCategory: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 60,
      }),
    ]);

    // ── Server-side duplicate pre-check for products ──────────────────────────
    const lastMsgProd = messages[messages.length - 1]?.content ?? "";
    const normalizeProd = (s: string) =>
      s.toLowerCase().replace(/[^a-z0-9ऀ-ॿ\s]/g, "").trim();
    const normalizedProdMsg = normalizeProd(lastMsgProd);

    const prodDuplicate = recentProducts.find((p) => {
      const fullName = normalizeProd(`${p.brand ?? ""} ${p.name}`.trim());
      const justName = normalizeProd(p.name);
      const modelStr = p.model ? normalizeProd(p.model) : null;
      return (
        normalizedProdMsg === fullName ||
        normalizedProdMsg === justName ||
        normalizedProdMsg.includes(fullName) ||
        normalizedProdMsg.includes(justName) ||
        (modelStr && normalizedProdMsg.includes(modelStr) && modelStr.length > 5)
      );
    });

    if (prodDuplicate) {
      const cat = prodDuplicate.primaryCategory?.name ?? "Unknown";
      const price = `₹${Number(prodDuplicate.price).toLocaleString("en-IN")}`;
      const fullLabel = [prodDuplicate.brand, prodDuplicate.name].filter(Boolean).join(" ");
      return NextResponse.json({
        message: `⚠️ "${fullLabel}" pehle se store mein hai!\n\nExisting details:\n• Category: ${cat}\n• Price: ${price}${prodDuplicate.model ? `\n• Model: ${prodDuplicate.model}` : ""}\n\nKya aap:\n1. Koi alag variant ya model add karna chahte ho?\n2. Ya existing product edit karna hai?\n\nBatao — main help kar deta hoon.`,
        action: null,
        actionData: null,
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

    const topCats = categories.filter((c) => !c.parent);
    const childCats = categories.filter((c) => c.parent);
    const catLines: string[] = [];
    for (const cat of topCats) {
      catLines.push(`  • ${cat.name} [ID: ${cat.id}]`);
      for (const sub of childCats.filter((c) => c.parent?.name === cat.name)) {
        catLines.push(`      ↳ ${sub.name} [ID: ${sub.id}]`);
      }
    }

    const tagContext = tags.length
      ? tags.map((t) => `  • ${t.name} [ID: ${t.id}]`).join("\n")
      : "  (none)";

    const badgeContext = badges.length
      ? badges.map((b) => `  • ${b.name} [ID: ${b.id}]`).join("\n")
      : "  (none)";

    // Show ALL existing products (name + brand + seoTitle) for duplicate awareness
    const productSamples = recentProducts.length
      ? recentProducts
          .map((p) => {
            const label = [p.brand, p.name].filter(Boolean).join(" ");
            const seo = p.seoTitle ? ` [SEO: "${p.seoTitle}"]` : "";
            return `  ${label} — ₹${Number(p.price).toLocaleString("en-IN")} [${p.primaryCategory?.name ?? "—"}]${seo}`;
          })
          .join("\n")
      : "  (no products yet — this will be the first one)";

    const productSystemPrompt = `You are a Product Listing Assistant for Sai Computer Bazar (SCB), an Indian computer hardware store.
Your ONLY job: help the admin create complete, accurate product listings.

━━━ STORE DATABASE ━━━

CATEGORIES:
${catLines.length ? catLines.join("\n") : "  (none yet)"}

TAGS:
${tagContext}

BADGES:
${badgeContext}

EXISTING PRODUCTS (name, price, category, SEO title):
${productSamples}

━━━ IMAGE HANDLING ━━━

If the message contains "[📷 Attached: N product image(s)]":
→ Acknowledge: "Photos mil gayi! ✅ Confirm ke baad ye product ke saath upload ho jayengi."
→ Do NOT say you cannot see images. Do NOT ask for images.
→ Continue with the normal conversation flow.

━━━ STEP 0 — DUPLICATE CHECK (always first) ━━━

Before doing anything else, scan the EXISTING PRODUCTS list above.
Compare the admin's product description against existing product names (brand + name + model).

If EXACT or near-exact match found:
→ DO NOT generate JSON.
→ Say: "⚠️ '[BrandName]' pehle se store mein hai! Kya koi alag variant/storage/color add karna hai, ya existing product edit karna hai?"

If SIMILAR product exists (same brand, similar model line):
→ Warn first: "Dhyan rakhna — '[ExistingProduct]' pehle se hai. Yeh alag model hai na?"
→ If admin confirms it's different → proceed.

Only if product is completely new → proceed to STEP 1.

━━━ STEP 1 — GATHER MISSING INFO ━━━

Check what admin provided vs what's needed:

MANDATORY (must have before generating JSON):
  • Price — if not given, ask ONLY for price. Nothing else.

SMART DEFAULTS (guess confidently, don't ask):
  • Category — pick the most specific matching category from the list above. State your choice in a short line.
  • Brand, Model — extract from product name if obvious (e.g. "Samsung 970 EVO Plus" → brand=Samsung, model=970 EVO Plus)
  • Tags/Badges — pick relevant ones from the lists above

FOR TECHNICAL PRODUCTS (RAM/SSD/HDD/CPU/GPU/Motherboard/Monitor):
  If the admin gave only a brief description (no specs), ask ONE question:
  "Kuch key specs bata do (e.g. [relevant spec examples for this type])?"
  Examples:
    RAM → "capacity, speed (e.g. 16GB DDR4 3200MHz), form factor?"
    SSD → "capacity, interface (NVMe/SATA), read/write speed?"
    CPU → "cores/threads, base/boost clock, socket?"
    GPU → "VRAM, memory type, TDP?"
    Monitor → "size, resolution, panel type, refresh rate?"
  Only ask if specs genuinely unknown. Skip if admin already mentioned them.

━━━ STEP 2 — GENERATE JSON ━━━

Once you have price + specs (if technical) → output ONLY the JSON.
First character must be {. NOTHING before it. No "Sure!", no "Here's the listing:", nothing.

━━━ QUALITY STANDARDS ━━━

name: Full marketable product name as on Amazon/Flipkart — brand + model + key spec + type.
  GOOD: "Samsung 970 EVO Plus 1TB NVMe M.2 SSD"
  BAD: "970 EVO Plus SSD"

shortDescription: Exactly 2-3 sentences. Lead with the #1 selling point, then use case, then a trust signal.
  GOOD: "High-performance NVMe SSD with sequential read speeds up to 3,500 MB/s. Ideal for gaming, video editing, and OS installation. Backed by 5-year Samsung warranty."
  BAD: "Good SSD for computers."

description: Minimum 400 characters. Cover: what it is, who it's for, key features, compatibility, why buy from SCB.
  Write naturally — no bullet lists, flowing paragraphs.

specs: [{key, value}] array. Be THOROUGH for the product type:
  SSD specs: Form Factor, Interface, Capacity, Sequential Read, Sequential Write, NAND Type, Controller, Warranty
  RAM specs: Capacity, Type, Speed, Form Factor, CAS Latency, Voltage, ECC Support, Compatibility
  CPU specs: Cores, Threads, Base Clock, Boost Clock, Cache, TDP, Socket, Architecture, Lithography
  GPU specs: VRAM, Memory Interface, Core Clock, Boost Clock, TDP, Display Outputs, Recommended PSU
  Monitor specs: Size, Resolution, Panel Type, Refresh Rate, Response Time, Brightness, Ports, VESA Mount
  Keyboard/Mouse: Connectivity, Switch Type (if mechanical), DPI Range, Polling Rate, Battery Life (if wireless)
  Generic peripheral: all relevant technical specs you know about this product

seoTitle: 50-60 chars. MUST be different from existing SEO titles above.
  Vary the format by product type:
    SSD: "Samsung 970 EVO Plus 1TB NVMe SSD - ₹6,999 | SCB"
    RAM: "16GB DDR4 3200MHz RAM for Gaming & Work | SCB"
    Monitor: "24-inch Full HD IPS Monitor 144Hz | SCB India"
    Keyboard: "Mechanical Gaming Keyboard - RGB Backlit | SCB"
  Count chars. If first attempt would repeat an existing format, pick a different structure.

seoDescription: 120-160 chars. Specific to THIS product. Mention: product name, 1-2 features, price hint or value proposition, CTA.
  Each product's description must be genuinely unique — not a template swap.

seoKeywords: 8+ keywords. Mix: full product name, brand, model number, specs (e.g. "1TB NVMe"), use case, India, city.

price: Integer INR (no decimals).
upiPrice: Math.round(price × 0.98)  — UPI/cash discount price.
creditCardPrice: Math.round(price × 1.02)  — card surcharge price.
compareAtPrice: The market MRP if the product has a known higher MRP. If selling at market rate, set null.

sku: Generate as BRAND-MODEL-SPEC (e.g. "SAM-970EVOP-1TB", "KNG-FURY-16GB"). Uppercase, hyphens only.
slug: lowercase-hyphen-separated, include brand-model-capacity (e.g. "samsung-970-evo-plus-1tb-nvme-ssd").

warrantyTitle: "Warranty"
warrantySubtitle: Specific — "5 Year Samsung Warranty" not "5 Year Warranty"
deliveryTitle: "Fast Delivery"
deliverySubtitle: "2-5 Business Days"
returnsTitle: "Easy Returns"
returnsSubtitle: "7 Day Return Policy"

stockQuantity: 10 (default).
status sent by client: "DRAFT" — admin reviews before publishing.

tags: Pick relevant tag IDs from the TAGS list above (as array of ID strings). Empty array if none match.
badges: Pick relevant badge IDs from the BADGES list above (as array of ID strings). Empty array if none match.

━━━ OUTPUT FORMAT ━━━

{"__action__":"CREATE_PRODUCT","name":"","slug":"","shortDescription":"","description":"","sku":"","brand":"","model":"","price":0,"upiPrice":0,"creditCardPrice":0,"compareAtPrice":null,"stockQuantity":10,"isInStock":true,"primaryCategoryId":"","tags":[],"badges":[],"specs":[],"warrantyTitle":"Warranty","warrantySubtitle":"","deliveryTitle":"Fast Delivery","deliverySubtitle":"2-5 Business Days","returnsTitle":"Easy Returns","returnsSubtitle":"7 Day Return Policy","seoTitle":"","seoDescription":"","seoKeywords":""}

Conversational replies: Hinglish, 1-3 lines max. NEVER discuss category creation.`;

    const productResponse = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: productSystemPrompt }, ...messages],
        temperature: 0.1,
        max_tokens: 3500,
      }),
    });

    if (!productResponse.ok) {
      console.error("DeepSeek product error:", await productResponse.text());
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    const productData = await productResponse.json();
    const productContent: string = productData.choices?.[0]?.message?.content ?? "";

    let action: string | null = null;
    let actionData: Record<string, unknown> | null = null;

    const parsedProduct = extractJson(productContent);
    if (
      parsedProduct?.__action__ === "CREATE_PRODUCT" &&
      parsedProduct.name &&
      typeof parsedProduct.price === "number"
    ) {
      action = "CREATE_PRODUCT";
      actionData = parsedProduct;
    }

    const chatMessage =
      action === "CREATE_PRODUCT"
        ? null // widget will use its own clean message
        : productContent;

    return NextResponse.json({ message: chatMessage, action, actionData });
  } catch (error) {
    console.error("AI assist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
