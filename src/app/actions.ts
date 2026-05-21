"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function createBooking(input: {
  coachId: string;
  packageId: string | null;
  startsAt: string;
  format: string;
  locationNote: string;
  priceSGD: number;
}): Promise<{ id: string } | { error: string }> {
  const session = await getSession();
  if (!session) return { error: "Please log in." };
  if (session.role !== "CLIENT") return { error: "Only clients can book." };

  const start = new Date(input.startsAt);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  try {
    const booking = await prisma.booking.create({
      data: {
        clientId: session.userId,
        coachId: input.coachId,
        packageId: input.packageId,
        startsAt: start,
        endsAt: end,
        format: input.format,
        locationNote: input.locationNote || null,
        status: "PENDING",
        priceSGD: input.priceSGD,
      },
    });
    revalidatePath("/dashboard");
    revalidatePath("/coach");
    return { id: booking.id };
  } catch (e) {
    return { error: "Couldn't create booking." };
  }
}

export async function sendMessage(input: { recipientId: string; body: string }) {
  const session = await getSession();
  if (!session) return { error: "Please log in." };
  if (!input.body.trim()) return { error: "Empty message." };

  await prisma.message.create({
    data: {
      senderId: session.userId,
      recipientId: input.recipientId,
      body: input.body.trim(),
    },
  });
  revalidatePath("/chat");
  return { ok: true };
}

export async function setBookingStatus(input: { bookingId: string; status: "CONFIRMED" | "DECLINED" | "COMPLETED" | "CANCELLED" }) {
  const session = await getSession();
  if (!session) return { error: "Please log in." };

  const booking = await prisma.booking.findUnique({ where: { id: input.bookingId }, include: { coach: true } });
  if (!booking) return { error: "Not found." };

  // Authorization
  if (input.status === "CONFIRMED" || input.status === "DECLINED") {
    if (booking.coach.userId !== session.userId) return { error: "Not your booking." };
  } else if (input.status === "CANCELLED") {
    if (booking.clientId !== session.userId && booking.coach.userId !== session.userId)
      return { error: "Not your booking." };
  }

  await prisma.booking.update({ where: { id: input.bookingId }, data: { status: input.status } });
  revalidatePath("/dashboard");
  revalidatePath("/coach");
  return { ok: true };
}

export async function toggleFavourite(coachId: string) {
  const session = await getSession();
  if (!session) return { error: "Please log in." };
  const existing = await prisma.favourite.findUnique({
    where: { userId_coachId: { userId: session.userId, coachId } },
  });
  if (existing) await prisma.favourite.delete({ where: { id: existing.id } });
  else await prisma.favourite.create({ data: { userId: session.userId, coachId } });
  revalidatePath("/dashboard");
  return { ok: true, favourited: !existing };
}

export async function logProgress(input: { metric: string; value: number; unit?: string; note?: string }) {
  const session = await getSession();
  if (!session) return { error: "Please log in." };
  await prisma.progressEntry.create({
    data: {
      userId: session.userId,
      metric: input.metric,
      value: input.value,
      unit: input.unit,
      note: input.note,
    },
  });
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateCoachProfile(input: {
  headline?: string;
  tagline?: string;
  longBio?: string;
  hourlyRate?: number;
  formats?: string;
  vibeTags?: string;
  languages?: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "COACH") return { error: "Not a coach." };
  await prisma.coach.update({
    where: { userId: session.userId },
    data: input,
  });
  revalidatePath("/coach");
  return { ok: true };
}
