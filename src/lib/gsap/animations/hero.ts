import { gsap } from "@/lib/gsap/config";
import { EASE } from "@/lib/gsap/easings";

interface HeroRefs {
  headline: HTMLElement;
  subheadline?: HTMLElement;
  divider?: HTMLElement;
  ctaButtons?: HTMLElement[];
  scrollIndicator?: HTMLElement;
}

export function animateHero(refs: HeroRefs) {
  const tl = gsap.timeline({ delay: 0.3 });

  tl.fromTo(
    refs.headline,
    { y: 80, opacity: 0, clipPath: "inset(100% 0% 0% 0%)" },
    { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: EASE.luxury }
  );

  if (refs.subheadline) {
    tl.fromTo(
      refs.subheadline,
      { opacity: 0, letterSpacing: "0.4em" },
      { opacity: 1, letterSpacing: "0.16em", duration: 1.1, ease: EASE.text },
      "-=0.7"
    );
  }

  if (refs.divider) {
    tl.fromTo(
      refs.divider,
      { scaleX: 0, transformOrigin: "left" },
      { scaleX: 1, duration: 0.8, ease: "power2.inOut" },
      "-=0.5"
    );
  }

  if (refs.ctaButtons && refs.ctaButtons.length > 0) {
    tl.fromTo(
      refs.ctaButtons,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: EASE.enter },
      "-=0.4"
    );
  }

  if (refs.scrollIndicator) {
    tl.fromTo(
      refs.scrollIndicator,
      { opacity: 0 },
      { opacity: 0.6, duration: 0.5 },
      "-=0.2"
    );
  }

  return tl;
}
