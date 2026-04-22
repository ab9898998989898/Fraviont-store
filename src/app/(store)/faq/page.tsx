"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/config";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import Link from "next/link";

const FAQ_CATEGORIES = [
  {
    category: "Products & Quality",
    items: [
      { q: "What makes Fraviont perfumes different?", a: "Every Fraviont fragrance is composed using the finest raw materials sourced directly from their regions of origin. Our perfumers work with natural absolutes, resins, and oils — never synthetic shortcuts — to create scents of extraordinary depth and longevity." },
      { q: "Are your products cruelty-free?", a: "Yes. Fraviont is proudly cruelty-free. None of our products or ingredients are tested on animals, and we source exclusively from suppliers who share this commitment." },
      { q: "How long do your perfumes last on skin?", a: "Our Eau de Parfum formulations are designed to last 8-12 hours on skin. For maximum longevity, apply to pulse points on moisturised skin — wrists, neck, and behind the ears." },
    ],
  },
  {
    category: "Orders & Shipping",
    items: [
      { q: "How long does shipping take?", a: "Standard domestic shipping takes 3–5 business days. Express shipping (1–2 business days) is available at checkout. International orders typically arrive within 7–14 business days." },
      { q: "Do you ship internationally?", a: "Yes, we ship to select international destinations. Shipping rates and delivery times vary by location and are calculated at checkout." },
      { q: "How do I track my order?", a: "Once your order has shipped, you will receive an email with a tracking number. You can also view your order status by logging into your account and visiting the Orders section." },
    ],
  },
  {
    category: "Returns & Gifts",
    items: [
      { q: "Do you offer gift wrapping?", a: "Every Fraviont order arrives in our signature luxury packaging — a matte black box with gold foil embossing, tissue paper, and a hand-written note. Additional gift wrapping options are available at checkout." },
      { q: "Can I return a perfume after opening it?", a: "For hygiene reasons, opened perfumes cannot be returned. However, if you receive a damaged or defective product, please contact us immediately and we will arrange a replacement." },
      { q: "What is your return policy?", a: "Unused, unopened items may be returned within 30 days of delivery for a full refund. Contact returns@fraviont.com with your order number to initiate a return." },
    ],
  },
  {
    category: "Account & Support",
    items: [
      { q: "How can I contact customer support?", a: "You can reach us at hello@fraviont.com or through our Contact page. Our team responds within 24 hours during business days." },
      { q: "Do you have a loyalty programme?", a: "We are currently developing an exclusive members programme. Sign up for our newsletter to be the first to know when it launches — founding members will receive special benefits." },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-iron/50">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
      >
        <span className="text-ivory text-sm font-sans font-light pr-8 group-hover:text-gold-warm transition-colors duration-300">{q}</span>
        <ChevronDown
          size={16}
          className={`text-gold-warm shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "200px" : "0px", opacity: open ? 1 : 0 }}
      >
        <p className="text-parchment text-sm font-sans font-light leading-relaxed pb-5">{a}</p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const els = containerRef.current?.querySelectorAll("[data-reveal]");
    if (els) gsap.from(els, { y: 50, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out" });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen pt-32 pb-24 px-8">
      <div className="max-w-3xl mx-auto">
        <p data-reveal className="text-gold-warm text-xs tracking-[0.2em] uppercase font-sans mb-4">Support</p>
        <h1 data-reveal className="font-display text-ivory font-light text-5xl mb-6">Frequently Asked Questions</h1>
        <div data-reveal className="w-16 h-px bg-gold-warm mb-6" />
        <p data-reveal className="text-parchment font-sans font-light text-sm leading-relaxed mb-16 max-w-xl">
          Everything you need to know about Fraviont, our products, and how we serve you. Can&apos;t find what you&apos;re looking for? Reach out to our team.
        </p>

        {/* Categorised FAQ Sections */}
        {FAQ_CATEGORIES.map((cat, ci) => (
          <div key={ci} data-reveal className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle size={16} className="text-gold-warm" />
              <h2 className="text-ivory text-base font-sans font-medium tracking-wide">{cat.category}</h2>
            </div>
            <div className="pl-1">
              {cat.items.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        {/* CTA Card */}
        <div
          data-reveal
          className="mt-16 p-10 text-center border border-iron/30 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(200,160,60,0.06) 0%, #111111 50%, rgba(200,160,60,0.03) 100%)",
          }}
        >
          <MessageCircle size={28} className="text-gold-warm mx-auto mb-4 opacity-60" />
          <h3 className="font-display text-ivory text-2xl font-light mb-3">Still have questions?</h3>
          <p className="text-parchment text-sm font-sans font-light mb-6 max-w-md mx-auto">
            Our concierge team is available Monday to Friday, 9am to 6pm SAST. We&apos;d love to hear from you.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium px-8 py-3 hover:bg-gold-bright transition-colors duration-300"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
