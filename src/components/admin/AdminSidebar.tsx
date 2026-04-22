"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Users,
  Settings,
  Boxes,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="flex-shrink-0 flex flex-col bg-[#111111] border-r border-[#1E1E1E] transition-all duration-300"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Brand */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[#1E1E1E]">
        {!collapsed && (
          <div>
            <p className="font-accent text-ivory text-sm tracking-[0.2em] uppercase">
              FRAVIONT
            </p>
            <p className="text-ash text-[10px] tracking-[0.2em] uppercase font-sans mt-0.5">
              ADMIN
            </p>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-ash hover:text-ivory transition-colors ml-auto"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-sans font-light transition-colors duration-200 relative ${
                isActive
                  ? "text-gold-warm bg-[#1a1a1a] border-l-2 border-gold-warm"
                  : "text-ash hover:text-parchment hover:bg-[#161616] border-l-2 border-transparent"
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
