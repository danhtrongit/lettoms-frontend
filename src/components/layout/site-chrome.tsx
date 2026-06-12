"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import type { NavItem, NavColumn } from "@/types";

interface SiteChromeProps {
  children: React.ReactNode;
  announcement?: { enabled: boolean; text: string; href?: string };
  nav?: { headerNav: NavItem[]; footerColumns: NavColumn[] };
}

/**
 * Conditionally renders the storefront chrome.
 * Admin routes render bare (their own layout provides the shell).
 * `children` are passed through untouched, so server components stay server-rendered.
 */
export function SiteChrome({ children, announcement, nav }: SiteChromeProps) {
  const pathname = usePathname();
  const bare = pathname.startsWith("/admin");

  if (bare) return <>{children}</>;

  return (
    <>
      <AnnouncementBar
        message={announcement?.text}
        href={announcement?.href}
        enabled={announcement?.enabled ?? true}
      />
      <SiteHeader headerNav={nav?.headerNav} />
      <main className="flex-1">{children}</main>
      <SiteFooter footerColumns={nav?.footerColumns} />
    </>
  );
}
