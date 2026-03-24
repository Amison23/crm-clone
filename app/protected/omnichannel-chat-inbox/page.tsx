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
  tenant_id: string
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

export default function OmnichannelChatInbox() {
  const [chats, setChats] = useState<ChatSession[]>([])
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [filter, setFilter] = useState<FilterTab>('unassigned')
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
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
      tenant_id: selectedChat.tenant_id,
      content,
      role: 'agent',
      sender_id: currentUser.id,
      sender_name: currentUser.email,
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
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
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
            </div>
          ))}
        </div>
      </section>

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
}
