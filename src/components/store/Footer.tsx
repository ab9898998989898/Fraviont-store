import Link from "next/link";

const FOOTER_LINKS = {
  Shop: [
    { label: "Perfumes", href: "/shop?category=perfumes" },
    { label: "Cosmetics", href: "/shop?category=cosmetics" },
    { label: "Jewelry", href: "/shop?category=jewelry" },
    { label: "Gift Sets", href: "/shop?category=gift_sets" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Journal", href: "/journal" },
    { label: "Press", href: "/press" },
    { label: "Careers", href: "/careers" },
  ],
  Support: [
    { label: "Contact", href: "/contact" },
    { label: "Shipping", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "FAQ", href: "/faq" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#0D0D0D] border-t border-iron mt-32">
      <div className="max-w-7xl mx-auto px-8 py-20">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="font-accent text-ivory text-lg tracking-[0.2em] uppercase"
            >
              FRAVIONT
            </Link>
            <p className="text-ash text-sm font-sans font-light leading-relaxed mt-4">
              The art of presence. Luxury perfumes, cosmetics, and jewelry crafted for the discerning.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-ivory text-xs tracking-[0.16em] uppercase font-sans font-medium">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-ash text-sm font-sans font-light hover:text-gold-warm transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-iron pt-12 mb-12">
          <div className="max-w-md">
            <h4 className="text-ivory text-sm tracking-[0.14em] uppercase font-sans font-medium mb-2">
              The Inner Circle
            </h4>
            <p className="text-ash text-sm font-sans font-light mb-4">
              Early access, exclusive offers, and the stories behind our collections.
            </p>
            <div className="flex gap-0">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-transparent border border-iron text-ivory text-sm font-sans font-light px-4 py-3 placeholder:text-ash focus:outline-none focus:border-gold-antique transition-colors"
              />
              <button className="bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium px-6 py-3 hover:bg-gold-bright transition-colors duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-iron pt-8">
          <p className="text-ash text-xs font-sans font-light">
            © {new Date().getFullYear()} Fraviont. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-ash text-xs font-sans hover:text-gold-warm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-ash text-xs font-sans hover:text-gold-warm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
