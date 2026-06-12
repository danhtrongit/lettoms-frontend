"use client";

import * as React from "react";
import Link from "next/link";
import { HeartIcon, ShoppingBagIcon, UserIcon } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { SearchOverlay } from "./search-overlay";
import { Button } from "@/components/ui/button";
import { useCart, selectCartCount } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useHydrated } from "@/hooks/use-hydrated";

function CountBadge({ count }: { count: number }) {
  const mounted = useHydrated();
  if (!mounted || count === 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function SiteHeader() {
  const cartCount = useCart(selectCartCount);
  const wishlistCount = useWishlist((s) => s.ids.length);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 has-[[data-nav-open]]:border-b-transparent has-[[data-nav-open]]:bg-background has-[[data-nav-open]]:backdrop-blur-none supports-[backdrop-filter]:has-[[data-nav-open]]:bg-background">
      <div className="container-page flex h-16 items-center gap-2">
        {/* Left zone: hamburger — mobile only, flex-1 to balance the centered logo */}
        <div className="flex flex-1 items-center lg:hidden">
          <MobileNav />
        </div>

        {/* Logo — centered on mobile (between the two flex-1 zones), left on desktop */}
        <div className="flex items-center lg:gap-8">
          <Logo />
        </div>

        {/* Desktop nav fills the middle on large screens */}
        <DesktopNav />

        {/* Right zone: actions — flex-1 on mobile to mirror the left zone */}
        <div className="flex flex-1 items-center justify-end gap-0.5 lg:flex-none">
          <div className="lg:hidden">
            <SearchOverlay />
          </div>
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Tài khoản"
            className="hidden lg:inline-flex"
          >
            <Link href="/ho-tro">
              <UserIcon className="size-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Danh sách yêu thích"
            className="relative hidden lg:inline-flex"
          >
            <Link href="/yeu-thich">
              <HeartIcon className="size-5" />
              <CountBadge count={wishlistCount} />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Giỏ hàng"
            className="relative"
          >
            <Link href="/gio-hang">
              <ShoppingBagIcon className="size-5" />
              <CountBadge count={cartCount} />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
