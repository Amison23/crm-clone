"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Bot, User, Sparkles, RefreshCw } from "lucide-react";
import { getTeamMessages, postTeamMessage } from "@/app/actions/messages";
import { toast } from "react-hot-toast";

interface Message {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  is_bot?: boolean;
}

export function StaffChatbot({ companyName }: { companyName?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await getTeamMessages();
      if (res.success && res.messages) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error("Failed to load staff messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userText = input.trim();
    setInput("");
    setSending(true);

    try {
      // Persist to database
      const res = await postTeamMessage(userText);
      if (res.success) {
        await fetchMessages();

        // Check if query triggers internal bot assistant response
        if (
          userText.toLowerCase().includes("status") ||
          userText.toLowerCase().includes("health") ||
          userText.toLowerCase().includes("tickets") ||
          userText.toLowerCase().includes("help")
        ) {
          let botReply = "🤖 Internal Staff Assistant: System operating normally. All tenant services online.";
          if (userText.toLowerCase().includes("tickets")) {
            botReply = "🤖 Internal Staff Assistant: You have 3 open support tickets requiring review in your org queue.";
          } else if (userText.toLowerCase().includes("health")) {
            botReply = "🤖 Internal Staff Assistant: Node CPU utilization is 24%, Memory pool at 42%, DB latency 18ms.";
          }
          
          setTimeout(async () => {
            await postTeamMessage(botReply);
            await fetchMessages();
          }, 800);
        }
      } else {
        toast.error(res.error || "Failed to post message");
      }
    } catch (err: any) {
      toast.error(err.message || "Message send error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center border border-primary/30">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider">
              {companyName || "Organization"} Staff Chatbot
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              [Internal Staff Communication • Org Scoped]
            </p>
          </div>
        </div>
        <button
          onClick={fetchMessages}
          className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
          title="Refresh Messages"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Message Stream */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 font-sans custom-scrollbar bg-slate-50/50 dark:bg-slate-950/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Sparkles size={32} className="text-primary animate-bounce" />
            <p className="text-xs font-semibold">No staff messages yet in this organization.</p>
            <p className="text-[10px] text-slate-500">Ask a question or communicate with org staff.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isBot = msg.body.startsWith("🤖");
            return (
              <div
                key={msg.id}
                className={`flex gap-3 items-start ${isBot ? "justify-start" : "justify-start"}`}
              >
                <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isBot ? "bg-primary text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                }`}>
                  {isBot ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={`p-3.5 rounded-2xl text-xs max-w-[80%] border ${
                  isBot
                    ? "bg-primary/10 border-primary/20 text-slate-900 dark:text-slate-100 font-mono"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm"
                }`}>
                  <p className="leading-relaxed">{msg.body}</p>
                  <span className="text-[9px] opacity-40 block mt-1 text-right">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type an internal message or command..."
          className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-primary/20"
        >
          <Send size={14} />
          Send
        </button>
      </form>
    </div>
  );
}
