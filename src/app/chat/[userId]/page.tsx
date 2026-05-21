import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ChatThread } from "@/components/chat-thread";

export default async function ChatThreadPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const other = await prisma.user.findUnique({ where: { id: userId }, include: { coachProfile: true } });
  if (!other) notFound();

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.userId, recipientId: userId },
        { senderId: userId, recipientId: session.userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  // Mark as read
  await prisma.message.updateMany({
    where: { senderId: userId, recipientId: session.userId, readAt: null },
    data: { readAt: new Date() },
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <Link href="/chat" className="text-sm text-ink-600 hover:text-ink-900">← All messages</Link>
      <div className="card mt-3 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-ink-100 bg-cream">
          {other.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={other.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
          )}
          <div className="flex-1">
            <div className="font-medium">{other.name}</div>
            <div className="text-xs text-ink-500">
              {other.role === "COACH" ? "Coach" : "Client"}
              {other.coachProfile?.slug && (
                <>
                  {" · "}
                  <Link href={`/coaches/${other.coachProfile.slug}`} className="text-sage-700 hover:underline">View profile</Link>
                </>
              )}
            </div>
          </div>
        </div>
        <ChatThread
          myId={session.userId}
          otherId={userId}
          initialMessages={messages.map((m) => ({
            id: m.id,
            senderId: m.senderId,
            body: m.body,
            createdAt: m.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
