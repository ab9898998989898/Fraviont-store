"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/config";
import { Package, Globe, Clock, Shield, MapPin, CheckCircle2 } from "lucide-react";

const SECTIONS = [
  { icon: Package, title: "Domestic Shipping (South Africa)", content: "We offer complimentary standard shipping on all orders over R1,500. Standard delivery securely transports your items via our trusted courier partners and typically takes 3–5 business days to major centres. For urgent requests, express delivery (1–2 business days) is available for a flat rate of R150." },
  { icon: Globe, title: "International Shipping", content: "Fraviont ships to select international destinations across North America, Europe, and the Middle East. International delivery typically requires 7–14 business days, depending on customs processing. Shipping rates and estimated timelines are calculated dynamically at checkout based on destination and parcel weight." },
  { icon: Clock, title: "Order Processing Time", content: "Our atelier processes all orders within 24 hours of placement (excluding weekends and public holidays). During launch weeks or peak holiday seasons, please allow an additional 24-48 hours for dispatch. As soon as your package leaves our facility, you will receive an email containing detailed tracking information." },
];

export default function ShippingPage() {
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
          "radial-gradient(ellipse at 80% 80%, rgba(200,160,60,0.03) 0%, transparent 60%), #0A0A0A",
      }}
    >
      <div className="max-w-4xl mx-auto px-8">
        <p data-reveal className="text-gold-warm text-xs tracking-[0.2em] uppercase font-sans mb-4">Delivery</p>
        <h1 data-reveal className="font-display text-ivory font-light text-5xl mb-6">Shipping Information</h1>
        <div data-reveal className="w-16 h-px bg-gold-warm mb-16" />

        {/* Journey Timeline */}
        <div data-reveal className="mb-24 p-8 sm:p-12 border border-iron/30" style={{ background: "linear-gradient(135deg, rgba(20,20,20,1) 0%, #111111 100%)" }}>
          <h2 className="font-display text-ivory text-2xl font-light mb-8 text-center">The Journey of Your Order</h2>
          <div className="flex flex-col sm:flex-row justify-between relative">
            {/* Connecting Line (Mobile: vertical, Desktop: horizontal) */}
            <div className="absolute top-0 bottom-0 left-[23px] w-px bg-iron/40 sm:hidden" />
            <div className="hidden sm:block absolute top-[23px] left-12 right-12 h-px bg-iron/40" />
            
            {[
              { icon: CheckCircle2, label: "Order Placed", time: "Day 1" },
              { icon: Package, label: "Atelier Processing", time: "Day 1-2" },
              { icon: Shield, label: "Quality Inspection", time: "Day 2" },
              { icon: MapPin, label: "Out for Delivery", time: "Day 3-5" },
            ].map((step, i) => (
              <div key={i} className="flex sm:flex-col items-center sm:text-center relative z-10 sm:w-1/4 mb-8 sm:mb-0">
                <div className="w-12 h-12 bg-black border-2 border-iron/50 rounded-full flex items-center justify-center shrink-0 mb-0 sm:mb-4">
                  <step.icon size={18} className="text-gold-warm" />
                </div>
                <div className="ml-6 sm:ml-0">
                  <p className="text-ivory font-sans font-medium text-sm mb-1">{step.label}</p>
                  <p className="text-ash text-xs tracking-[0.14em] uppercase font-sans">{step.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Info */}
        <div className="space-y-16 mb-24">
          {SECTIONS.map((section, i) => (
            <div key={i} data-reveal className="flex flex-col sm:flex-row gap-6 sm:gap-10">
              <div className="w-12 h-12 flex-shrink-0 bg-gold-warm/10 rounded-full flex items-center justify-center">
                <section.icon size={20} className="text-gold-warm" />
              </div>
              <div>
                <h2 className="text-ivory text-xl font-display font-light mb-4">{section.title}</h2>
                <p className="text-parchment font-sans font-light text-sm leading-relaxed">{section.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Packaging Callout */}
        <div data-reveal className="border-t border-iron/20 pt-16 flex items-start gap-8">
          <div className="hidden sm:block w-32 h-32 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-iron/30 shrink-0 relative overflow-hidden">
             {/* Decorative box graphic */}
             <div className="absolute inset-0 m-4 border border-gold-warm/20" />
             <div className="absolute top-1/2 left-0 w-full h-px bg-gold-warm/10" />
             <div className="absolute left-1/2 top-0 h-full w-px bg-gold-warm/10" />
          </div>
          <div>
            <h2 className="text-ivory text-xl font-display font-light mb-4">The Fraviont Unboxing Experience</h2>
            <p className="text-parchment font-sans font-light text-sm leading-relaxed mb-4">
              We believe the anticipation of arrival should be rewarded. Every Fraviont order is dispatched in our signature luxury packaging — a sturdy matte black presentation box adorned with subtle gold foil branding. 
            </p>
            <p className="text-parchment font-sans font-light text-sm leading-relaxed">
              Inside, items are nestled securely in custom-moulded inserts or wrapped in heavyweight black tissue paper, accompanied by a hand-written note from our atelier. For gifting purposes, prices are never included on the packing slip.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
