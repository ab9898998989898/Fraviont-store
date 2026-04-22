"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useState } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/orders": "Orders",
  "/admin/products": "Products",
  "/admin/inventory": "Inventory",
  "/admin/analytics": "Analytics",
  "/admin/customers": "Customers",
  "/admin/settings": "Settings",
};

export function AdminHeader() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const title =
    Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1] ??
    "Admin";

  return (
    <header className="h-16 bg-[#111111] border-b border-[#1E1E1E] flex items-center justify-between px-8 flex-shrink-0">
      <h1 className="text-ivory text-sm tracking-[0.1em] uppercase font-sans font-medium">
        {title}
      </h1>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-2 text-parchment hover:text-ivory transition-colors"
        >
          <div className="w-7 h-7 bg-graphite border border-iron flex items-center justify-center">
            <User size={14} />
          </div>
          <ChevronDown size={14} />
        </button>

        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-40 bg-[#1a1a1a] border border-iron z-20">
              <button
                onClick={() => void signOut({ callbackUrl: "/admin/login" })}
                className="flex items-center gap-2 w-full px-4 py-3 text-ash text-sm font-sans hover:text-ivory hover:bg-graphite transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
