"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction, type AuthActionState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AuthActionState = {};

export function AuthForm({
  mode,
  callbackUrl = "/",
}: {
  mode: "login" | "register";
  callbackUrl?: string;
}) {
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      {mode === "register" && (
        <div className="space-y-1.5">
          <Label htmlFor="name">Họ và tên</Label>
          <Input id="name" name="name" autoComplete="name" required placeholder="Nguyễn Văn A" />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="ban@email.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending
          ? "Đang xử lý..."
          : mode === "login"
            ? "Đăng nhập"
            : "Tạo tài khoản"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            Chưa có tài khoản?{" "}
            <Link href="/dang-ky" className="font-medium text-foreground hover:underline">
              Đăng ký
            </Link>
          </>
        ) : (
          <>
            Đã có tài khoản?{" "}
            <Link href="/dang-nhap" className="font-medium text-foreground hover:underline">
              Đăng nhập
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
