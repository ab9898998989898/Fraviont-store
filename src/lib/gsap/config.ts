import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
  ScrollTrigger.defaults({
    toggleActions: "play none none reverse",
    start: "top 88%",
  });
}

export { gsap, ScrollTrigger };
