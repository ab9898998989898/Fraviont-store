"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/config";

export default function PrivacyPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const els = containerRef.current?.querySelectorAll("[data-reveal]");
    if (els) gsap.from(els, { y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen pt-32 pb-24 px-8 max-w-3xl mx-auto">
      <p data-reveal className="text-gold-warm text-xs tracking-[0.2em] uppercase font-sans mb-4">Legal</p>
      <h1 data-reveal className="font-display text-ivory font-light text-5xl mb-6">Privacy Policy</h1>
      <div data-reveal className="w-16 h-px bg-gold-warm mb-12" />
      <p data-reveal className="text-ash text-xs font-sans mb-12">Last updated: April 2026</p>

      <div className="space-y-8 text-parchment font-sans font-light text-sm leading-relaxed">
        <section data-reveal>
          <h2 className="text-ivory text-lg font-sans font-medium mb-3">Information We Collect</h2>
          <p>We collect information you provide directly to us, such as your name, email address, shipping address, and payment information when you make a purchase or create an account. We also collect certain information automatically, including your IP address, browser type, and browsing behaviour on our site.</p>
        </section>
        <section data-reveal>
          <h2 className="text-ivory text-lg font-sans font-medium mb-3">How We Use Your Information</h2>
          <p>We use your information to process orders, personalise your shopping experience, send transactional emails (order confirmations, shipping updates), and — with your consent — send marketing communications about new collections and offers. We never sell your personal data to third parties.</p>
        </section>
        <section data-reveal>
          <h2 className="text-ivory text-lg font-sans font-medium mb-3">Data Security</h2>
          <p>We implement industry-standard security measures including SSL encryption, secure payment processing through PayFast, and regular security audits to protect your personal information. All payment data is processed securely and never stored on our servers.</p>
        </section>
        <section data-reveal>
          <h2 className="text-ivory text-lg font-sans font-medium mb-3">Cookies</h2>
          <p>Our website uses essential cookies to maintain your session and cart state, and optional analytics cookies to help us understand how visitors use our site. You can manage your cookie preferences through your browser settings.</p>
        </section>
        <section data-reveal>
          <h2 className="text-ivory text-lg font-sans font-medium mb-3">Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information at any time. You may also opt out of marketing communications by clicking the unsubscribe link in any email. For data requests, contact us at privacy@fraviont.com.</p>
        </section>
      </div>
    </div>
  );
}
