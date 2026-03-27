"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge, PriorityBadge, type Ticket } from "./TicketBadges";

interface Comment {
  id: string;
  author_id: string;
  body: string;
  is_internal: boolean;
  created_at: string;
  authorName?: string;
}

interface CustomerTicketModalProps {
  ticket: Ticket;
  ticketDbId: string; // raw UUID from DB
  currentUserId: string;
  onClose: () => void;
}

export default function CustomerTicketModal({
  ticket,
  ticketDbId,
  currentUserId,
  onClose,
}: CustomerTicketModalProps) {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchComments();
    // Subscribe to real-time new comments
    const channel = supabase
      .channel(`ticket-${ticketDbId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ticket_comments",
          filter: `ticket_id=eq.${ticketDbId}`,
        },
        (payload) => {
          const newComment = payload.new as Comment;
          // Don't add internal comments to customer view
          if (!newComment.is_internal) {
            setComments((prev) => [...prev, newComment]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketDbId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  async function fetchComments() {
    setLoading(true);
    const { data } = await supabase
      .from("ticket_comments")
      .select("*")
      .eq("ticket_id", ticketDbId)
      .eq("is_internal", false)
      .order("created_at", { ascending: true });
    setComments(data ?? []);
    setLoading(false);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const body = newMessage.trim();
    setNewMessage("");

    await supabase.from("ticket_comments").insert({
      ticket_id: ticketDbId,
      author_id: currentUserId,
      body,
      is_internal: false,
    });

    setSending(false);
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div>
            <p className="text-xs text-slate-400 mb-1 font-mono">{ticket.id}</p>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {ticket.subject}
            </h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <span className="text-xs text-slate-400">
                Opened {ticket.createdAt}
              </span>
              {ticket.agent && ticket.agent !== "Unassigned" && (
                <span className="text-xs text-slate-500">
                  · Handled by <span className="font-semibold">{ticket.agent}</span>
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mt-0.5 flex-shrink-0"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Description */}
        {ticket.description && (
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex-shrink-0">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Your Original Message
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {ticket.description}
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="size-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">
                chat_bubble_outline
              </span>
              <p className="text-sm text-slate-400">No messages yet</p>
              <p className="text-xs text-slate-400 mt-1">
                An agent will respond here shortly
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const isMe = comment.author_id === currentUserId;
              return (
                <div
                  key={comment.id}
                  className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`size-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${
                      isMe
                        ? "bg-gradient-to-br from-indigo-500 to-violet-600"
                        : "bg-gradient-to-br from-orange-400 to-rose-500"
                    }`}
                  >
                    {isMe ? "Me" : "AG"}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                      }`}
                    >
                      {comment.body}
                    </div>
                    <span className="text-[10px] text-slate-400 px-1">
                      {formatTime(comment.created_at)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Reply box */}
        <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 px-4 py-3">
          {ticket.status === "Resolved" ? (
            <p className="text-center text-xs text-slate-400 py-2">
              This ticket has been resolved. Open a new ticket if you need further help.
            </p>
          ) : (
            <form onSubmit={handleSend} className="flex items-end gap-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e as unknown as React.FormEvent);
                  }
                }}
                placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                rows={2}
                className="flex-1 px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="p-3 bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {sending ? (
                  <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                ) : (
                  <span className="material-symbols-outlined text-[20px] leading-none">send</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
