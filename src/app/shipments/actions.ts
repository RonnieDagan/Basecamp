"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createShipment(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const tracking = String(formData.get("tracking") ?? "").trim();
  const etaRaw = String(formData.get("eta") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const flagged = formData.get("flagged") === "on";

  await prisma.shipment.create({
    data: {
      name,
      tracking: tracking || null,
      eta: etaRaw ? new Date(etaRaw) : null,
      notes: notes || null,
      flagged,
    },
  });

  revalidatePath("/shipments");
  revalidatePath("/dashboard");
}

export async function updateShipmentNotes(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const notes = String(formData.get("notes") ?? "").trim();

  await prisma.shipment.update({ where: { id }, data: { notes: notes || null } });
  revalidatePath("/shipments");
}

export async function updateShipmentFlag(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const flagged = formData.get("flagged") === "on";

  await prisma.shipment.update({ where: { id }, data: { flagged } });
  revalidatePath("/shipments");
  revalidatePath("/dashboard");
}

export async function deleteShipment(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.shipment.delete({ where: { id } });
  revalidatePath("/shipments");
  revalidatePath("/dashboard");
}
