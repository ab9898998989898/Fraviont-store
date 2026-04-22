import { gsap } from "@/lib/gsap/config";
import { EASE } from "@/lib/gsap/easings";

export function animateScentNotes(container: HTMLElement) {
  const rings = container.querySelectorAll<HTMLElement>(".scent-ring");
  const labels = container.querySelectorAll<HTMLElement>(".scent-label");

  const tl = gsap.timeline({
    scrollTrigger: { trigger: container, start: "top 75%" },
  });

  if (rings.length > 0) {
    tl.fromTo(
      rings,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, stagger: 0.2, ease: EASE.elastic }
    );
  }

  if (labels.length > 0) {
    tl.fromTo(
      labels,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: EASE.enter },
      "-=0.4"
    );
  }
}
