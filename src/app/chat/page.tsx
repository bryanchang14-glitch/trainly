import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { timeAgo } from "@/lib/utils";

export default async function ChatListPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: session.userId }, { recipientId: session.userId }] },
    include: { sender: true, recipient: true },
    orderBy: { createdAt: "desc" },
  });

  // Group by counterpart user id
  const threads = new Map<string, { otherId: string; other: { id: string; name: string; avatarUrl: string | null; role: string }; last: typeof messages[number]; unread: number }>();
  for (const m of messages) {
    const otherUser = m.senderId === session.userId ? m.recipient : m.sender;
    if (!threads.has(otherUser.id)) {
      threads.set(otherUser.id, {
        otherId: otherUser.id,
        other: { id: otherUser.id, name: otherUser.name, avatarUrl: otherUser.avatarUrl, role: otherUser.role },
        last: m,
        unread: 0,
      });
    }
    if (m.recipientId === session.userId && !m.readAt) {
      threads.get(otherUser.id)!.unread += 1;
    }
  }

  const list = Array.from(threads.values()).sort((a, b) => b.last.createdAt.getTime() - a.last.createdAt.getTime());

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="section-title mb-6">Messages</h1>

      {list.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-2">💬</div>
          <div className="font-medium">No conversations yet</div>
          <p className="text-sm text-ink-600 mt-1">Send a coach a message from their profile to get started.</p>
          <Link href="/coaches" className="btn-primary mt-4">Find a coach</Link>
        </div>
      ) : (
        <div className="card divide-y divide-ink-100">
          {list.map((t) => (
            <Link
              key={t.otherId}
              href={`/chat/${t.otherId}`}
              className="flex items-center gap-3 p-4 hover:bg-cream transition"
            >
              {t.other.avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.other.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium truncate">{t.other.name}</div>
                  <div className="text-xs text-ink-500 shrink-0 ml-2">{timeAgo(t.last.createdAt)}</div>
                </div>
                <div className="text-sm text-ink-600 truncate">
                  {t.last.senderId === session.userId ? "You: " : ""}{t.last.body}
                </div>
              </div>
              {t.unread > 0 && (
                <span className="bg-coral-500 text-white text-[10px] font-medium rounded-full px-2 py-0.5">
                  {t.unread}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
