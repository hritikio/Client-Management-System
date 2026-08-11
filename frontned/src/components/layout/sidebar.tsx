"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UsersRound, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn, initials } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-ink text-paper lg:flex">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-paper/20 bg-paper/5">
          <span className="font-display text-[15px] font-semibold text-brass">L</span>
        </div>
        <div>
          <p className="font-display text-[15px] font-medium leading-tight text-paper">Ledger</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/40">
            Client System
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors",
                active ? "bg-paper/10 text-paper" : "text-paper/55 hover:bg-paper/5 hover:text-paper/90"
              )}
            >
              <item.icon className="h-[16px] w-[16px]" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}

        {user?.role === "ADMIN" && (
          <Link
            href="/users"
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors",
              pathname.startsWith("/users")
                ? "bg-paper/10 text-paper"
                : "text-paper/55 hover:bg-paper/5 hover:text-paper/90"
            )}
          >
            <UsersRound className="h-[16px] w-[16px]" strokeWidth={2} />
            Team
          </Link>
        )}
      </nav>

      <div className="border-t border-paper/10 px-3 py-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/25 font-mono text-[11px] font-medium text-paper">
            {user ? initials(user.name) : ""}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-paper">{user?.name}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-paper/40">
              {user?.role}
            </p>
          </div>
          <button
            onClick={logout}
            aria-label="Sign out"
            className="rounded-md p-1.5 text-paper/40 transition-colors hover:bg-paper/10 hover:text-paper"
          >
            <LogOut className="h-[15px] w-[15px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
