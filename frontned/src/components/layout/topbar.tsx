"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UsersRound, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
];

export function Topbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ink">
            <span className="font-display text-[13px] font-semibold text-brass">L</span>
          </div>
          <span className="font-display text-[15px] font-medium text-ink">Ledger</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-2 text-ink-soft hover:bg-paper"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-ink text-paper">
            <div className="flex items-center justify-between px-5 py-5">
              <span className="font-display text-[15px] font-medium">Ledger</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-paper/60">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 px-3">
              {NAV_ITEMS.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[14px] font-medium",
                      active ? "bg-paper/10 text-paper" : "text-paper/60"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              {user?.role === "ADMIN" && (
                <Link
                  href="/users"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[14px] font-medium",
                    pathname.startsWith("/users") ? "bg-paper/10 text-paper" : "text-paper/60"
                  )}
                >
                  <UsersRound className="h-4 w-4" />
                  Team
                </Link>
              )}
            </nav>
            <div className="border-t border-paper/10 px-3 py-3">
              <button
                onClick={logout}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-[14px] font-medium text-paper/60"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
