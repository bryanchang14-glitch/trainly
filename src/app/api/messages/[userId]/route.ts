import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json([], { status: 401 });
  const { userId } = await params;
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.userId, recipientId: userId },
        { senderId: userId, recipientId: session.userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(
    messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  );
}
