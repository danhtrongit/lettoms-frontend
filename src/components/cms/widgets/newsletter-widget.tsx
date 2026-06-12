"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  heading?: string;
  subheading?: string;
  placeholder?: string;
  buttonLabel?: string;
}

export function NewsletterWidget({
  heading,
  subheading,
  placeholder,
  buttonLabel,
}: Props) {
  const [email, setEmail] = React.useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Vui lòng nhập email hợp lệ");
      return;
    }
    // Storefront newsletter is a lightweight capture; persist later if needed.
    toast.success("Cảm ơn bạn đã đăng ký!");
    setEmail("");
  }

  return (
    <section className="container-page py-10">
      <div className="mx-auto max-w-xl rounded-xl border bg-muted/30 p-6 text-center sm:p-8">
        {heading && <h3 className="text-2xl font-semibold tracking-tight">{heading}</h3>}
        {subheading && (
          <p className="mt-2 text-sm text-muted-foreground">{subheading}</p>
        )}
        <form onSubmit={submit} className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder || "Email của bạn"}
            className="flex-1"
          />
          <Button type="submit" className="rounded-full">
            {buttonLabel || "Đăng ký"}
          </Button>
        </form>
      </div>
    </section>
  );
}
