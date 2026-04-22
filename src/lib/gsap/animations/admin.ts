import { gsap } from "@/lib/gsap/config";
import { EASE } from "@/lib/gsap/easings";
import { countUp } from "./textEffects";

export function animateKPICards(cards: HTMLElement[]) {
  gsap.fromTo(
    cards,
    { opacity: 0, y: 30, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: EASE.enter }
  );

  cards.forEach((card) => {
    const valueEl = card.querySelector<HTMLElement>(".kpi-value");
    if (valueEl) {
      const raw = parseFloat(valueEl.dataset.value ?? "0");
      countUp(valueEl, raw);
    }
  });
}

export function animateChartReveal(chartWrapper: HTMLElement) {
  gsap.fromTo(
    chartWrapper,
    { opacity: 0, clipPath: "inset(0 100% 0 0)" },
    {
      opacity: 1,
      clipPath: "inset(0 0% 0 0)",
      duration: 1.2,
      ease: "power2.inOut",
      scrollTrigger: { trigger: chartWrapper, start: "top 80%" },
    }
  );
}
