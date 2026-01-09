import Link from "next/link";
import { Facebook, Instagram, Youtube, MessageCircle } from "lucide-react";

const Footer = () => {
  const footerSections = [
    {
      title: "Shop",
      links: [
        { label: "All Categories", href: "/categories" },
        { label: "All Products", href: "/products" },
        { label: "Prebuilt PCs", href: "/prebuilt-pcs" },
        { label: "Build Your PC", href: "/build-pc" },
      ]
    },
    {
      title: "Account",
      links: [
        { label: "My Orders", href: "/orders" },
        { label: "Wishlist", href: "/wishlist" },
        { label: "Cart", href: "/cart" },
        { label: "Login", href: "/login" },
      ]
    },
    {
      title: "Policy",
      links: [
        { label: "Shipping Policy", href: "#" },
        { label: "Refund Policy", href: "#" },
        { label: "Terms & Conditions", href: "#" },
        { label: "Privacy Policy", href: "#" },
      ]
    },
    {
      title: "Contact",
      links: [
        { label: "support@scbazar.in", href: "mailto:support@scbazar.in" },
        { label: "+91-XXXXXXXXXX", href: "tel:+91XXXXXXXXXX" },
        { label: "WhatsApp Support", href: "#" },
        { label: "Live Chat", href: "#" },
      ]
    }
  ];

  const paymentMethods = [
    "UPI", "Visa", "Mastercard", "RuPay", "PayPal"
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: MessageCircle, href: "#", label: "WhatsApp" }
  ];

  return (
    <footer className="glass-panel border-t border-white/10 mt-12 sm:mt-16">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-primary">{section.title}</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="border-t border-white/10 pt-6 sm:pt-8 mb-6 sm:mb-8">
          <h3 className="text-center font-semibold text-sm sm:text-base mb-3 sm:mb-4 text-accent">SCB Assured Products</h3>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
            <div className="glass-panel px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm">✓ Genuine Components</div>
            <div className="glass-panel px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm">✓ Fast Shipping</div>
            <div className="glass-panel px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm">✓ Expert Support</div>
            <div className="glass-panel px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm">✓ 7-Day Returns</div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-white/10 pt-6 sm:pt-8 mb-6 sm:mb-8">
          <p className="text-center text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">We Accept</p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method}
                className="glass-panel px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium"
              >
                {method}
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-white/10 pt-6 sm:pt-8 mb-6 sm:mb-8">
          <div className="flex justify-center gap-4 sm:gap-6">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="glass-panel p-2.5 sm:p-3 rounded-full hover:glow-teal transition-all hover:scale-110"
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
            <span className="text-primary font-semibold">SCB</span> – Sai Computer Bazar © 2025. All Rights Reserved.
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Your Trusted PC & Gaming Store • Build · Review · Win
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
