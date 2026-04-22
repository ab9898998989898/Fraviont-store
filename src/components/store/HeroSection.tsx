"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/config";
import { animateHero } from "@/lib/gsap/animations/hero";
import { magneticButton } from "@/lib/gsap/animations/productCard";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const ctaSecondaryRef = useRef<HTMLAnchorElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const story1Ref = useRef<HTMLDivElement>(null);
  const story2Ref = useRef<HTMLDivElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useGSAP(
    () => {
      if (!headlineRef.current) return;
      
      // Initial load animations
      animateHero({
        headline: headlineRef.current,
        subheadline: subheadlineRef.current ?? undefined,
        divider: dividerRef.current ?? undefined,
        ctaButtons: [ctaRef.current, ctaSecondaryRef.current].filter(Boolean) as HTMLElement[],
        scrollIndicator: scrollIndicatorRef.current ?? undefined,
      });
      if (ctaRef.current) magneticButton(ctaRef.current);

      // Pinned timeline controlling content fades and video "camera" transforms
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=2000",
          scrub: 1.5, // Keeps the buttery smooth easing
          pin: true,
        },
      });

      // 1. Simulate camera movement (Zoom and Pan) on the playing video
      // Using scale and yPercent is hardware-accelerated and ultra-smooth
      tl.to(videoRef.current, { scale: 1.2, yPercent: 5, ease: "none", duration: 5 }, 0);

      // 2. Fade out initial hero text
      tl.to(contentRef.current, { y: -80, opacity: 0, duration: 1 }, 0)
        
        // 3. Fade in first story text
        .to(story1Ref.current, { opacity: 1, y: -20, duration: 1 })
        .to(story1Ref.current, { opacity: 0, y: -40, duration: 1 })
        
        // 4. Fade in second story text
        .to(story2Ref.current, { opacity: 1, y: -20, duration: 1 })
        .to(story2Ref.current, { opacity: 0, y: -40, duration: 1 });

    },
    { scope: containerRef }
  );

  // Fallback to ensure video plays (especially after React hydration)
  // and to force visibility if the video was already cached by the browser
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((e) => console.log("Autoplay prevented:", e));
      if (videoRef.current.readyState >= 3) {
        setVideoLoaded(true);
      }
    }
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-screen bg-obsidian overflow-hidden"
    >
      {/* Animated gradient fallback */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: videoLoaded ? 0 : 1,
          transition: "opacity 0.4s ease",
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(200,160,60,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(200,160,60,0.05) 0%, transparent 60%)",
          animation: "heroGlow 8s ease-in-out infinite alternate",
        }}
      />

      {/* Background video - Now plays continuously and loops */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{
          opacity: videoLoaded ? 0.3 : 0,
          transition: "opacity 0.4s ease",
          transformOrigin: "center center"
        }}
        src="/hero-bg.mp4"
        preload="auto"
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setVideoLoaded(true)}
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian/70 via-obsidian/50 to-obsidian pointer-events-none" />

      {/* Story Text 1 */}
      <div ref={story1Ref} className="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none px-8 z-10">
        <h2 className="font-display text-ivory font-light text-3xl md:text-5xl max-w-3xl text-center leading-snug">
          A Legacy of Uncompromising Craftsmanship.
        </h2>
      </div>

      {/* Story Text 2 */}
      <div ref={story2Ref} className="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none px-8 z-10">
        <h2 className="font-display text-ivory font-light text-3xl md:text-5xl max-w-3xl text-center leading-snug">
          Forged from the World&apos;s Rarest Elements.
        </h2>
      </div>

      {/* Initial Hero Content */}
      <div className="absolute inset-0 h-screen flex flex-col items-center justify-center px-8 z-20 pointer-events-none">
        <div ref={contentRef} className="text-center max-w-5xl mx-auto pointer-events-auto">
          <h1
            ref={headlineRef}
            className="font-display text-ivory font-light leading-none mb-4"
            style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)", letterSpacing: "-0.02em" }}
          >
            The Art of Presence
          </h1>

          <p
            ref={subheadlineRef}
            className="font-sans text-parchment font-light text-lg mb-6 max-w-xl mx-auto"
            style={{ letterSpacing: "0.16em" }}
          >
            Luxury perfumes, cosmetics &amp; jewelry for the discerning
          </p>

          <div
            ref={dividerRef}
            className="w-24 h-px bg-gold-warm mx-auto mb-6"
            style={{ transformOrigin: "left" }}
          />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              ref={ctaRef}
              href="/shop"
              className="inline-block bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium px-10 py-4 hover:bg-gold-bright transition-colors duration-300"
            >
              Explore Collection
            </Link>
            <Link
              ref={ctaSecondaryRef}
              href="/quiz"
              className="inline-block bg-transparent text-gold-warm text-xs tracking-[0.14em] uppercase font-sans font-medium px-10 py-4 border border-gold-warm hover:bg-gold-warm hover:text-obsidian transition-colors duration-300 pointer-events-auto"
            >
              Find Your Scent
            </Link>
          </div>
        </div>

        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto"
        >
          <span className="text-ash text-[10px] tracking-[0.2em] uppercase font-sans">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-ash to-transparent" />
        </div>
      </div>
    </section>
  );
}