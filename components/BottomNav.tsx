"use client";

import type { LucideIcon } from "lucide-react";
import { CalendarDays, Home, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type TabId = "home" | "history" | "settings";

interface NavItem {
  id: TabId;
  label: string;
  path: string;
  Icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", path: "/home", Icon: Home },
  { id: "history", label: "Stats", path: "/history", Icon: CalendarDays },
  { id: "settings", label: "Settings", path: "/settings", Icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 bg-background/95 backdrop-blur shadow-[0_-1px_12px_rgba(0,0,0,0.06)] pb-safe">
      {NAV_ITEMS.map(({ id, label, path, Icon }) => {
        const isActive = pathname === path;
        return (
          <Link
            key={id}
            href={path}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.75} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
