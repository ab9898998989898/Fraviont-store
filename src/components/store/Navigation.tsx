"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { ShoppingBag, Search, User, Menu, X, ChevronDown } from "lucide-react";
import { gsap } from "@/lib/gsap/config";
import { setupNavScroll, openMobileMenu } from "@/lib/gsap/animations/navigation";
import { useCartStore } from "@/lib/stores/cart.store";
import { CartDrawer } from "@/components/store/CartDrawer";
import { SearchModal } from "@/components/store/SearchModal";

const CATEGORY_LINKS = [
  { label: "Perfumes", href: "/shop?category=perfumes" },
  { label: "Cosmetics", href: "/shop?category=cosmetics" },
  { label: "Jewelry", href: "/shop?category=jewelry" },
  { label: "Gift Sets", href: "/shop?category=gift_sets" },
];

const NAV_LINKS = [
  { label: "COLLECTIONS", href: "/shop", hasDropdown: true },
  { label: "ABOUT", href: "/about" },
  { label: "CONTACT", href: "/contact" },
];

const MOBILE_LINKS = [
  { label: "COLLECTIONS", href: "/shop" },
  { label: "PERFUMES", href: "/shop?category=perfumes" },
  { label: "COSMETICS", href: "/shop?category=cosmetics" },
  { label: "JEWELRY", href: "/shop?category=jewelry" },
  { label: "ABOUT", href: "/about" },
  { label: "CONTACT", href: "/contact" },
];

export function Navigation() {
  const navRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<HTMLAnchorElement[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount);

  useGSAP(
    () => {
      if (navRef.current) setupNavScroll(navRef.current);
    },
    { scope: navRef }
  );

  function handleMenuOpen() {
    setMenuOpen(true);
    if (overlayRef.current && linkRefs.current.length > 0) {
      openMobileMenu(overlayRef.current, linkRefs.current);
    }
  }

  function handleMenuClose() {
    if (overlayRef.current) {
      gsap.to(overlayRef.current, { opacity: 0, pointerEvents: "none", duration: 0.3 });
    }
    setMenuOpen(false);
  }

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{ backgroundColor: "transparent" }}
      >
        {/* Brand */}
        <Link
          href="/"
          className="font-accent text-ivory text-lg tracking-[0.2em] uppercase hover:text-gold-warm transition-colors duration-300"
        >
          FRAVIONT
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) =>
            link.hasDropdown ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <Link
                  href={link.href}
                  className="flex items-center gap-1 text-parchment text-xs tracking-[0.14em] uppercase font-sans font-medium hover:text-gold-warm transition-colors duration-300"
                >
                  {link.label}
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </Link>
                {/* Dropdown */}
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-300"
                  style={{
                    opacity: dropdownOpen ? 1 : 0,
                    pointerEvents: dropdownOpen ? "auto" : "none",
                    transform: `translateX(-50%) translateY(${dropdownOpen ? "0" : "-8px"})`,
                  }}
                >
                  <div className="bg-charcoal border border-iron min-w-[180px] py-2">
                    {CATEGORY_LINKS.map((cat) => (
                      <Link
                        key={cat.label}
                        href={cat.href}
                        className="block px-5 py-2.5 text-parchment text-xs tracking-[0.1em] uppercase font-sans hover:text-gold-warm hover:bg-graphite transition-colors duration-200"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-parchment text-xs tracking-[0.14em] uppercase font-sans font-medium hover:text-gold-warm transition-colors duration-300"
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-5">
          <button
            aria-label="Search"
            className="text-parchment hover:text-gold-warm transition-colors duration-300 cursor-pointer"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={18} />
          </button>
          <Link
            href="/account"
            aria-label="Account"
            className="text-parchment hover:text-gold-warm transition-colors duration-300 cursor-pointer"
          >
            <User size={18} />
          </Link>
          <button
            aria-label="Cart"
            className="relative text-parchment hover:text-gold-warm transition-colors duration-300 cursor-pointer"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold-warm text-obsidian text-[10px] font-medium w-4 h-4 flex items-center justify-center rounded-none">
                {itemCount}
              </span>
            )}
          </button>
          {/* Mobile hamburger */}
          <button
            aria-label="Menu"
            className="md:hidden text-parchment hover:text-gold-warm transition-colors duration-300"
            onClick={handleMenuOpen}
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[100] bg-obsidian flex flex-col items-center justify-center gap-8"
        style={{ opacity: 0, pointerEvents: "none" }}
      >
        <button
          aria-label="Close menu"
          className="absolute top-6 right-8 text-parchment hover:text-gold-warm transition-colors"
          onClick={handleMenuClose}
        >
          <X size={24} />
        </button>
        {MOBILE_LINKS.map((link, i) => (
          <Link
            key={link.label}
            href={link.href}
            ref={(el) => {
              if (el) linkRefs.current[i] = el;
            }}
            onClick={handleMenuClose}
            className="font-display text-ivory text-4xl font-light tracking-widest hover:text-gold-warm transition-colors duration-300"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
