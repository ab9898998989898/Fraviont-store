"use client";

import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { SessionProvider } from "next-auth/react";
import { type Session } from "next-auth";
import { useState } from "react";

export function AdminShell({ children, session }: { children: React.ReactNode; session: Session | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen bg-[#0A0A0A] overflow-hidden">
        <AdminSidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen} 
        />
        <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-y-auto">
          <AdminHeader setMobileMenuOpen={setMobileMenuOpen} />
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
