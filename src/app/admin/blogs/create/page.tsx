"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Save,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  X,
  Plus,
  ChevronDown,
  Search,
  Globe,
  Settings,
  Upload,
  Loader2,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

const DEFAULT_CATEGORY_COLORS = [
  "#6366f1", // indigo
  "#22c55e", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

// Circular Progress Component for SEO Score
function CircularProgress({ value, size = 100, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (value >= 80) return "#22c55e"; // green
    if (value >= 50) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color: getColor() }}>{value}%</span>
        <span className="text-[10px] text-muted-foreground">SEO Score</span>
      </div>
    </div>
  );
}

export default function CreateBlogPage() {
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const featuredImageRef = useRef<HTMLInputElement>(null);
  const authorImageRef = useRef<HTMLInputElement>(null);
  const ogImageRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    seo: false,
    social: false,
    advanced: false,
  });

  // Category creation
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(DEFAULT_CATEGORY_COLORS[0]);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Blog form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    featuredImageAlt: "",
    ogImage: "",
    authorName: "",
    authorImage: "",
    authorBio: "",
    categoryId: "",
    tags: [] as string[],
    status: "DRAFT",
    isFeatured: false,
    allowComments: true,
    scheduledAt: "",
    // SEO Fields
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    canonicalUrl: "",
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: "",
    ogDescription: "",
    twitterTitle: "",
    twitterDescription: "",
    schemaType: "Article",
    internalNotes: "",
  });

  const [tagInput, setTagInput] = useState("");

  // SEO Checklist
  const seoChecklist = useMemo(() => {
    const effectiveSeoTitle = formData.seoTitle || formData.title;
    const effectiveSeoDescription = formData.seoDescription || formData.excerpt;
    return [
      { label: "SEO Title (30-60 chars)", done: effectiveSeoTitle.length >= 30 && effectiveSeoTitle.length <= 60, points: 20 },
      { label: "Meta Description (120-160 chars)", done: effectiveSeoDescription.length >= 120 && effectiveSeoDescription.length <= 160, points: 20 },
      { label: "Focus Keywords (3+)", done: formData.seoKeywords.split(",").filter(k => k.trim()).length >= 3, points: 15 },
      { label: "Featured Image with Alt", done: !!formData.featuredImage && !!formData.featuredImageAlt, points: 15 },
      { label: "Excerpt (50+ chars)", done: formData.excerpt.length >= 50, points: 10 },
      { label: "Category Selected", done: !!formData.categoryId, points: 10 },
      { label: "Tags Added (2+)", done: formData.tags.length >= 2, points: 10 },
    ];
  }, [formData]);

  // Calculate SEO Score
  const seoScore = useMemo(() => {
    return seoChecklist.reduce((score, item) => score + (item.done ? item.points : 0), 0);
  }, [seoChecklist]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/blog-categories");
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Strip HTML/Markdown and get plain text
  const getPlainText = (text: string) => {
    return text
      .replace(/<[^>]*>/g, "")
      .replace(/[#*_`~\[\]()]/g, "")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Auto-generate SEO fields
  const generateSEO = () => {
    const plainContent = getPlainText(formData.content);
    const title = formData.title.slice(0, 60);
    const description = formData.excerpt
      ? formData.excerpt.slice(0, 160)
      : plainContent.slice(0, 160);

    setFormData((prev) => ({
      ...prev,
      seoTitle: title,
      seoDescription: description,
      ogTitle: title,
      ogDescription: description,
      twitterTitle: title,
      twitterDescription: description,
      ogImage: prev.ogImage || prev.featuredImage,
    }));

    toast.success("SEO fields generated!");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // Create new category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsCreatingCategory(true);
    try {
      const res = await fetch("/api/admin/blog-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          color: newCategoryColor,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCategories([...categories, data.category]);
        setFormData((prev) => ({ ...prev, categoryId: data.category.id }));
        setNewCategoryName("");
        toast.success("Category created!");
      } else {
        toast.error(data.error || "Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const insertFormatting = (before: string, after: string = "") => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const newText =
      formData.content.substring(0, start) +
      before +
      selectedText +
      after +
      formData.content.substring(end);

    setFormData((prev) => ({ ...prev, content: newText }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  // Handle image upload
  const handleImageUpload = async (
    file: File,
    field: "featuredImage" | "authorImage" | "ogImage"
  ) => {
    if (!file) return;

    setIsUploading(field);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("folder", "blogs");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();
      if (res.ok) {
        setFormData((prev) => ({ ...prev, [field]: data.url }));
        toast.success("Image uploaded!");
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(null);
    }
  };

  const handleSubmit = async (status: string = formData.status) => {
    if (!formData.title || !formData.content) {
      toast.error("Title and content are required");
      return;
    }

    if (!formData.authorName) {
      toast.error("Author name is required");
      return;
    }

    // Auto-generate SEO if not filled
    const finalData = { ...formData };
    if (!finalData.seoTitle) {
      finalData.seoTitle = finalData.title.slice(0, 60);
    }
    if (!finalData.seoDescription) {
      const plainContent = getPlainText(finalData.content);
      finalData.seoDescription = finalData.excerpt
        ? finalData.excerpt.slice(0, 160)
        : plainContent.slice(0, 160);
    }
    if (!finalData.ogTitle) finalData.ogTitle = finalData.seoTitle;
    if (!finalData.ogDescription) finalData.ogDescription = finalData.seoDescription;
    if (!finalData.twitterTitle) finalData.twitterTitle = finalData.seoTitle;
    if (!finalData.twitterDescription) finalData.twitterDescription = finalData.seoDescription;
    if (!finalData.ogImage) finalData.ogImage = finalData.featuredImage;

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...finalData, status }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Blog created successfully");
        router.push("/admin/blogs");
      } else {
        toast.error(data.error || "Failed to create blog");
      }
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error("Failed to create blog");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Blog"
        subtitle="Write SEO-optimized content"
        backUrl="/admin/blogs"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSubmit("DRAFT")} disabled={isLoading}>
              Save Draft
            </Button>
            <Button onClick={() => handleSubmit("PUBLISHED")} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <div className="space-y-4">
              <div>
                <Label>Blog Title <span className="text-destructive">*</span></Label>
                <Input
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Enter blog title..."
                  className="mt-1 text-lg font-semibold"
                />
              </div>
              <div>
                <Label>URL Slug</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">/blog/</span>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="blog-slug"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/50">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormatting("**", "**")} title="Bold">
                <Bold className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormatting("*", "*")} title="Italic">
                <Italic className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormatting("<u>", "</u>")} title="Underline">
                <Underline className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormatting("# ")} title="Heading 1">
                <Heading1 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormatting("## ")} title="Heading 2">
                <Heading2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormatting("### ")} title="Heading 3">
                <Heading3 className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormatting("- ")} title="Bullet List">
                <List className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormatting("1. ")} title="Numbered List">
                <ListOrdered className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormatting("> ")} title="Quote">
                <Quote className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormatting("`", "`")} title="Code">
                <Code className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormatting("[", "](url)")} title="Link">
                <LinkIcon className="w-4 h-4" />
              </Button>
            </div>

            <Textarea
              ref={contentRef}
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Write your blog content here... (Supports Markdown)"
              className="min-h-[400px] rounded-none border-0 resize-y font-mono focus-visible:ring-0"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6">
            <Label>Excerpt / Summary</Label>
            <Textarea
              value={formData.excerpt}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Write a short summary for search results..."
              className="mt-1"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {formData.excerpt.length}/160 characters recommended
            </p>
          </div>

          {/* SEO Section */}
          <Collapsible open={expandedSections.seo} onOpenChange={(open) => setExpandedSections((prev) => ({ ...prev, seo: open }))}>
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden">
              <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" />
                  <span className="font-medium">SEO Settings</span>
                  <Badge variant="secondary" className="ml-2">Auto-generated</Badge>
                </div>
                <ChevronDown className={cn("w-4 h-4 transition-transform", expandedSections.seo && "rotate-180")} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-0 space-y-4">
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={generateSEO}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate SEO
                    </Button>
                  </div>
                  <div>
                    <Label>SEO Title</Label>
                    <Input
                      value={formData.seoTitle}
                      onChange={(e) => setFormData((prev) => ({ ...prev, seoTitle: e.target.value.slice(0, 60) }))}
                      placeholder={formData.title ? formData.title.slice(0, 60) : "Auto-generated from title..."}
                      className="mt-1"
                      maxLength={60}
                    />
                    <p className={cn("text-xs mt-1", formData.seoTitle.length > 55 ? "text-amber-500" : "text-muted-foreground")}>
                      {formData.seoTitle.length}/60 characters
                    </p>
                  </div>
                  <div>
                    <Label>Meta Description</Label>
                    <Textarea
                      value={formData.seoDescription}
                      onChange={(e) => setFormData((prev) => ({ ...prev, seoDescription: e.target.value.slice(0, 160) }))}
                      placeholder="Auto-generated from excerpt or content..."
                      className="mt-1"
                      rows={3}
                      maxLength={160}
                    />
                    <p className={cn("text-xs mt-1", formData.seoDescription.length > 155 ? "text-amber-500" : "text-muted-foreground")}>
                      {formData.seoDescription.length}/160 characters
                    </p>
                  </div>
                  <div>
                    <Label>Focus Keywords</Label>
                    <Input
                      value={formData.seoKeywords}
                      onChange={(e) => setFormData((prev) => ({ ...prev, seoKeywords: e.target.value }))}
                      placeholder="keyword1, keyword2, keyword3..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Canonical URL</Label>
                    <Input
                      value={formData.canonicalUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, canonicalUrl: e.target.value }))}
                      placeholder="https://..."
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.robotsIndex}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, robotsIndex: checked }))}
                      />
                      <Label>Allow indexing</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.robotsFollow}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, robotsFollow: checked }))}
                      />
                      <Label>Follow links</Label>
                    </div>
                  </div>

                  {/* Google Preview */}
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-2">Google Search Preview</p>
                    <p className="text-blue-600 text-lg hover:underline cursor-pointer">
                      {(formData.seoTitle || formData.title || "Your Blog Title").slice(0, 60)}
                    </p>
                    <p className="text-emerald-600 text-sm">example.com/blog/{formData.slug || "your-blog-slug"}</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      {(formData.seoDescription || formData.excerpt || "Your meta description will appear here...").slice(0, 160)}
                    </p>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Social Media Section */}
          <Collapsible open={expandedSections.social} onOpenChange={(open) => setExpandedSections((prev) => ({ ...prev, social: open }))}>
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden">
              <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="font-medium">Social Media (OG & Twitter)</span>
                  <Badge variant="secondary" className="ml-2">Auto-generated</Badge>
                </div>
                <ChevronDown className={cn("w-4 h-4 transition-transform", expandedSections.social && "rotate-180")} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-0 space-y-4">
                  {/* OG Image Upload */}
                  <div>
                    <Label>OG Image</Label>
                    <input
                      type="file"
                      ref={ogImageRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "ogImage")}
                    />
                    {formData.ogImage ? (
                      <div className="relative mt-2">
                        <Image
                          src={formData.ogImage}
                          alt="OG"
                          width={400}
                          height={200}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => setFormData((prev) => ({ ...prev, ogImage: "" }))}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        onClick={() => ogImageRef.current?.click()}
                        className="mt-2 border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                      >
                        {isUploading === "ogImage" ? (
                          <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                            <p className="text-sm text-muted-foreground">Click to upload or uses featured image</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>OG Title</Label>
                      <Input
                        value={formData.ogTitle}
                        onChange={(e) => setFormData((prev) => ({ ...prev, ogTitle: e.target.value.slice(0, 60) }))}
                        placeholder="Auto-generated from title..."
                        className="mt-1"
                        maxLength={60}
                      />
                    </div>
                    <div>
                      <Label>Twitter Title</Label>
                      <Input
                        value={formData.twitterTitle}
                        onChange={(e) => setFormData((prev) => ({ ...prev, twitterTitle: e.target.value.slice(0, 60) }))}
                        placeholder="Auto-generated from title..."
                        className="mt-1"
                        maxLength={60}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>OG Description</Label>
                      <Textarea
                        value={formData.ogDescription}
                        onChange={(e) => setFormData((prev) => ({ ...prev, ogDescription: e.target.value.slice(0, 160) }))}
                        placeholder="Auto-generated..."
                        className="mt-1"
                        rows={2}
                        maxLength={160}
                      />
                    </div>
                    <div>
                      <Label>Twitter Description</Label>
                      <Textarea
                        value={formData.twitterDescription}
                        onChange={(e) => setFormData((prev) => ({ ...prev, twitterDescription: e.target.value.slice(0, 160) }))}
                        placeholder="Auto-generated..."
                        className="mt-1"
                        rows={2}
                        maxLength={160}
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Advanced Section */}
          <Collapsible open={expandedSections.advanced} onOpenChange={(open) => setExpandedSections((prev) => ({ ...prev, advanced: open }))}>
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden">
              <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  <span className="font-medium">Advanced Settings</span>
                </div>
                <ChevronDown className={cn("w-4 h-4 transition-transform", expandedSections.advanced && "rotate-180")} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-0 space-y-4">
                  <div>
                    <Label>Schema Type</Label>
                    <Select value={formData.schemaType} onValueChange={(value) => setFormData((prev) => ({ ...prev, schemaType: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Article">Article</SelectItem>
                        <SelectItem value="BlogPosting">Blog Posting</SelectItem>
                        <SelectItem value="NewsArticle">News Article</SelectItem>
                        <SelectItem value="TechArticle">Tech Article</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Internal Notes (not published)</Label>
                    <Textarea
                      value={formData.internalNotes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, internalNotes: e.target.value }))}
                      placeholder="Notes for team members..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <h3 className="font-medium mb-4">Publish</h3>
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.status === "SCHEDULED" && (
                <div>
                  <Label>Schedule Date</Label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label>Featured Post</Label>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFeatured: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Allow Comments</Label>
                <Switch
                  checked={formData.allowComments}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, allowComments: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Author Section */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <h3 className="font-medium mb-4">Author <span className="text-destructive">*</span></h3>
            <div className="space-y-4">
              {/* Author Image */}
              <div className="flex justify-center">
                <input
                  type="file"
                  ref={authorImageRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "authorImage")}
                />
                {formData.authorImage ? (
                  <div className="relative">
                    <Image
                      src={formData.authorImage}
                      alt="Author"
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover border-2 border-border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-1 -right-1 h-5 w-5"
                      onClick={() => setFormData((prev) => ({ ...prev, authorImage: "" }))}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => authorImageRef.current?.click()}
                    className="w-20 h-20 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  >
                    {isUploading === "authorImage" ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>
              <div>
                <Label>Author Name <span className="text-destructive">*</span></Label>
                <Input
                  value={formData.authorName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, authorName: e.target.value }))}
                  placeholder="Enter author name..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Author Bio</Label>
                <Textarea
                  value={formData.authorBio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, authorBio: e.target.value }))}
                  placeholder="Short bio..."
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Category - with inline creation */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <h3 className="font-medium mb-4">Category</h3>
            <div className="space-y-3">
              <Select value={formData.categoryId} onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Create new category */}
              <div className="pt-2 border-t border-border">
                <Label className="text-xs text-muted-foreground">Create New Category</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateCategory())}
                  />
                  <Button
                    size="icon"
                    onClick={handleCreateCategory}
                    disabled={!newCategoryName.trim() || isCreatingCategory}
                  >
                    {isCreatingCategory ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {/* Color picker */}
                <div className="flex gap-1 mt-2">
                  {DEFAULT_CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "w-6 h-6 rounded-full transition-transform",
                        newCategoryColor === color && "ring-2 ring-offset-2 ring-primary scale-110"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCategoryColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <h3 className="font-medium mb-4">Tags</h3>
            <div className="flex gap-2 mb-3">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                placeholder="Add tag..."
                className="flex-1"
              />
              <Button size="icon" onClick={handleAddTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <h3 className="font-medium mb-4">Featured Image</h3>
            <input
              type="file"
              ref={featuredImageRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "featuredImage")}
            />
            {formData.featuredImage ? (
              <div className="relative mb-3">
                <Image
                  src={formData.featuredImage}
                  alt="Featured"
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => setFormData((prev) => ({ ...prev, featuredImage: "" }))}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div
                onClick={() => featuredImageRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center mb-3 cursor-pointer hover:border-primary transition-colors"
              >
                {isUploading === "featuredImage" ? (
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload image</p>
                  </>
                )}
              </div>
            )}
            <Input
              value={formData.featuredImageAlt}
              onChange={(e) => setFormData((prev) => ({ ...prev, featuredImageAlt: e.target.value }))}
              placeholder="Image alt text for SEO..."
            />
          </div>

          {/* SEO Analytics Card */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                SEO Score
              </h3>
              <Button variant="outline" size="sm" onClick={generateSEO}>
                <Sparkles className="w-3 h-3 mr-1" /> Auto
              </Button>
            </div>

            {/* Circular Progress */}
            <div className="flex justify-center mb-4">
              <CircularProgress value={seoScore} />
            </div>

            {/* SEO Checklist */}
            <div className="space-y-2">
              {seoChecklist.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                  <span className={cn("flex-1", item.done ? "text-muted-foreground" : "text-foreground")}>
                    {item.label}
                  </span>
                  <span className="text-xs text-muted-foreground">+{item.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
