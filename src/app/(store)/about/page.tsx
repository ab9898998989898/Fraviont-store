"use client";

import { useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/config";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Gem, Leaf, Heart, Globe, Award, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const VALUES = [
  { icon: Gem,   title: "Uncompromising Quality",  text: "Every material is hand-selected, every formula tested over hundreds of iterations, every piece inspected to our exacting standards." },
  { icon: Leaf,  title: "Sustainably Sourced",      text: "We partner only with suppliers who share our commitment to ethical sourcing, fair trade practices, and environmental stewardship." },
  { icon: Heart, title: "Cruelty-Free Always",      text: "No Fraviont product has ever been tested on animals. This is not a trend for us — it is an unbreakable covenant." },
  { icon: Globe, title: "Global Craftsmanship",     text: "From oud forests in Assam to rose valleys in Bulgaria — we travel the world to bring you the finest ingredients and artisans." },
];

const MILESTONES = [
  { year: "2024", label: "Founded",           detail: "Fraviont was born in Cape Town with a vision to redefine accessible luxury." },
  { year: "2024", label: "First Collection",  detail: "Launched our debut fragrance trio — Oud Noir, Rose Absolue, and Amber Dusk." },
  { year: "2025", label: "Cosmetics & Jewelry", detail: "Expanded into skincare, lip treatments, and handcrafted fine jewelry." },
  { year: "2025", label: "Press Recognition", detail: "Featured in Vogue SA, GQ, Harper's Bazaar, and Elle Décor." },
  { year: "2026", label: "Digital Atelier",   detail: "Launched our AI-powered scent profiling and personalised shopping experience." },
];

const STATS = [
  { value: 200, suffix: "+", label: "Raw Ingredients" },
  { value: 30,  suffix: "+", label: "Countries Sourced" },
  { value: 72,  suffix: "hr", label: "Maceration Process" },
  { value: 100, suffix: "%",  label: "Cruelty-Free" },
];

