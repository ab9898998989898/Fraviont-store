"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/config";
import { EASE } from "@/lib/gsap/easings";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";

const QUIZ_STEPS = [
  {
    id: "occasion",
    question: "When do you wear fragrance?",
    options: ["Daily, all day", "Special occasions", "Work & professional settings", "Evenings & nights out"],
  },
  {
    id: "mood",
    question: "What mood do you want your scent to evoke?",
    options: ["Calm & grounded", "Bold & confident", "Romantic & sensual", "Fresh & energised"],
  },
  {
    id: "preference",
    question: "Which scent family appeals to you most?",
    options: ["Floral & feminine", "Woody & earthy", "Fresh & citrus", "Oriental & spicy"],
  },
  {
    id: "intensity",
    question: "How would you describe your ideal scent intensity?",
    options: ["Subtle & close to skin", "Moderate & balanced", "Bold & long-lasting", "Varies by mood"],
  },
];

interface QuizResult {
  profile: string;
  recommendations: string[];
}

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);

  const generateProfileMutation = api.ai.generateProfile.useMutation({
    onSuccess: (data) => {
      setResult({ profile: data.profile, recommendations: data.recommendations });
    },
  });

  function animateStepTransition(direction: "forward" | "back", callback: () => void) {
    if (!stepRef.current) { callback(); return; }
    const xOut = direction === "forward" ? -40 : 40;
    const xIn = direction === "forward" ? 40 : -40;
    gsap.to(stepRef.current, {
      x: xOut, opacity: 0, duration: 0.3, ease: EASE.exit,
      onComplete: () => {
        callback();
        gsap.fromTo(stepRef.current, { x: xIn, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: EASE.enter });
      },
    });
  }

  function handleAnswer(answer: string) {
    const currentStep = QUIZ_STEPS[step];
    if (!currentStep) return;
    const newAnswers = { ...answers, [currentStep.id]: answer };
    setAnswers(newAnswers);

    if (step < QUIZ_STEPS.length - 1) {
      animateStepTransition("forward", () => setStep((s) => s + 1));
    } else {
      // Submit quiz
      generateProfileMutation.mutate({
        answers: newAnswers,
        products: ["Fraviont Oud Noir", "Rose Absolue", "Citrus Bloom", "Amber Dusk", "Cedar & Vetiver"],
      });
      animateStepTransition("forward", () => setStep(QUIZ_STEPS.length));
    }
  }

  const currentStep = QUIZ_STEPS[step];
  const progress = (step / QUIZ_STEPS.length) * 100;

  // Suppress unused warning — useGSAP is used for potential future entrance animation
  useGSAP(() => {
    // Container entrance
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen pt-32 pb-24 px-8 flex flex-col items-center">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-gold-warm text-xs tracking-[0.2em] uppercase font-sans mb-3">
            Scent Discovery
          </p>
          <h1 className="font-display text-ivory font-light text-4xl">
            Find Your Signature
          </h1>
        </div>

        {/* Progress bar */}
        {step < QUIZ_STEPS.length && (
          <div className="mb-10">
            <div className="h-px bg-iron w-full">
              <div
                className="h-px bg-gold-warm transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-ash text-xs font-sans mt-2 text-right">
              {step + 1} of {QUIZ_STEPS.length}
            </p>
          </div>
        )}

        {/* Quiz step */}
        {step < QUIZ_STEPS.length && currentStep && (
          <div ref={stepRef} className="space-y-6">
            <h2 className="font-display text-ivory font-light text-2xl text-center">
              {currentStep.question}
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {currentStep.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className="text-left px-6 py-4 border border-iron text-parchment text-sm font-sans font-light hover:border-gold-antique hover:text-ivory hover:bg-charcoal/50 transition-all duration-200"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {step === QUIZ_STEPS.length && generateProfileMutation.isPending && (
          <div className="text-center space-y-4 py-12">
            <Loader2 size={32} className="text-gold-warm animate-spin mx-auto" />
            <p className="text-parchment font-sans font-light text-base">
              Sophia is crafting your scent profile...
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-8">
            <div className="border-l-2 border-gold-warm pl-6 space-y-3">
              <p className="text-gold-warm text-xs tracking-[0.2em] uppercase font-sans">
                Your Scent Profile
              </p>
              <p className="font-display text-ivory font-light text-xl leading-relaxed">
                {result.profile}
              </p>
            </div>

            {result.recommendations.length > 0 && (
              <div className="space-y-4">
                <p className="text-ash text-xs tracking-[0.14em] uppercase font-sans">
                  Recommended for You
                </p>
                <div className="space-y-2">
                  {result.recommendations.map((rec) => (
                    <div key={rec} className="flex items-center gap-3 py-3 border-b border-iron/50">
                      <div className="w-1.5 h-1.5 bg-gold-warm shrink-0" />
                      <span className="text-parchment text-sm font-sans font-light">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <a
                href="/shop"
                className="inline-block bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium px-8 py-4 hover:bg-gold-bright transition-colors"
              >
                Explore Collection
              </a>
              <button
                onClick={() => { setStep(0); setAnswers({}); setResult(null); }}
                className="text-ash text-xs tracking-[0.14em] uppercase font-sans hover:text-ivory transition-colors"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
