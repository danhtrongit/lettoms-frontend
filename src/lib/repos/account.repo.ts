import { eq, desc, and } from "drizzle-orm";
import { db } from "@/db";
import { addresses, users } from "@/db/schema";
import type { Address } from "@/db/schema/commerce";
import type { AddressInput } from "@/lib/validators/commerce";

/* ----------------------------- Profile ----------------------------- */

export async function getUserProfile(userId: string) {
  return db.query.users.findFirst({ where: eq(users.id, userId) });
}

export async function updateUserProfile(
  userId: string,
  patch: { name?: string; phone?: string | null }
): Promise<void> {
  await db
    .update(users)
    .set({ name: patch.name, phone: patch.phone ?? null, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

/* ----------------------------- Addresses ----------------------------- */

export async function listAddresses(userId: string): Promise<Address[]> {
  return db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));
}

export async function createAddress(
  userId: string,
  input: AddressInput
): Promise<void> {
  await db.transaction(async (tx) => {
    if (input.isDefault) {
      await tx
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, userId));
    }
    await tx.insert(addresses).values({
      userId,
      fullName: input.fullName,
      phone: input.phone,
      line1: input.line1,
      ward: input.ward ?? null,
      wardCode: input.wardCode ?? null,
      district: input.district ?? null,
      province: input.province ?? null,
      provinceCode: input.provinceCode ?? null,
      isDefault: input.isDefault,
    });
  });
}

export async function updateAddress(
  userId: string,
  addressId: string,
  input: AddressInput
): Promise<void> {
  await db.transaction(async (tx) => {
    if (input.isDefault) {
      await tx
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, userId));
    }
    await tx
      .update(addresses)
      .set({
        fullName: input.fullName,
        phone: input.phone,
        line1: input.line1,
        ward: input.ward ?? null,
        wardCode: input.wardCode ?? null,
        district: input.district ?? null,
        province: input.province ?? null,
        provinceCode: input.provinceCode ?? null,
        isDefault: input.isDefault,
      })
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));
  });
}

export async function deleteAddress(
  userId: string,
  addressId: string
): Promise<void> {
  await db
    .delete(addresses)
    .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));
}
