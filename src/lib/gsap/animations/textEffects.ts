import { gsap } from "@/lib/gsap/config";
import { EASE } from "@/lib/gsap/easings";

export function charReveal(el: HTMLElement) {
  const text = el.textContent ?? "";
  el.innerHTML = text
    .split("")
    .map(
      (c) =>
        `<span style="display:inline-block;overflow:hidden"><span class="char">${c === " " ? "&nbsp;" : c}</span></span>`
    )
    .join("");

  return gsap.fromTo(
    el.querySelectorAll(".char"),
    { y: "100%" },
    { y: "0%", duration: 0.6, stagger: 0.025, ease: EASE.luxury }
  );
}

export function countUp(el: HTMLElement, endValue: number, prefix = "") {
  const obj = { value: 0 };
  return gsap.to(obj, {
    value: endValue,
    duration: 1.4,
    ease: EASE.gold,
    onUpdate() {
      el.textContent = prefix + Math.round(obj.value).toLocaleString();
    },
  });
}

export function goldShimmer(el: HTMLElement) {
  gsap.to(el, {
    backgroundPosition: "200% center",
    duration: 2.5,
    ease: "none",
    repeat: -1,
    repeatDelay: 3,
  });
}
