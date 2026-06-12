import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { User } from "@/db/schema/auth";
import { hashPassword } from "@/lib/auth/password";
import type { UserInput } from "@/lib/validators/cms";

export interface AdminUserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  phone: string | null;
  createdAt: Date;
}

export async function listUsersAdmin(): Promise<AdminUserRow[]> {
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    phone: r.phone,
    createdAt: r.createdAt,
  }));
}

export async function getUserAdmin(id: string): Promise<User | undefined> {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}

export async function createUserAdmin(input: UserInput): Promise<string> {
  const passwordHash = input.password
    ? await hashPassword(input.password)
    : null;
  const [row] = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email.toLowerCase(),
      role: input.role,
      phone: input.phone ?? null,
      passwordHash,
    })
    .returning({ id: users.id });
  return row.id;
}

export async function updateUserAdmin(id: string, input: UserInput): Promise<void> {
  const patch: Record<string, unknown> = {
    name: input.name,
    email: input.email.toLowerCase(),
    role: input.role,
    phone: input.phone ?? null,
    updatedAt: new Date(),
  };
  if (input.password) {
    patch.passwordHash = await hashPassword(input.password);
  }
  await db.update(users).set(patch).where(eq(users.id, id));
}

export async function deleteUserAdmin(id: string): Promise<void> {
  await db.delete(users).where(eq(users.id, id));
}

/** Count of remaining admins excluding a given id (guard against removing last admin). */
export async function countOtherAdmins(excludeId: string): Promise<number> {
  const admins = await db.select().from(users).where(eq(users.role, "admin"));
  return admins.filter((u) => u.id !== excludeId).length;
}
