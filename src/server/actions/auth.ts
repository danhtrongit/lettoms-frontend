"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { signIn, signOut } from "@/lib/auth/auth";
import { hashPassword } from "@/lib/auth/password";

const registerSchema = z
  .object({
    name: z.string().min(2, "Vui lòng nhập họ tên"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  })
  .strict();

export type AuthActionState = { error?: string; ok?: boolean };

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/");

  try {
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirectTo: callbackUrl,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email hoặc mật khẩu không đúng." };
    }
    throw error; // redirect throws — let it bubble
  }
}

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const { name, email, password } = parsed.data;
  const normalized = email.toLowerCase();

  const existing = await db.query.users.findFirst({
    where: eq(users.email, normalized),
  });
  if (existing) {
    return { error: "Email này đã được đăng ký." };
  }

  const passwordHash = await hashPassword(password);
  await db.insert(users).values({
    name,
    email: normalized,
    passwordHash,
    role: "customer",
  });

  try {
    await signIn("credentials", {
      email: normalized,
      password,
      redirectTo: "/tai-khoan",
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Đăng ký thành công nhưng đăng nhập thất bại, vui lòng thử lại." };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
