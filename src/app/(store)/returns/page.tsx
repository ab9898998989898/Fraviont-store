"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/config";
import { MailCheck, RefreshCw, HandCoins, AlertOctagon } from "lucide-react";
import Link from "next/link";

const PROCESS_STEPS = [
  { icon: MailCheck, title: "1. Request", text: "Email returns@fraviont.com with your order number and intention to return." },
  { icon: RefreshCw, title: "2. Receive Label", text: "We will email you a prepaid, trackable courier waybill within 24 hours." },
  { icon: HandCoins, title: "3. Refund Processed", text: "Once inspected at our atelier, your refund is issued to the original payment method." },
];

export default function ReturnsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const els = containerRef.current?.querySelectorAll("[data-reveal]");
    if (els) gsap.from(els, { y: 50, opacity: 0, duration: 1, stagger: 0.12, ease: "power3.out" });
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="min-h-screen pt-32 pb-24"
      style={{
        background:
          "radial-gradient(ellipse at 20% 80%, rgba(200,160,60,0.03) 0%, transparent 60%), #0A0A0A",
      }}
    >
      <div className="max-w-4xl mx-auto px-8">
        <p data-reveal className="text-gold-warm text-xs tracking-[0.2em] uppercase font-sans mb-4">Policy</p>
        <h1 data-reveal className="font-display text-ivory font-light text-5xl mb-6">Returns &amp; Exchanges</h1>
        <div data-reveal className="w-16 h-px bg-gold-warm mb-12" />
        
        {/* Intro */}
        <p data-reveal className="text-parchment font-sans font-light text-base leading-relaxed mb-16 max-w-2xl">
          We want your experience with Fraviont to be impeccable. If a purchase fails to meet your expectations, we offer a straightforward, premium returns process designed for your convenience.
        </p>

        {/* 30 Day Guarantee Banner */}
        <div data-reveal className="mb-20 p-8 border border-gold-warm/30 relative overflow-hidden" style={{ background: "rgba(200,160,60,0.05)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-warm opacity-10 blur-3xl rounded-full" />
          <h2 className="text-gold-warm text-xl font-display font-light mb-3">Our 30-Day Guarantee</h2>
          <p className="text-ivory font-sans font-light text-sm leading-relaxed max-w-xl">
            You may return any unused, unopened, and pristine items within 30 days of the delivery date for a full refund back to your original payment method. The return shipping cost is on us.
          </p>
        </div>

        {/* How to Return / Step by Step */}
        <div className="mb-20">
          <h2 data-reveal className="text-ivory text-2xl font-display font-light mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROCESS_STEPS.map((step, i) => (
              <div key={i} data-reveal className="bg-[#111111] p-8 border border-iron/20 text-center hover:border-gold-warm/20 transition-colors">
                <step.icon size={28} className="text-gold-warm mx-auto mb-6" />
                <h3 className="text-ivory font-sans font-medium text-sm mb-3">{step.title}</h3>
                <p className="text-parchment font-sans font-light text-xs leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Policies */}
        <div className="space-y-12">
          <div data-reveal className="border-t border-iron/20 pt-10">
            <h2 className="text-ivory text-xl font-display font-light mb-4">Exchanges</h2>
            <p className="text-parchment font-sans font-light text-sm leading-relaxed max-w-3xl">
              Should you desire a different size, shade, or variant, exchanges are complimentary. Simply indicate your preferred replacement item when requesting your return label. Once we receive your original item, the replacement will be dispatched via expedited shipping immediately.
            </p>
          </div>

          <div data-reveal className="border-t border-iron/20 pt-10 flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4 shrink-0">
               <div className="flex items-center gap-3 mb-2 text-red-400">
                <AlertOctagon size={18} />
                <h2 className="text-base font-display font-light">Non-Returnable</h2>
               </div>
            </div>
            <div className="md:w-3/4">
              <p className="text-parchment font-sans font-light text-sm leading-relaxed mb-4">
                To maintain our exacting hygiene and quality standards, the following items cannot be returned or exchanged under any circumstances:
              </p>
              <ul className="list-disc list-inside text-parchment font-sans font-light text-sm leading-relaxed space-y-2">
                <li>Perfumes where the seal has been broken or the atomiser has been sprayed.</li>
                <li>Cosmetics and skincare products that have been opened or tested.</li>
                <li>Fine jewelry that exhibits signs of wear, scratching, or alteration.</li>
                <li>Digital or physical gift cards.</li>
              </ul>
            </div>
          </div>

          <div data-reveal className="border-t border-iron/20 pt-10">
            <h2 className="text-ivory text-xl font-display font-light mb-4">Damaged or Defective Goods</h2>
            <p className="text-parchment font-sans font-light text-sm leading-relaxed max-w-3xl">
              In the highly unlikely event that a Fraviont product arrives damaged or defective, please accept our sincere apologies. Contact us immediately at <a href="mailto:hello@fraviont.com" className="text-gold-warm hover:underline">hello@fraviont.com</a> with photographs of the item and its packaging. We will prioritize a replacement or full refund without requiring you to return the damaged item.
            </p>
          </div>
        </div>
        
        {/* Support CTA */}
        <div data-reveal className="mt-20 text-center">
            <Link
              href="/contact"
              className="inline-block border border-iron text-ivory text-xs tracking-[0.14em] uppercase font-sans font-medium px-10 py-4 hover:border-gold-warm hover:text-gold-warm transition-colors duration-300"
            >
              Contact Support Team
            </Link>
        </div>

      </div>
    </div>
  );
}
