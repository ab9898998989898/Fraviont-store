"use client";

import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { SessionProvider } from "next-auth/react";
import { type Session } from "next-auth";
import { useState } from "react";

export function AdminShell({ children, session }: { children: React.ReactNode; session: Session | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-ivory p-8">
      {children}
    </div>
  );
}
