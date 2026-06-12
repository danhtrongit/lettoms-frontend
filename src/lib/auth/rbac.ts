import { redirect } from "next/navigation";
import { auth } from "./auth";

export type Role = "admin" | "staff" | "customer";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export function isStaff(role?: string): boolean {
  return role === "admin" || role === "staff";
}

/** Require an authenticated user; redirect to login otherwise. */
export async function requireUser(callbackUrl = "/") {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/dang-nhap?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return user;
}

/** Require admin or staff; redirect non-staff away. */
export async function requireStaff() {
  const user = await getCurrentUser();
  if (!user) redirect("/dang-nhap?callbackUrl=/admin");
  if (!isStaff(user.role)) redirect("/");
  return user;
}

/** Require full admin (not staff). */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/dang-nhap?callbackUrl=/admin");
  if (user.role !== "admin") redirect("/admin");
  return user;
}
