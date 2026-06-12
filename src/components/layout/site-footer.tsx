import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { footerNav } from "@/data/navigation";
import { siteConfig } from "@/data/site";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { NavColumn } from "@/types";

interface SiteFooterProps {
  footerColumns?: NavColumn[];
}

export function SiteFooter({ footerColumns }: SiteFooterProps) {
  const columns = footerColumns ?? footerNav;
  return (
    <footer className="mt-16 border-t border-white/10 bg-primary text-primary-foreground">
      <div className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          {/* Brand + newsletter */}
          <div className="space-y-5">
            <Logo className="text-primary-foreground" />
            <p className="max-w-sm text-sm text-primary-foreground/70">
              {siteConfig.tagline}
            </p>
            <form className="flex max-w-sm gap-2">
              <Input
                type="email"
                required
                placeholder="Email của bạn"
                aria-label="Email đăng ký nhận tin"
                className="border-white/20 bg-white/10 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button
                type="submit"
                variant="secondary"
                className="shrink-0 rounded-full"
              >
                Đăng ký
              </Button>
            </form>
            <div className="flex gap-4 pt-1">
              <a
                href={siteConfig.social.facebook}
                aria-label="Facebook"
                className="opacity-80 transition-opacity hover:opacity-100"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
                  <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.03 4.39 11.03 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
                </svg>
              </a>
              <a
                href={siteConfig.social.instagram}
                aria-label="Instagram"
                className="opacity-80 transition-opacity hover:opacity-100"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
                  <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 3.68A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84Zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4Zm6.41-10.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44Z" />
                </svg>
              </a>
              <a
                href={siteConfig.social.youtube}
                aria-label="YouTube"
                className="opacity-80 transition-opacity hover:opacity-100"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
                  <path d="M23.5 6.5a3 3 0 0 0-2.12-2.13C19.5 3.86 12 3.86 12 3.86s-7.5 0-9.38.51A3 3 0 0 0 .5 6.5 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.5 3 3 0 0 0 2.12 2.13c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3 3 0 0 0 2.12-2.13A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.5ZM9.6 15.57V8.43L15.82 12Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="mb-3 text-sm font-semibold">{col.title}</h3>
                <ul className="space-y-2">
                  {col.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-primary-foreground/60 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.legalName}. Bảo lưu mọi quyền.
          </p>
          <p>Việt Nam (VND)</p>
        </div>
      </div>
    </footer>
  );
}
