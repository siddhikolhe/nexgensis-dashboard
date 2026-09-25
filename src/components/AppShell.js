"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";

function useClickOutside(onOutside) {
  const ref = useRef(null);
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

export default function AppShell({ title, subtitle, actions, children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useClickOutside(() => setMenuOpen(false));

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex items-center gap-3 border-b bg-white px-4 py-3 sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md border p-1.5 text-gray-600 md:hidden"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          <div className="min-w-0 flex-1">
            {title && <h1 className="truncate text-lg font-semibold text-gray-900">{title}</h1>}
            {subtitle && <p className="truncate text-xs text-gray-500">{subtitle}</p>}
          </div>

          {actions}

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border px-2 py-1.5 text-sm hover:bg-gray-50"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">
                {(user?.username || "?").slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden text-gray-700 sm:inline">{user?.username}</span>
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-gray-400">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-30 mt-2 w-40 rounded-lg border bg-white py-1 shadow-lg">
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
