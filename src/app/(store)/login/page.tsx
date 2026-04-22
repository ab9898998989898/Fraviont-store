"use client";

import { useRef } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/config";
import { Chrome } from "lucide-react";

export default function CustomerLoginPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!cardRef.current) return;
      gsap.from(cardRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-obsidian flex items-center justify-center px-8 pt-24"
    >
      <div ref={cardRef} className="w-full max-w-sm space-y-10">
        {/* Brand */}
        <div className="text-center space-y-3">
          <Link href="/" className="font-accent text-ivory text-2xl tracking-[0.2em] uppercase">
            FRAVIONT
          </Link>
          <p className="text-parchment text-sm font-sans font-light" style={{ letterSpacing: "0.12em" }}>
            Welcome back. Sign in to continue.
          </p>
          <div className="w-16 h-px bg-gold-warm mx-auto" />
        </div>

        {/* Google Sign In */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/account" })}
          className="w-full flex items-center justify-center gap-3 bg-transparent text-ivory text-xs tracking-[0.14em] uppercase font-sans font-medium px-6 py-4 border border-iron hover:border-gold-antique hover:text-gold-warm transition-colors duration-300 cursor-pointer"
        >
          <Chrome size={16} />
          Continue with Google
        </button>

        <div className="text-center space-y-4">
          <p className="text-ash text-xs font-sans font-light">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-parchment hover:text-gold-warm transition-colors underline underline-offset-4">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-parchment hover:text-gold-warm transition-colors underline underline-offset-4">
              Privacy Policy
            </Link>
          </p>
          <Link
            href="/"
            className="inline-block text-ash text-xs tracking-[0.14em] uppercase font-sans hover:text-gold-warm transition-colors"
          >
            ← Return to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
