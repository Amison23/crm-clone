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

export default function OmnichannelChatInbox() {
  const [chats, setChats] = useState<ChatSession[]>([])
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [employeeName, setEmployeeName] = useState<string>('')
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [filter, setFilter] = useState<FilterTab>('unassigned')
  const [searchQuery, setSearchQuery] = useState('')
  const [colleagueSearchQuery, setColleagueSearchQuery] = useState('')
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Fetch and cache employee full_name once — employees.id === auth.uid()
      if (user) {
        const { data: employee } = await supabase
          .from('employees')
          .select('full_name, company_id')
          .eq('id', user.id)
          .single()
        setEmployeeName(employee?.full_name || user.email || '')
        setCompanyId(employee?.company_id || null)

        // Fetch team members in the same company
        if (employee?.company_id) {
          const { data: team } = await supabase
            .from('employees')
            .select('id, full_name, email_address, role')
            .eq('company_id', employee.company_id)
            .neq('id', user.id)
            .in('role', ['admin', 'sales_agent'])
          setTeamMembers(team || [])
        }

        await loadChats('unassigned', user?.id, employee?.company_id, user?.email)
      } else {
        await loadChats('unassigned', undefined, null, undefined)
      }
      setLoading(false)
    }
    init()
  }, [])

  // Realtime: refresh chat list on any session change
  useEffect(() => {
    const channel = supabase
      .channel('chat_sessions_feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions' }, () => {
        loadChats(filter, currentUser?.id, companyId, currentUser?.email)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [filter, currentUser, companyId])

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

  const loadChats = async (tab: FilterTab, userId?: string, compId?: string | null, userEmail?: string) => {
    try {
      let query = supabase.from('chat_sessions').select('*').order('created_at', { ascending: false }).eq('is_deleted', false)
      if (compId) query = query.eq('company_id', compId)
      if (tab === 'unassigned') query = query.is('assigned_to', null).eq('status', 'unassigned')
      else if (tab === 'mine') {
        if (userEmail) {
          query = query.or(`assigned_to.eq.${userId ?? ''},customer_email.eq.${userEmail}`)
        } else {
          query = query.eq('assigned_to', userId ?? '')
        }
      }
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
    loadChats(tab, currentUser?.id, companyId, currentUser?.email)
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

  const deleteChat = async () => {
    if (!selectedChat) return
    await supabase
      .from('chat_sessions')
      .update({ is_deleted: true })
      .eq('id', selectedChat.id)
    
    setChats(prev => prev.filter(c => c.id !== selectedChat.id))
    setSelectedChat(null)
    setMessages([])
    loadChats(filter, currentUser?.id, companyId, currentUser?.email)
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

  const filteredTeam = teamMembers.filter((t) => {
    // Show all team members in the "Start New Chat" view if no query, but hide them in the sidebar if no query.
    // We can handle the sidebar hiding down in the render, but here we'll filter based on either query.
    if (!searchQuery && !colleagueSearchQuery) return true 
    const q = (searchQuery || colleagueSearchQuery).toLowerCase()
    return t.full_name?.toLowerCase().includes(q) || t.email_address?.toLowerCase().includes(q)
  })

  const handleSelectTeamMember = async (teamMember: any) => {
    // Query the database to see if an internal chat already exists to prevent duplicates across tabs
    const { data: existingChats } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('source', 'internal')
      .eq('is_deleted', false)
      .or(`and(customer_email.eq.${teamMember.email_address},assigned_to.eq.${currentUser?.id}),and(customer_email.eq.${currentUser?.email},assigned_to.eq.${teamMember.id})`)
      .limit(1)

    let existingChat = existingChats?.[0]

    if (!existingChat) {
      // Create a new internal chat session
      const { data, error } = await supabase.from('chat_sessions').insert({
        company_id: companyId,
        customer_name: teamMember.full_name,
        customer_email: teamMember.email_address,
        assigned_to: currentUser?.id,
        status: 'active',
        source: 'internal',
        is_lead: false
      }).select().single()

      if (data) {
        existingChat = data
        setChats(prev => [data, ...prev])
      } else {
        console.error("Error creating internal chat:", error)
        return
      }
    }

    if (existingChat) {
      handleSelectChat(existingChat)
    }
    setSearchQuery('')
    setColleagueSearchQuery('')
    setIsCreatingNewChat(false)
  }

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
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">{filteredChats.length} chats</span>
              <button 
                onClick={() => { setSelectedChat(null); setIsCreatingNewChat(true); }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title="Start New Chat"
              >
                <span className="material-symbols-outlined text-[15px]">edit_square</span>
              </button>
            </div>
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

          {/* Internal Team Search Results */}
          {searchQuery && filteredTeam.length > 0 && (
            <div className="mt-4">
              <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Team Members
              </div>
              {filteredTeam.map((member) => (
                <div
                  key={member.id}
                  onClick={() => handleSelectTeamMember(member)}
                  className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-white">
                          {(member.full_name || 'T')[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{member.full_name || 'Unknown'}</p>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-indigo-500">badge</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {member.role === 'admin' ? 'Admin' : 'Sales Agent'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 truncate ml-11">
                    {member.email_address}
                  </p>
                </div>
              ))}
            </div>
          )}
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
                  <button
                    onClick={() => { setSelectedChat(null); setIsCreatingNewChat(false); }}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                    Close
                  </button>
                  <button
                    onClick={deleteChat}
                    className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    Delete
                  </button>
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
        ) : isCreatingNewChat ? (
          <div className="flex h-full items-center justify-center flex-col gap-4 text-slate-400 p-8 w-full max-w-lg mx-auto">
            <span className="material-symbols-outlined text-5xl mb-2 text-primary">person_add</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Start a new chat</h3>
            <p className="text-sm font-medium mb-4 text-center">Search for a colleague within your organization</p>
            
            <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-80">
              <div className="relative border-b border-slate-100 dark:border-slate-800 p-3 shrink-0">
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                <input
                  autoFocus
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Search by name or email..."
                  value={colleagueSearchQuery}
                  onChange={(e) => setColleagueSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {filteredTeam.length === 0 ? (
                   <p className="text-center text-xs text-slate-400 p-4">No colleagues found.</p>
                ) : (
                  filteredTeam.map(member => (
                    <div
                      key={member.id}
                      onClick={() => handleSelectTeamMember(member)}
                      className="px-3 py-2.5 rounded-lg border border-transparent cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-white">
                            {(member.full_name || 'T')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">{member.full_name || 'Unknown'}</p>
                          <p className="text-xs text-slate-400">{member.role === 'admin' ? 'Admin' : 'Sales Agent'}</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors text-sm">chat</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <button 
              onClick={() => { setIsCreatingNewChat(false); setColleagueSearchQuery(''); }}
              className="mt-4 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center flex-col gap-4 text-slate-400">
            <span className="material-symbols-outlined text-5xl">forum</span>
            <p className="text-sm font-medium">Select a conversation to get started</p>
            <button
              onClick={() => setIsCreatingNewChat(true)}
              className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-sm font-medium text-sm hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Start New Chat
            </button>
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