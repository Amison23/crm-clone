<<<<<<< HEAD
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Phone, 
  Video, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Smile,
  Search,
  Edit,
  ShieldCheck,
  Globe,
  MoreHorizontal,
  CheckCheck
} from "lucide-react";
=======
'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

type ChatSession = {
  id: string
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  status: string
  assigned_to: string | null
  department: string | null
  source: string
  created_at: string
  is_lead: boolean
  company_id: string
}

type Message = {
  id: string
  chat_session_id: string
  content: string
  role: 'user' | 'assistant' | 'agent' | 'system'
  sender_name: string | null
  is_bot_response: boolean
  created_at: string
}

type FilterTab = 'mine' | 'unassigned' | 'bot-only'
>>>>>>> chatbot-module

export default function OmnichannelChatInbox() {
  const [chats, setChats] = useState<ChatSession[]>([])
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [employeeName, setEmployeeName] = useState<string>('')
  const [filter, setFilter] = useState<FilterTab>('unassigned')
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Fetch and cache employee full_name once — employees.id === auth.uid()
      if (user) {
        const { data: employee } = await supabase
          .from('employees')
          .select('full_name')
          .eq('id', user.id)
          .single()
        setEmployeeName(employee?.full_name || user.email || '')
      }

      await loadChats('unassigned', user?.id)
      setLoading(false)
    }
    init()
  }, [])

  // Realtime: refresh chat list on any session change
  useEffect(() => {
    const channel = supabase
      .channel('chat_sessions_feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions' }, () => {
        loadChats(filter, currentUser?.id)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [filter, currentUser])

  // Realtime: new messages for selected chat
  useEffect(() => {
    if (!selectedChat) return
    const channel = supabase
      .channel(`messages_${selectedChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_session_id=eq.${selectedChat.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChats = async (tab: FilterTab, userId?: string) => {
    try {
      let query = supabase.from('chat_sessions').select('*').order('created_at', { ascending: false })
      if (tab === 'unassigned') query = query.is('assigned_to', null).eq('status', 'unassigned')
      else if (tab === 'mine') query = query.eq('assigned_to', userId ?? '')
      else if (tab === 'bot-only') query = query.eq('status', 'bot_only')
      const { data } = await query
      setChats(data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const loadMessages = async (chatId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_session_id', chatId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  const handleSelectChat = async (chat: ChatSession) => {
    setSelectedChat(chat)
    await loadMessages(chat.id)
  }

  const handleFilterChange = (tab: FilterTab) => {
    setFilter(tab)
    loadChats(tab, currentUser?.id)
  }

  const claimChat = async () => {
    if (!selectedChat || !currentUser) return
    const { error } = await supabase
      .from('chat_sessions')
      .update({
        assigned_to: currentUser.id,
        status: 'active',
        first_response_at: new Date().toISOString(),
      })
      .eq('id', selectedChat.id)
    if (!error) {
      setSelectedChat({ ...selectedChat, assigned_to: currentUser.id, status: 'active' })
      loadChats(filter, currentUser.id)
    }
  }

  const closeChat = async () => {
    if (!selectedChat) return
    await supabase
      .from('chat_sessions')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', selectedChat.id)
    setSelectedChat(null)
    setMessages([])
    loadChats(filter, currentUser?.id)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedChat || !currentUser) return
    const content = messageInput.trim()
    setMessageInput('')

    await supabase.from('messages').insert({
      chat_session_id: selectedChat.id,
      company_id: selectedChat.company_id,
      content,
      role: 'agent',
      sender_id: currentUser.id,
      sender_name: employeeName,
    })
  }

  const filteredChats = chats.filter((c) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return c.customer_name?.toLowerCase().includes(q) || c.customer_email?.toLowerCase().includes(q)
  })

  const formatTime = (ts: string) => {
    const diffMin = Math.floor((Date.now() - new Date(ts).getTime()) / 60000)
    if (diffMin < 1) return 'just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`
    return new Date(ts).toLocaleDateString()
  }

  return (
<<<<<<< HEAD
    <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      {/* Left Pane: Conversation List */}
      <section className="w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Inbox</h2>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Edit className="w-5 h-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-all" 
              placeholder="Search conversations..." 
              type="text" 
            />
          </div>
          <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
            <Button size="sm" className="rounded-full h-8 px-4 text-xs">Mine</Button>
            <Button variant="secondary" size="sm" className="rounded-full h-8 px-4 text-xs">Unassigned</Button>
            <Button variant="secondary" size="sm" className="rounded-full h-8 px-4 text-xs">Bot-only</Button>
=======
    <div className="flex h-full w-full overflow-hidden">
      {/* Left Pane: Conversation List */}
      <section className="w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Inbox</h2>
            <span className="text-xs font-semibold text-slate-400">{filteredChats.length} chats</span>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(['mine', 'unassigned', 'bot-only'] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleFilterChange(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === tab
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab === 'bot-only' ? 'Bot-only' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
>>>>>>> chatbot-module
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
<<<<<<< HEAD
          {/* Active Chat Item */}
          <div className="px-4 py-4 bg-primary/5 border-l-4 border-primary cursor-pointer transition-colors">
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 flex items-center justify-center font-bold text-slate-600">AJ</div>
                <div>
                  <p className="text-sm font-semibold">Alex Johnson</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">WhatsApp</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">2m ago</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mt-1 pl-13 pl-[52px]">I'm having trouble with my recent subscription billing...</p>
          </div>

          {[
            { name: "Martha Stewart", initial: "MS", source: "Web Chat", icon: Globe, time: "15m ago", msg: "Thank you for the quick resolution!", color: "text-blue-500" },
            { name: "Kevin Smith", initial: "KS", source: "WhatsApp", icon: ShieldCheck, time: "1h ago", msg: "Where is my order #5524?", color: "text-emerald-500" },
          ].map((chat, i) => (
            <div key={i} className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center font-bold text-slate-500">{chat.initial}</div>
                  <div>
                    <p className="text-sm font-semibold">{chat.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <chat.icon className={`w-3.5 h-3.5 ${chat.color}`} />
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{chat.source}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">{chat.time}</span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 mt-1 pl-[52px]">{chat.msg}</p>
=======
          {loading && <div className="p-4 text-sm text-slate-400 text-center">Loading...</div>}
          {!loading && filteredChats.length === 0 && (
            <div className="p-6 text-center text-slate-400">
              <span className="material-symbols-outlined text-3xl mb-2 block">inbox</span>
              <p className="text-sm">No conversations here</p>
            </div>
          )}
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat)}
              className={`px-4 py-3 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors ${
                selectedChat?.id === chat.id
                  ? 'bg-primary/5 border-l-4 border-l-primary'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/40 to-primary/70 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">
                      {(chat.customer_name || 'A')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{chat.customer_name || 'Anonymous'}</p>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary">language</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {chat.source === 'landing_page' ? 'Web Chat' : 'CRM'}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium shrink-0">{formatTime(chat.created_at)}</span>
              </div>
              <p className="text-xs text-slate-500 truncate ml-11">
                {chat.customer_email || (chat.department ? `Dept: ${chat.department}` : 'No contact info')}
              </p>
              {chat.is_lead && (
                <span className="ml-11 inline-block mt-1 px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-bold uppercase rounded">
                  Lead
                </span>
              )}
>>>>>>> chatbot-module
            </div>
          ))}
        </div>
      </section>

<<<<<<< HEAD
      {/* Middle Pane: Active Chat Window */}
      <section className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
        {/* Chat Header */}
        <header className="h-16 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-sm">AJ</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">Alex Johnson</h3>
                <span className="size-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Local time: 10:48 AM (PST)</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary rounded-full">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary rounded-full">
              <Video className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-2 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400">
              Resolve
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-500 rounded-full">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
          <div className="flex justify-center">
            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full flex items-center gap-2 uppercase tracking-widest border border-amber-200/50 dark:border-amber-800/50 shadow-sm">
              <MoreHorizontal className="w-3 h-3 animate-pulse" />
              Taken over from Bot
            </span>
          </div>

          {/* Message Received */}
          <div className="flex items-end gap-3 max-w-[85%] group">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:scale-110 transition-transform">AJ</div>
            <div className="space-y-1">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">Hi, I'm having trouble with my recent subscription billing. It seems I was charged twice this month.</p>
              </div>
              <span className="text-[10px] text-slate-400 ml-1 font-medium">10:42 AM</span>
            </div>
          </div>

          {/* Message Sent */}
          <div className="flex items-end justify-end gap-3 ml-auto max-w-[85%]">
            <div className="space-y-1 text-right">
              <div className="bg-primary text-primary-foreground p-4 rounded-2xl rounded-br-none shadow-lg shadow-primary/10">
                <p className="text-sm leading-relaxed">I'm sorry to hear that, Alex. Let me look into your account. Could you please confirm the last 4 digits of the card used?</p>
              </div>
              <div className="flex items-center justify-end gap-1.5 pr-1">
                <span className="text-[10px] text-slate-400 font-medium">10:45 AM</span>
                <CheckCheck className="w-3.5 h-3.5 text-primary" />
              </div>
            </div>
          </div>

          {/* Message Received */}
          <div className="flex items-end gap-3 max-w-[85%] group">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:scale-110 transition-transform">AJ</div>
            <div className="space-y-1">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">Sure, it ends in 4492. I also have the invoice number if that helps: #INV-2024-009.</p>
              </div>
              <span className="text-[10px] text-slate-400 ml-1 font-medium">10:46 AM</span>
            </div>
          </div>
        </div>

        {/* Chat Footer: Input Area */}
        <footer className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col gap-3 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white dark:focus-within:bg-slate-900">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary shrink-0 rounded-lg">
                <Paperclip className="w-5 h-5" />
              </Button>
              <textarea 
                rows={1}
                placeholder="Type your message..." 
                className="flex-1 bg-transparent border-none outline-none resize-none px-2 py-2 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 min-h-[40px] max-h-32" 
              />
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary shrink-0 rounded-lg">
                <Smile className="w-5 h-5" />
              </Button>
              <Button size="icon" className="shrink-0 rounded-lg shadow-lg shadow-primary/20 h-9 w-9">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between px-1">
              <div className="flex gap-4">
                <button className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-wider transition-colors">Internal Note</button>
                <button className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-wider transition-colors">Canned Responses</button>
              </div>
              <p className="text-[10px] text-slate-400 italic">Press Enter to send, Shift + Enter for new line</p>
            </div>
          </div>
        </footer>
      </section>

      {/* Right Pane: Customer Mini-Profile */}
      <section className="w-72 hidden xl:flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 overflow-y-auto">
        <div className="text-center space-y-3 mb-8">
          <div className="relative inline-block group">
            <div className="w-24 h-24 rounded-full border-4 border-slate-50 dark:border-slate-800 bg-slate-100 flex items-center justify-center font-bold text-2xl text-slate-400 group-hover:scale-105 transition-transform duration-500">AJ</div>
            <div className="absolute bottom-1 right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
          </div>
          <div>
            <h4 className="text-lg font-bold">Alex Johnson</h4>
            <div className="flex justify-center mt-1">
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full tracking-wider border border-primary/20">Lead</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Contact Information</p>
            <div className="space-y-3">
              {[
                { icon: "mail", val: "alex.j@example.com" },
                { icon: "call", val: "+1 (555) 012-3456" },
                { icon: "location_on", val: "San Francisco, CA" },
              ].map((info, idx) => (
                <div key={idx} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-slate-400 text-lg">{info.icon}</span>
                  <span className="text-sm truncate font-medium">{info.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Recent Tickets</p>
            <div className="space-y-2">
              {[
                { id: "#TCK-9902", status: "Closed", sCol: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", title: "Product return inquiry" },
                { id: "#TCK-9120", status: "Open", sCol: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", title: "Billing issue report" },
              ].map((tck, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{tck.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tck.sCol}`}>{tck.status}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{tck.title}</p>
                </div>
              ))}
            </div>
          </div>

          <Button variant="secondary" className="w-full text-xs font-bold uppercase tracking-wider h-10 shadow-sm">
            View Full History
          </Button>
        </div>
      </section>
    </div>
  );
=======
      {/* Middle Pane: Active Chat */}
      <section className="flex-1 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-w-0">
        {selectedChat ? (
          <>
            <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/70 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {(selectedChat.customer_name || 'A')[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm">{selectedChat.customer_name || 'Anonymous'}</p>
                  <p className="text-xs text-slate-400">{selectedChat.customer_email || 'No email'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!selectedChat.assigned_to && (
                  <button
                    onClick={claimChat}
                    className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Claim Chat
                  </button>
                )}
                {selectedChat.status !== 'closed' && (
                  <button
                    onClick={closeChat}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-slate-400 text-sm mt-8">No messages yet</div>
              )}
              {messages.map((msg) => {
                if (msg.role === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[11px] font-semibold rounded-full flex items-center gap-1.5 border border-amber-100 dark:border-amber-800">
                        <span className="material-symbols-outlined text-xs">smart_toy</span>
                        {msg.content}
                      </span>
                    </div>
                  )
                }
                const isAgent = msg.role === 'agent'
                return (
                  <div key={msg.id} className={`flex items-end gap-3 ${isAgent ? 'justify-end ml-auto' : 'justify-start'} max-w-[80%]`}>
                    {!isAgent && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        {msg.is_bot_response
                          ? <span className="material-symbols-outlined text-[16px] text-slate-500">smart_toy</span>
                          : <span className="text-xs font-bold text-slate-600">{(selectedChat.customer_name || 'A')[0].toUpperCase()}</span>
                        }
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className={`p-3 rounded-2xl ${isAgent ? 'bg-primary text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-800 rounded-bl-none'}`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <span className={`text-[10px] text-slate-400 block ${isAgent ? 'text-right' : ''}`}>
                        {msg.is_bot_response ? 'Bot' : isAgent ? (msg.sender_name || 'Agent') : (selectedChat.customer_name || 'Customer')}
                        {' · '}
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 p-4 shrink-0">
              {selectedChat.assigned_to === currentUser?.id && selectedChat.status !== 'closed' ? (
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </button>
                </form>
              ) : (
                <p className="text-center text-xs text-slate-400">
                  {selectedChat.status === 'closed' ? 'This chat is closed.' : 'Claim this chat to reply.'}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center flex-col gap-3 text-slate-400">
            <span className="material-symbols-outlined text-5xl">forum</span>
            <p className="text-sm font-medium">Select a conversation to get started</p>
          </div>
        )}
      </section>

      {/* Right Pane: Customer Mini-Profile */}
      <section className="w-72 hidden xl:flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 overflow-y-auto shrink-0">
        {selectedChat ? (
          <>
            <div className="text-center space-y-3 mb-8">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/70 flex items-center justify-center mx-auto">
                  <span className="text-3xl font-bold text-white">
                    {(selectedChat.customer_name || 'A')[0].toUpperCase()}
                  </span>
                </div>
                {selectedChat.status === 'active' && (
                  <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900" />
                )}
              </div>
              <div>
                <h4 className="text-lg font-bold">{selectedChat.customer_name || 'Anonymous'}</h4>
                {selectedChat.is_lead && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full tracking-wider">Lead</span>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Information</p>
                <div className="space-y-3 mt-2">
                  {selectedChat.customer_email && (
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400 text-lg">mail</span>
                      <span className="text-sm truncate">{selectedChat.customer_email}</span>
                    </div>
                  )}
                  {selectedChat.customer_phone && (
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400 text-lg">call</span>
                      <span className="text-sm">{selectedChat.customer_phone}</span>
                    </div>
                  )}
                  {selectedChat.department && (
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400 text-lg">category</span>
                      <span className="text-sm capitalize">{selectedChat.department}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Session Info</p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Status</span>
                    <span className={`font-semibold capitalize ${
                      selectedChat.status === 'active' ? 'text-green-600' :
                      selectedChat.status === 'closed' ? 'text-red-500' : 'text-amber-600'
                    }`}>{selectedChat.status}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Source</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                      {selectedChat.source?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Started</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {new Date(selectedChat.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300 text-center">
            <div>
              <span className="material-symbols-outlined text-4xl mb-2 block">person</span>
              <p className="text-xs">Select a chat to see customer info</p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
>>>>>>> chatbot-module
}