import { gsap, ScrollTrigger } from "@/lib/gsap/config";
import { EASE } from "@/lib/gsap/easings";

export function openMobileMenu(overlay: HTMLElement, links: HTMLElement[]) {
  const tl = gsap.timeline();
  tl.to(overlay, { opacity: 1, pointerEvents: "all", duration: 0.4, ease: "power2.out" });
  if (links.length > 0) {
    tl.fromTo(
      links,
      { x: -40, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.07, duration: 0.5, ease: EASE.enter },
      "-=0.2"
    );
  }
  return tl;
}

export function setupNavScroll(nav: HTMLElement) {
  ScrollTrigger.create({
    start: "top -80px",
    end: "max",
    onEnter: () =>
      gsap.to(nav, {
        backgroundColor: "rgba(17,17,17,0.96)",
        backdropFilter: "blur(12px)",
        duration: 0.4,
      }),
    onLeaveBack: () =>
      gsap.to(nav, {
        backgroundColor: "transparent",
        backdropFilter: "blur(0px)",
        duration: 0.4,
      }),
  });
}
