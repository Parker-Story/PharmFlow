"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, Settings, LogOut, PawPrint, Trophy, Bug } from "lucide-react";
import { PharmacyIcon } from "@/components/ui/pharmacy-icon";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/break", label: "Need a Break?", icon: PawPrint },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="print:hidden sticky top-0 h-screen w-60 shrink-0 flex flex-col z-30"
      style={{ backgroundColor: "hsl(var(--navbar))" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
          <PharmacyIcon className="h-4 w-4 text-white" strokeWidth={2} />
        </div>
        <span className="text-lg font-bold text-white">PharmFlow</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(href)
                ? "text-white"
                : "text-white/65 hover:text-white hover:bg-white/10"
            )}
            style={isActive(href) ? { backgroundColor: "hsl(var(--nav-active))" } : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom — settings + sign out */}
      <div className="px-3 py-4 space-y-0.5 border-t border-white/10 shrink-0">
        <Link
          href="/report-bug"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            isActive("/report-bug")
              ? "text-white"
              : "text-white/65 hover:text-white hover:bg-white/10"
          )}
          style={isActive("/report-bug") ? { backgroundColor: "hsl(var(--nav-active))" } : undefined}
        >
          <Bug className="h-4 w-4 shrink-0" />
          Report a Bug
        </Link>

        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            isActive("/settings")
              ? "text-white"
              : "text-white/65 hover:text-white hover:bg-white/10"
          )}
          style={isActive("/settings") ? { backgroundColor: "hsl(var(--nav-active))" } : undefined}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </Link>

        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
