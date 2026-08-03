"use client";

import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import { getTeamMessages, postTeamMessage } from "@/app/actions/messages";
import { Loader2, MessageSquare, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MessagingDrawer({ userId }: { userId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll every 5 seconds
  const { data, error, mutate, isLoading } = useSWR(
    isOpen ? "team-messages" : null,
    async () => {
      const res = await getTeamMessages();
      if (!res.success) throw new Error(res.error);
      return res.messages;
    },
    { refreshInterval: 5000, revalidateOnFocus: true }
  );

  const messages = data || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isPosting) return;

    const messageText = newMessage;
    setNewMessage("");
    setIsPosting(true);

    try {
      // Optimistic update
      mutate([...messages, {
        id: "temp-" + Date.now(),
        body: messageText,
        author_id: userId,
        created_at: new Date().toISOString(),
      }], false);

      const res = await postTeamMessage(messageText);
      if (res.success) {
        mutate();
      } else {
        // Rollback on failure (simplified by just revalidating)
        mutate();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-8 size-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center hover:bg-indigo-500 hover:scale-105 transition-all z-40"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white leading-none">Team Chat</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                Online
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
          {isLoading && !data && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full text-sm text-red-500 font-medium">
              Failed to load messages
            </div>
          )}

          {messages.length === 0 && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
              <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
              <p className="font-medium">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation with your team!</p>
            </div>
          )}

          {messages.map((msg: any) => {
            const isMe = msg.author_id === userId;
            const authorName = msg.profiles?.full_name || "Agent";
            
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                  isMe 
                    ? "bg-indigo-600 text-white rounded-br-sm" 
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-sm"
                }`}>
                  {!isMe && (
                    <p className="text-[10px] font-bold text-indigo-500 mb-1 leading-none">{authorName}</p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                </div>
                <span className="text-[9px] font-semibold text-slate-400 mt-1 mx-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isPosting || isLoading}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full pl-4 pr-12 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isPosting || isLoading}
              className="absolute right-1.5 size-9 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
            >
              {isPosting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 ml-0.5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
