"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ICONS = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <path d="M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6ZM13 9h8V3h-8v6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <path d="M21 8 12 3 3 8m18 0-9 5m9-5v9l-9 5m0-9L3 8m9 5v9M3 8v9l9 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  cube: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 shrink-0">
      <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3 7l9 5 9-5M12 12v10" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard", match: "/dashboard" },
  { label: "Products", href: "/products", icon: "products", match: "/products" },
];

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved === "1") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      localStorage.setItem("sidebarCollapsed", !prev ? "1" : "0");
      return !prev;
    });
  }

  const isActive = (item) => item.match && pathname.startsWith(item.match);

  const content = (
    <div
      className={`flex h-full flex-col bg-gradient-to-b from-sky-600 to-sky-500 text-sky-50 transition-all duration-200 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 border-b border-white/15 px-4 py-4">
        <span className="text-white">{ICONS.cube}</span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">Product Admin</p>
            <p className="truncate text-[11px] text-sky-100/80">Nexgensis Dashboard</p>
          </div>
        )}
        <button
          onClick={onCloseMobile}
          className="ml-auto rounded p-1 text-white/80 hover:bg-white/10 md:hidden"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onCloseMobile}
            title={collapsed ? item.label : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive(item)
                ? "bg-white text-sky-700 shadow-sm"
                : "text-sky-50 hover:bg-white/10"
            }`}
          >
            {ICONS[item.icon]}
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <button
        onClick={toggleCollapsed}
        className="mx-3 mb-3 hidden items-center justify-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-medium text-white/90 hover:bg-white/10 md:flex"
      >
        <span className={`transition-transform ${collapsed ? "rotate-180" : ""}`}>
          {ICONS.chevron}
        </span>
        {!collapsed && "Collapse"}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block">{content}</div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onCloseMobile}
          />
          <div className="absolute inset-y-0 left-0 z-50 w-64">{content}</div>
        </div>
      )}
    </>
  );
}
