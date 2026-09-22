'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { X, MessageCircle, Send } from 'lucide-react'

// Initialize with your Supabase project credentials
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

type Message = {
  content: string
  role: 'user' | 'assistant' | 'agent'
  created_at: string
  sender_name?: string | null
}

type Step = 'collect-info' | 'chatting'

export function CustomerChatWidget({ tenantId }: { tenantId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<Step>('collect-info')
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [chatClient, setChatClient] = useState<any>(supabase)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [input, setInput] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Subscribe to incoming agent/bot messages
  useEffect(() => {
    if (!sessionId || !sessionToken || !chatClient) return
    const channel = chatClient
      .channel(`customer_chat_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_session_id=eq.${sessionId}`,
        },
        (payload: any) => {
          const msg = payload.new as any
          if (msg.role !== 'user') {
            setMessages((prev) => [
              ...prev,
              { content: msg.content, role: msg.role, created_at: msg.created_at, sender_name: msg.sender_name },
            ])
          }
        }
      )
      .subscribe()
    return () => { chatClient.removeChannel(channel) }
  }, [sessionId, sessionToken, chatClient])

  const handleOpen = () => {
    setIsOpen(true)
  }

  const createSession = async () => {
    if (!name.trim() || !email.trim()) return

    let token = crypto.randomUUID()
    let sessionData = null
    let activeClient = null

    for (let attempt = 1; attempt <= 2; attempt++) {
      const scopedClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        { global: { headers: { 'x-chat-token': token } } }
      )

      try {
        const { data, error } = await scopedClient
          .from('chat_sessions')
          .insert({
            company_id: tenantId,
            customer_name: name.trim(),
            customer_email: email.trim(),
            source: 'landing_page',
            status: 'unassigned',
            session_token: token,
          })
          .select('id')
          .single()

        if (error) {
          if (error.code === '23505' && attempt === 1) {
            token = crypto.randomUUID()
            continue
          }
          throw error
        }
        sessionData = data
        activeClient = scopedClient
        setChatClient(scopedClient)
        break
      } catch (e) {
        console.error('Error creating session:', e)
        return
      }
    }

    if (!sessionData || !activeClient) return

    setSessionId(sessionData.id)
    setSessionToken(token)
    setStep('chatting')

    try {
      // Send welcome bot message
      await activeClient.from('messages').insert({
        chat_session_id: sessionData.id,
        company_id: tenantId,
        content: `Hello ${name}! 👋 How can we help you today?`,
        role: 'assistant',
        is_bot_response: true,
      })
    } catch (e) {
      console.error('Error sending welcome message:', e)
    }
  }

  const checkFAQ = async (userMessage: string) => {
    const { data: faqs } = await chatClient
      .from('faq_entries')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('priority', { ascending: false })
    if (!faqs?.length) return null
    const lower = userMessage.toLowerCase()
    return faqs.find((f: any) => f.keywords.some((kw: string) => lower.includes(kw.toLowerCase()))) || null
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !sessionId || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)

    // Optimistic UI
    setMessages((prev) => [...prev, { content, role: 'user', created_at: new Date().toISOString() }])

    try {
      const { error: msgError } = await chatClient.from('messages').insert({
        chat_session_id: sessionId,
        company_id: tenantId,
        content,
        role: 'user',
      })
      if (msgError) throw msgError

      const faq = await checkFAQ(content)
      if (faq) {
        await chatClient.from('messages').insert({
          chat_session_id: sessionId,
          company_id: tenantId,
          content: faq.answer,
          role: 'assistant',
          is_bot_response: true,
        })
        // Increment usage count
        await chatClient.from('faq_entries').update({ usage_count: faq.usage_count + 1 }).eq('id', faq.id)
        if (faq.triggers_routing) {
          await chatClient.from('chat_sessions').update({ status: 'unassigned', department: faq.route_to_department || 'general' }).eq('id', sessionId)
          await chatClient.from('messages').insert({
            chat_session_id: sessionId,
            company_id: tenantId,
            content: "I'm connecting you with a team member who can help further. Please hold on!",
            role: 'assistant',
            is_bot_response: true,
          })
        }
      } else {
        await chatClient.from('chat_sessions').update({ status: 'unassigned' }).eq('id', sessionId)
        await chatClient.from('messages').insert({
          chat_session_id: sessionId,
          company_id: tenantId,
          content: "Thanks for your message! A team member will be with you shortly.",
          role: 'assistant',
          is_bot_response: true,
        })
      }
    } catch (e: any) {
      console.error(e)
      if (e.code === '42501' || e.message?.toLowerCase().includes('unauthorized') || e.message?.toLowerCase().includes('policy')) {
        setSessionExpired(true)
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Chat Bubble */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:scale-110 transition-transform"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[560px] w-[380px] flex-col rounded-2xl border bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-5 py-4 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">Support Chat</p>
                <p className="text-[11px] text-white/70">We typically reply right away</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {sessionExpired ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center space-y-4">
                <span className="material-symbols-outlined text-4xl text-slate-400">timer_off</span>
                <p className="text-sm font-semibold text-slate-700">Session Expired</p>
                <p className="text-xs text-slate-500">Your chat session has expired. Please start a new chat.</p>
                <button
                  onClick={() => {
                    setSessionId(null)
                    setSessionToken(null)
                    setChatClient(supabase)
                    setSessionExpired(false)
                    setMessages([])
                    setStep('collect-info')
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Start New Chat
                </button>
              </div>
            ) : step === 'collect-info' ? (
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600">Please introduce yourself before we get started:</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Smith"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button
                    onClick={createSession}
                    disabled={!name.trim() || !email.trim()}
                    className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors"
                  >
                    Start Chat
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'user'
                  return (
                    <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {!isUser && (
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                          <MessageCircle className="h-3.5 w-3.5 text-primary" />
                        </div>
                      )}
                      <div>
                        <div className={`px-3 py-2 rounded-2xl max-w-[260px] text-sm ${
                          isUser ? 'bg-primary text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'
                        }`}>
                          {msg.content}
                        </div>
                        {msg.sender_name && msg.role === 'agent' && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{msg.sender_name}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          {step === 'chatting' && !sessionExpired && (
            <div className="border-t border-slate-100 p-3 shrink-0">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-40 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  )
}
