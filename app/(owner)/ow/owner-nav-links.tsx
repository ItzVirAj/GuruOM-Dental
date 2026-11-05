"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  History,
  Shield,
  Image as ImageIcon,
  Video,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  posts: FileText,
  media: ImageIcon,
  videos: Video,
  categories: FolderTree,
  activity: History,
  security: Shield,
};

export interface NavItemDef {
  label: string;
  href: string;
  iconKey: "dashboard" | "posts" | "media" | "videos" | "categories" | "activity" | "security";
}

interface OwnerNavLinksProps {
  items: NavItemDef[];
  mobile?: boolean;
}

export function OwnerNavLinks({ items, mobile = false }: OwnerNavLinksProps) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const Icon = ICON_MAP[item.iconKey] || LayoutDashboard;
        const isDashboard = item.iconKey === "dashboard";
        const isExact = pathname === item.href || (item.href.endsWith("/ow") && pathname === "/ow");
        const isSub = !isDashboard && pathname?.startsWith(item.href);
        const isActive = isExact || isSub;

        if (mobile) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs whitespace-nowrap min-h-[44px] transition-all duration-150 select-none ${
                isActive
                  ? "bg-white text-ink shadow-[0_1px_2.5px_rgba(0,0,0,0.08),0_0.5px_1px_rgba(0,0,0,0.04)] font-semibold"
                  : "text-ink-muted/80 hover:text-ink hover:bg-black/[0.04] active:bg-black/[0.08] font-medium"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={`w-3.5 h-3.5 transition-colors ${
                  isActive ? "text-ink stroke-[2]" : "text-ink-muted/80 stroke-[1.75]"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] tracking-tight transition-all duration-150 focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-1 focus-visible:outline-none select-none ${
              isActive
                ? "bg-white text-ink shadow-[0_1px_2.5px_rgba(0,0,0,0.08),0_0.5px_1px_rgba(0,0,0,0.04)] font-medium"
                : "text-ink-muted/80 hover:text-ink hover:bg-black/[0.03] active:bg-black/[0.06] font-normal"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon
              className={`w-3.5 h-3.5 transition-colors ${
                isActive ? "text-ink stroke-[2]" : "text-ink-muted/70 stroke-[1.75]"
              }`}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}
