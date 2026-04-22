"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/config";

export default function TermsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const els = containerRef.current?.querySelectorAll("[data-reveal]");
    if (els) gsap.from(els, { y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen pt-32 pb-24 px-8 max-w-3xl mx-auto">
      <p data-reveal className="text-gold-warm text-xs tracking-[0.2em] uppercase font-sans mb-4">Legal</p>
      <h1 data-reveal className="font-display text-ivory font-light text-5xl mb-6">Terms of Service</h1>
      <div data-reveal className="w-16 h-px bg-gold-warm mb-12" />
      <p data-reveal className="text-ash text-xs font-sans mb-12">Last updated: April 2026</p>

      <div className="space-y-8 text-parchment font-sans font-light text-sm leading-relaxed">
        <section data-reveal>
          <h2 className="text-ivory text-lg font-sans font-medium mb-3">1. General Terms</h2>
          <p>By accessing and using fraviont.com, you accept and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our website or services.</p>
        </section>
        <section data-reveal>
          <h2 className="text-ivory text-lg font-sans font-medium mb-3">2. Products &amp; Pricing</h2>
          <p>All product descriptions, images, and prices are accurate to the best of our knowledge. Prices are listed in South African Rand (ZAR) and include VAT where applicable. We reserve the right to modify prices at any time without prior notice.</p>
        </section>
        <section data-reveal>
          <h2 className="text-ivory text-lg font-sans font-medium mb-3">3. Orders &amp; Payment</h2>
          <p>By placing an order, you confirm that you are at least 18 years of age and that the information provided is accurate. Payment is processed securely through PayFast. We accept major credit and debit cards, EFT, and select digital wallets. An order confirmation will be sent to your email upon successful payment.</p>
        </section>
        <section data-reveal>
          <h2 className="text-ivory text-lg font-sans font-medium mb-3">4. Intellectual Property</h2>
          <p>All content on this website, including but not limited to text, images, logos, product designs, and brand elements, is the property of Fraviont and is protected by applicable intellectual property laws. Reproduction or distribution without written permission is prohibited.</p>
        </section>
        <section data-reveal>
          <h2 className="text-ivory text-lg font-sans font-medium mb-3">5. Limitation of Liability</h2>
          <p>Fraviont shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our total liability is limited to the purchase price of the products in question.</p>
        </section>
        <section data-reveal>
          <h2 className="text-ivory text-lg font-sans font-medium mb-3">6. Governing Law</h2>
          <p>These terms are governed by the laws of the Republic of South Africa. Any disputes shall be resolved in the courts of the Western Cape.</p>
        </section>
      </div>
    </div>
  );
}
