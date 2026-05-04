"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const subscribeMutation = api.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      setStatus("success");
      setEmail("");
      if (data.alreadySubscribed) {
        // Still show success — no need to reveal internal state
      }
    },
    onError: () => {
      setStatus("error");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || subscribeMutation.isPending) return;
    setStatus("idle");
    subscribeMutation.mutate({ email: email.trim() });
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    // Clear the error message immediately when the user starts typing again
    if (status === "error") {
      setStatus("idle");
    }
  }

  return (
    <section className="py-24 px-8">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="font-display text-ivory font-light text-4xl mb-4">
          The Inner Circle
        </h2>
        <p className="text-parchment font-sans font-light text-base mb-8">
          Early access, exclusive offers, and the stories behind our collections.
        </p>

        {status === "success" ? (
          <div className="py-4">
            <p className="text-gold-warm text-sm font-sans font-light tracking-wide">
              Welcome to the Circle. Check your inbox for a note from us.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-0">
            <input
              type="email"
              value={email}
              name="email"
              onChange={handleEmailChange}
              placeholder="Your email address"
              required
              className="flex-1 bg-transparent border border-iron text-ivory text-sm font-sans font-light px-4 py-3 placeholder:text-ash focus:outline-none focus:border-gold-antique transition-colors"
            />
            <button
              type="submit"
              disabled={subscribeMutation.isPending}
              className="bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium px-8 py-3 hover:bg-gold-bright transition-colors duration-300 disabled:opacity-60"
            >
              {subscribeMutation.isPending ? "..." : "Subscribe"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="text-red-400 text-xs font-sans mt-3">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </section>
  );
}