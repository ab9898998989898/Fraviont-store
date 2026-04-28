"use client";

import { type Session } from "next-auth";

export function AdminShell({ children }: { children: React.ReactNode; session?: Session | null }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-ivory p-8">
      {children}
    </div>
  );
}
