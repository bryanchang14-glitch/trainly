"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { sendMessage } from "@/app/actions";

type Msg = { id: string; senderId: string; body: string; createdAt: string };

export function ChatThread({
  myId,
  otherId,
  initialMessages,
}: {
  myId: string;
  otherId: string;
  initialMessages: Msg[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Poll for new messages every 4s
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const r = await fetch(`/api/messages/${otherId}`, { cache: "no-store" });
        if (r.ok) {
          const data = (await r.json()) as Msg[];
          if (data.length !== messages.length) setMessages(data);
        }
      } catch {}
    }, 4000);
    return () => clearInterval(t);
  }, [otherId, messages.length]);

  async function send() {
    const body = text.trim();
    if (!body) return;
    setText("");
    const optimistic: Msg = {
      id: `tmp-${Date.now()}`,
      senderId: myId,
      body,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    start(async () => {
      await sendMessage({ recipientId: otherId, body });
      const r = await fetch(`/api/messages/${otherId}`, { cache: "no-store" });
      if (r.ok) setMessages(await r.json());
    });
  }

  return (
    <>
      <div className="h-[480px] overflow-y-auto p-4 space-y-2 bg-cream/40">
        {messages.length === 0 && (
          <div className="text-center text-sm text-ink-500 py-12">
            No messages yet. Start the conversation 👋
          </div>
        )}
        {messages.map((m) => {
          const mine = m.senderId === myId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine ? "bg-sage-600 text-white" : "bg-white border border-ink-100 text-ink-900"
                }`}
              >
                {m.body}
                <div className={`text-[10px] mt-0.5 ${mine ? "text-sage-100/80" : "text-ink-400"}`}>
                  {new Date(m.createdAt).toLocaleTimeString("en-SG", { hour: "numeric", minute: "2-digit", hour12: true })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="border-t border-ink-100 p-3 flex gap-2 bg-white">
        <input
          className="input"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button className="btn-primary" disabled={pending || !text.trim()} onClick={send}>
          Send
        </button>
      </div>
    </>
  );
}