/* ─── tiny helper: split text into char spans ─── */
function splitIntoChars(el: HTMLElement) {
  const text = el.textContent ?? "";
  el.innerHTML = text
    .split("")
    .map((ch) =>
      ch === " "
        ? `<span style="display:inline-block;width:.25em">&nbsp;</span>`
        : `<span style="display:inline-block">${ch}</span>`
    )
    .join("");
  return el.querySelectorAll("span");
}

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  /* ─── Floating particles ─── */
  useEffect(() => {
    const canvas = document.getElementById("about-particles") as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const resize = () => {
      canvas.width  = document.documentElement.clientWidth;
      canvas.height = document.documentElement.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.3,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      o: Math.random() * 0.35 + 0.05,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,160,60,${p.o})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useGSAP(
    () => {
      /* ── 1. HERO — char-by-char title + slide-in paragraphs ── */
      const h1 = containerRef.current?.querySelector<HTMLElement>("[data-hero-title]");
      if (h1) {
        const chars = splitIntoChars(h1);
        gsap.from(chars, {
          y: 80,
          opacity: 0,
          rotateX: -90,
          transformOrigin: "50% 0%",
          duration: 0.9,
          stagger: 0.025,
          ease: "expo.out",
          delay: 0.2,
        });
      }

      const heroBadge = containerRef.current?.querySelector("[data-hero-badge]");
      if (heroBadge) {
        gsap.from(heroBadge, { x: -30, opacity: 0, duration: 0.7, ease: "power3.out" });
      }

      const heroDivider = containerRef.current?.querySelector("[data-hero-divider]");
      if (heroDivider) {
        gsap.from(heroDivider, { scaleX: 0, transformOrigin: "left", duration: 0.9, ease: "expo.out", delay: 0.6 });
      }

      gsap.from("[data-hero-para]", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.18,
        ease: "power3.out",
        delay: 0.5,
      });


      /* ── 3. QUOTE — letter reveal on scroll ── */
      const quoteEl = containerRef.current?.querySelector<HTMLElement>("[data-quote-text]");
      if (quoteEl) {
        const chars = splitIntoChars(quoteEl);
        gsap.from(chars, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          stagger: 0.012,
          ease: "power2.out",
          scrollTrigger: {
            trigger: quoteEl,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }

      /* sparkle icon spin */
      gsap.to("[data-sparkle]", {
        rotation: 360,
        duration: 12,
        repeat: -1,
        ease: "none",
      });

      /* Quote banner parallax bg */
      gsap.to("[data-quote-banner]", {
        backgroundPositionY: "30%",
        ease: "none",
        scrollTrigger: {
          trigger: "[data-quote-banner]",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      /* ── 4. VALUE CARDS — staggered flip-in ── */
      gsap.from("[data-value-card]", {
        y: 60,
        opacity: 0,
        rotateY: -15,
        transformOrigin: "left center",
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-values-grid]",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      /* icon pulse on scroll */
      gsap.to("[data-value-icon]", {
        scale: 1.15,
        duration: 0.7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { each: 0.4, from: "random" },
      });

      /* ── 5. TIMELINE — draw the vertical line + pop dots ── */
      gsap.from("[data-timeline-line]", {
        scaleY: 0,
        transformOrigin: "top center",
        duration: 2,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: "[data-timeline-line]",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from("[data-milestone]", {
        x: (i) => (i % 2 === 0 ? -60 : 60),
        opacity: 0,
        duration: 0.7,
        stagger: 0.2,
        ease: "back.out(1.4)",
        scrollTrigger: {
          trigger: "[data-milestone]:first-child",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from("[data-milestone-dot]", {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.2,
        ease: "back.out(2)",
        scrollTrigger: {
          trigger: "[data-timeline-line]",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      /* ── 6. STATS — animated counter + scale-in ── */
      const statEls = containerRef.current?.querySelectorAll<HTMLElement>("[data-stat-number]");
      statEls?.forEach((el, i) => {
        const target = STATS[i].value;
        const obj = { val: 0 };
        gsap.from(el.parentElement!, {
          scale: 0.7,
          opacity: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: "[data-stats-section]",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "[data-stats-section]",
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
          onUpdate() {
            el.textContent = Math.round(obj.val).toString();
          },
        });
      });

      /* ── 7. CLOSING paragraphs — blur-in ── */
      gsap.from("[data-closing-para]", {
        filter: "blur(8px)",
        opacity: 0,
        y: 30,
        duration: 1,
        stagger: 0.25,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-closing]",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from("[data-closing-badge]", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-closing-badge]",
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });

      /* ── 8. Section headings — clip wipe ── */
      gsap.utils.toArray<HTMLElement>("[data-section-title]").forEach((el) => {
        gsap.from(el, {
          clipPath: "inset(0 100% 0 0)",
          opacity: 0,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-section-badge]").forEach((el) => {
        gsap.from(el, {
          x: -20,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });
      });
    },
    { scope: containerRef }
  );

  /* ── Magnetic hover on value cards ── */
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>("[data-value-card]");
    const cleanup: (() => void)[] = [];

    cards.forEach((card) => {
      const onMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / rect.width;
        const dy = (e.clientY - cy) / rect.height;
        gsap.to(card, {
          x: dx * 8,
          y: dy * 8,
          rotateX: -dy * 4,
          rotateY: dx * 4,
          duration: 0.4,
          ease: "power2.out",
          transformPerspective: 600,
        });
      };
      const onLeave = () => {
        gsap.to(card, { x: 0, y: 0, rotateX: 0, rotateY: 0, duration: 0.6, ease: "elastic.out(1,0.5)" });
      };
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      cleanup.push(() => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => cleanup.forEach((fn) => fn());
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen pt-32 pb-24 relative overflow-x-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 20% 20%, rgba(200,160,60,0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(200,160,60,0.04) 0%, transparent 50%), #0A0A0A",
      }}
    >
      {/* Floating particles canvas — fixed, stays on screen */}
      <canvas
        id="about-particles"
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.6 }}
      />


      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-8 relative z-10">
        <p data-hero-badge className="text-gold-warm text-xs tracking-[0.2em] uppercase font-sans mb-4">
          Our Story
        </p>

        <h1
          data-hero-title
          className="font-display text-ivory font-light text-5xl mb-6"
          style={{ perspective: "600px" }}
        >
          About Fraviont
        </h1>

        <div data-hero-divider className="w-16 h-px bg-gold-warm mb-12" />

        <div className="space-y-8 text-parchment font-sans font-light text-base leading-relaxed">
          {[
            "Fraviont was born from a singular belief: that luxury is not about excess — it is about intention. Every perfume we blend, every cosmetic we formulate, and every piece of jewelry we craft is an act of devotion to the art of presence.",
            "Founded in 2024, Fraviont draws inspiration from the intersection of heritage craftsmanship and contemporary elegance. Our name — a fusion of \"fragrance\" and \"avant-garde\" — reflects our commitment to pushing boundaries while honouring the timeless traditions of luxury.",
            "Each Fraviont creation begins with a story. Our perfumers source the rarest ingredients from across the globe — oud from the forests of Assam, rose absolute from the valleys of Bulgaria, saffron from the fields of Iran. These precious materials are then composed into fragrances that transcend the ordinary and become deeply personal.",
          ].map((text, i) => (
            <p key={i} data-hero-para>
              {text}
            </p>
          ))}
        </div>
      </div>

      {/* ── Quote Banner ──────────────────────────────────────────── */}
      <div
        data-quote-banner
        className="my-24 py-20 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(200,160,60,0.08) 0%, transparent 50%, rgba(200,160,60,0.05) 100%), #0E0E0E",
          backgroundSize: "cover",
          backgroundPosition: "50% 0%",
        }}
      >
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-warm/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-warm/30 to-transparent" />

        <div className="max-w-3xl mx-auto px-8 text-center">
          <Sparkles data-sparkle size={28} className="text-gold-warm mx-auto mb-6 opacity-60" />

          <p
            data-quote-text
            className="font-display text-ivory text-2xl md:text-3xl font-light italic leading-relaxed mb-6"
          >
            &quot;We don&apos;t create products. We create moments of extraordinary presence.&quot;
          </p>

          <p className="text-ash text-xs tracking-[0.14em] uppercase">— The Fraviont Atelier</p>
        </div>
      </div>

      {/* ── Brand Values ──────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-8 mb-24">
        <div className="text-center mb-16">
          <p data-section-badge className="text-gold-warm text-xs tracking-[0.2em] uppercase font-sans mb-4">
            What We Stand For
          </p>
          <h2 data-section-title className="font-display text-ivory font-light text-3xl">
            Our Pillars
          </h2>
        </div>

        <div data-values-grid className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {VALUES.map((v, i) => (
            <div
              key={i}
              data-value-card
              className="flex gap-5 p-6 bg-[#111111] border border-[#1E1E1E] hover:border-gold-warm/30 transition-colors duration-500 group cursor-default"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                data-value-icon
                className="w-12 h-12 bg-gold-warm/10 flex items-center justify-center shrink-0 group-hover:bg-gold-warm/20 transition-colors duration-500"
              >
                <v.icon size={20} className="text-gold-warm" />
              </div>
              <div>
                <h3 className="text-ivory text-sm font-sans font-medium mb-2">{v.title}</h3>
                <p className="text-parchment text-sm font-sans font-light leading-relaxed">{v.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Milestone Timeline ────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-8 mb-24">
        <div className="text-center mb-16">
          <p data-section-badge className="text-gold-warm text-xs tracking-[0.2em] uppercase font-sans mb-4">
            Our Journey
          </p>
          <h2 data-section-title className="font-display text-ivory font-light text-3xl">
            Milestones
          </h2>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div
            data-timeline-line
            className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold-warm/40 via-gold-warm/15 to-transparent"
            style={{ transformOrigin: "top center" }}
          />

          <div className="space-y-12">
            {MILESTONES.map((m, i) => (
              <div
                key={i}
                data-milestone
                className={`flex items-start gap-6 relative ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Dot */}
                <div
                  data-milestone-dot
                  className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gold-warm border-2 border-obsidian z-10"
                  style={{ boxShadow: "0 0 12px rgba(200,160,60,0.5)" }}
                />

                {/* Content */}
                <div
                  className={`ml-14 md:ml-0 md:w-[calc(50%-2rem)] ${
                    i % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8 md:ml-auto"
                  }`}
                >
                  <span className="text-gold-warm text-xs tracking-[0.14em] uppercase font-sans">
                    {m.year}
                  </span>
                  <h3 className="text-ivory text-lg font-sans font-medium mt-1 mb-1">{m.label}</h3>
                  <p className="text-parchment text-sm font-sans font-light leading-relaxed">{m.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Numbers ───────────────────────────────────────────────── */}
      <div
        data-stats-section
        className="py-20 border-t border-b border-iron/20 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(200,160,60,0.04) 0%, transparent 40%, rgba(200,160,60,0.03) 100%), #0E0E0E",
        }}
      >
        {/* Animated horizontal scan line */}
        <div
          className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-warm/20 to-transparent pointer-events-none"
          style={{ animation: "scanLine 4s ease-in-out infinite" }}
        />

        <div className="max-w-5xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
          {STATS.map((s, i) => (
            <div key={i} className="group">
              <p className="font-display text-gold-warm text-4xl font-light mb-2 flex items-end justify-center gap-0.5">
                <span data-stat-number>0</span>
                <span>{s.suffix}</span>
              </p>
              <p className="text-ash text-xs tracking-[0.1em] uppercase font-sans">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Closing ───────────────────────────────────────────────── */}
      <div data-closing className="max-w-4xl mx-auto px-8 mt-24">
        <div className="space-y-8 text-parchment font-sans font-light text-base leading-relaxed">
          {[
            "Our cosmetics line extends this philosophy to skincare and beauty — formulations that marry cutting-edge science with luxurious textures and results. And our jewelry collection, handcrafted by master artisans, transforms precious metals and stones into wearable works of art.",
            "At Fraviont, we believe that what you wear and how you present yourself to the world is an expression of who you are at your finest. We are here to help you discover — and celebrate — that version of yourself.",
          ].map((text, i) => (
            <p key={i} data-closing-para>
              {text}
            </p>
          ))}
        </div>

        <div data-closing-badge className="flex items-center gap-3 mt-12">
          <Award size={18} className="text-gold-warm" />
          <p className="text-ash text-xs tracking-[0.14em] uppercase font-sans">
            Proudly South African · Globally Inspired
          </p>
        </div>
      </div>

      {/* Scan line keyframe */}
      <style>{`
        @keyframes scanLine {
          0%   { top: 0%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}