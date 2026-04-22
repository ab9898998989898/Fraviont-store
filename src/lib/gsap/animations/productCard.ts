import { gsap } from "@/lib/gsap/config";
import { EASE } from "@/lib/gsap/easings";

export function setupCardHover(card: HTMLElement) {
  const image = card.querySelector(".card-image") as HTMLElement | null;
  const overlay = card.querySelector(".card-overlay") as HTMLElement | null;
  const info = card.querySelector(".card-info") as HTMLElement | null;

  const enterTl = gsap.timeline({ paused: true });

  if (image) enterTl.to(image, { scale: 1.06, duration: 0.7, ease: EASE.hover });
  if (overlay) enterTl.to(overlay, { opacity: 1, duration: 0.4, ease: EASE.hover }, "<");
  if (info) enterTl.to(info, { y: -6, duration: 0.5, ease: EASE.hover }, "<0.1");

  card.addEventListener("mouseenter", () => enterTl.play());
  card.addEventListener("mouseleave", () => enterTl.reverse());
}

export function magneticButton(btn: HTMLElement, strength = 0.4) {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    gsap.to(btn, {
      x: dx * strength,
      y: dy * strength,
      duration: 0.4,
      ease: EASE.hover,
    });
  });
  btn.addEventListener("mouseleave", () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: EASE.elastic });
  });
}
