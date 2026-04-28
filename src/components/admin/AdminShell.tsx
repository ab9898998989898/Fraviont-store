"use client";

import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    // If the session has an error or is missing required fields (could be handled via middleware too)
    // Here we mainly rely on TRPC procedures throwing SESSION_INVALIDATED
  }, [session]);

  return (
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
  );
}
