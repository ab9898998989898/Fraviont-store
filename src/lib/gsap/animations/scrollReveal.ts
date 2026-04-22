import { gsap, ScrollTrigger } from "@/lib/gsap/config";
import { EASE } from "@/lib/gsap/easings";

export function revealSection(el: HTMLElement, options?: gsap.TweenVars) {
  return gsap.fromTo(
    el,
    { opacity: 0, y: 60 },
    {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: EASE.luxury,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
      ...options,
    }
  );
}

export function revealStagger(els: HTMLElement[], options?: gsap.TweenVars) {
  if (!els.length) return;
  return gsap.fromTo(
    els,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 0.85,
      stagger: 0.1,
      ease: EASE.enter,
      scrollTrigger: {
        trigger: els[0],
        start: "top 85%",
      },
      ...options,
    }
  );
}

export function horizontalScroll(track: HTMLElement, wrapper: HTMLElement) {
  gsap.to(track, {
    x: () => -(track.scrollWidth - wrapper.offsetWidth),
    ease: "none",
    scrollTrigger: {
      trigger: wrapper,
      start: "top top",
      end: () => `+=${track.scrollWidth - wrapper.offsetWidth}`,
      scrub: 1.2,
      pin: true,
    },
  });
}

export { ScrollTrigger };
