"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/config";
import Link from "next/link";
import { Star, Zap, Users, Globe2, Briefcase } from "lucide-react";

const VALUES = [
  { icon: Star, title: "Obsessive Craftsmanship", desc: "We believe good enough never is. We pursue perfection in every detail, no matter how small." },
  { icon: Users, title: "Collaborative Genius", desc: "The best ideas come from diverse minds working in harmony. We check egos at the door." },
  { icon: Zap, title: "Inventive Spirit", desc: "We respect heritage, but we aren't bound by it. We constantly seek new ways to redefine luxury." },
  { icon: Globe2, title: "Global Perspective", desc: "We operate from Africa but build for the world. Our team reflects a tapestry of cultures." },
];

const PROCESS = [
  { step: "01", title: "Application Review", text: "Our team carefully reviews every portfolio and CV to understand your unique background." },
  { step: "02", title: "Cultural Fit Interview", text: "A conversation to ensure our values align and to discuss your career aspirations." },
  { step: "03", title: "Technical/Creative Assessment", text: "A practical evaluation of your skills relevant to the role you're applying for." },
  { step: "04", title: "Final Atelier Meeting", text: "Meet with our founders and your potential team members to seal the connection." },
];

export default function CareersPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const els = containerRef.current?.querySelectorAll("[data-reveal]");
    if (els) gsap.from(els, { y: 50, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out" });
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="min-h-screen pt-32 pb-24"
      style={{
        background:
          "radial-gradient(ellipse at 50% 20%, rgba(200,160,60,0.03) 0%, transparent 60%), #0A0A0A",
      }}
    >
      <div className="max-w-5xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <p data-reveal className="text-gold-warm text-xs tracking-[0.2em] uppercase font-sans mb-4">Join Us</p>
          <h1 data-reveal className="font-display text-ivory font-light text-5xl mb-6">Careers at Fraviont</h1>
          <div data-reveal className="w-16 h-px bg-gold-warm mb-8 mx-auto" />
          <p data-reveal className="text-parchment font-sans font-light text-base leading-relaxed">
            We are always looking for exceptional individuals who share our passion for craftsmanship,
            creativity, and the pursuit of excellence. At Fraviont, you will not just build a career —
            you will help shape the future of luxury.
          </p>
        </div>

        {/* Culture & Values */}
        <div className="mb-24">
          <h2 data-reveal className="font-display text-ivory text-3xl font-light mb-12 text-center">Our Culture</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((val, i) => (
              <div key={i} data-reveal className="bg-[#111111] border border-iron/20 p-8 flex gap-6 hover:border-gold-warm/20 transition-colors">
                <div className="w-12 h-12 bg-gold-warm/10 rounded-full flex items-center justify-center shrink-0">
                  <val.icon size={20} className="text-gold-warm" />
                </div>
                <div>
                  <h3 className="text-ivory font-sans font-medium mb-2">{val.title}</h3>
                  <p className="text-parchment font-sans font-light text-sm leading-relaxed">{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Openings */}
        <div data-reveal className="mb-24 bg-charcoal border border-iron/30 p-12 text-center" style={{ background: "linear-gradient(135deg, rgba(200,160,60,0.04) 0%, #111111 100%)" }}>
          <Briefcase size={32} className="text-gold-warm mx-auto mb-6 opacity-60" />
          <h2 className="font-display text-ivory text-3xl font-light mb-4">There are currently no open positions</h2>
          <p className="text-parchment font-sans font-light text-sm max-w-lg mx-auto mb-8">
            We are deeply flattered by your interest. While we aren't hiring right now, we are always
            building our network of extraordinary talent for future expansion.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium px-8 py-4 hover:bg-gold-bright transition-colors duration-300"
          >
            Submit Speculative Application
          </Link>
        </div>

        {/* Application Process */}
        <div className="border-t border-iron/20 pt-20">
          <div className="text-center mb-16">
            <h2 data-reveal className="font-display text-ivory text-3xl font-light">How We Hire</h2>
            <p data-reveal className="text-parchment font-sans font-light text-sm mt-4">Our process is thorough but transparent.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {PROCESS.map((step, i) => (
              <div key={i} data-reveal className="relative">
                <div className="text-gold-warm text-4xl font-display font-light mb-6 opacity-30">{step.step}</div>
                <h3 className="text-ivory font-sans font-medium mb-3">{step.title}</h3>
                <p className="text-parchment font-sans font-light text-sm leading-relaxed">{step.text}</p>
                {/* Connecting line */}
                {i < PROCESS.length - 1 && (
                  <div className="hidden md:block absolute top-[22px] left-[60px] right-[-30px] h-px bg-iron/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
