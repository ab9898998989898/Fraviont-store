"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid credentials. Access restricted to administrators.");
    } else {
      router.push("/admin/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-8">
      <div className="w-full max-w-sm space-y-8">
        {/* Brand */}
        <div className="text-center space-y-2">
          <p className="font-accent text-ivory text-xl tracking-[0.2em] uppercase">
            FRAVIONT
          </p>
          <p className="text-ash text-xs tracking-[0.2em] uppercase font-sans">
            Admin Portal
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="border border-crimson/40 bg-crimson/10 px-4 py-3">
            <p className="text-crimson text-xs font-sans text-center">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
            <input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border border-iron text-ivory text-sm font-sans font-light pl-11 pr-4 py-3 placeholder:text-ash focus:outline-none focus:border-gold-antique transition-colors"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border border-iron text-ivory text-sm font-sans font-light pl-11 pr-4 py-3 placeholder:text-ash focus:outline-none focus:border-gold-antique transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium py-4 hover:bg-gold-bright transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p className="text-ash text-xs font-sans text-center">
          Access restricted to authorized administrators only.
        </p>
      </div>
    </div>
  );
}
