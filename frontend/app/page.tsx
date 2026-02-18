'use client'

import React from "react"

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SendHorizontal, Sparkles, Menu, Plus, FolderInput } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { PromptVariablesModal } from '@/components/prompt-variables-modal'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type ChatSession = {
  id: string
  title: string
  messages: Message[]
  contentType: ContentType
  createdAt: Date
  updatedAt: Date
  backendChatId?: string | null
}

type ContentType = 'newsletter' | 'blog-post' | 'donor-email' | 'social-media' | 'general'

type SummaryItem = { id: string; name: string }

const contentTypes = [
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'blog-post', label: 'Blog Post' },
  { value: 'donor-email', label: 'Donor Email' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'general', label: 'General' },
]

const CHAT_STORAGE_KEY = 'bcyi_chats'

function loadChatsFromStorage(): { sessions: ChatSession[]; currentId: string | null } {
  if (typeof window === 'undefined') return { sessions: [], currentId: null }
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (!raw) return { sessions: [], currentId: null }
    const { sessions, currentId } = JSON.parse(raw)
    const sessionsWithDates = (sessions || []).map((s: { messages?: Array<Message & { timestamp?: string | Date }>; createdAt?: string; updatedAt?: string; [k: string]: unknown }) => ({
      ...s,
      messages: (s.messages || []).map((m) => ({
        ...m,
        timestamp: m.timestamp instanceof Date ? m.timestamp : new Date((m.timestamp as string) || 0),
      })),
      createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
      updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
    })) as ChatSession[]
    return { sessions: sessionsWithDates, currentId: currentId || null }
  } catch {
    return { sessions: [], currentId: null }
  }
}

function saveChatsToStorage(sessions: ChatSession[], currentId: string | null) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
      sessions: sessions.map(s => ({
        ...s,
        messages: s.messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() })),
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
      currentId: currentId,
    }))
  } catch (_) {}
}

export default function ChatPage() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sorting, setSorting] = useState(false)
  const [listing, setListing] = useState(false)
  const [driveConnected, setDriveConnected] = useState<boolean | null>(null)
  const [selectedType, setSelectedType] = useState<ContentType>('general')
  const [hydrated, setHydrated] = useState(false)
  const [summaries, setSummaries] = useState<SummaryItem[]>([])
  const [selectedSummary, setSelectedSummary] = useState<SummaryItem | null>(null)
  const [promptModalOpen, setPromptModalOpen] = useState(false)
  const [loadingSummaries, setLoadingSummaries] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const retryOnLoadRef = useRef(false)

  const getContentTypeIconSrc = (value: ContentType) => {
    switch (value) {
      case 'newsletter':
        return '/icons/newsletter.png'
      case 'blog-post':
        return '/icons/blog-post.png'
      case 'donor-email':
        return '/icons/donor-email.png'
      case 'social-media':
        return '/icons/social-media.png'
      default:
        return '/icons/general.png'
    }
  }

  const currentSession = chatSessions.find(s => s.id === currentSessionId)

  const sendMessageToApi = async (messageContent: string, contentType: ContentType, backendChatId: string | null, history: Message[], summaryFileId?: string) => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: messageContent, contentType, history, chatId: backendChatId, summaryFileId }),
    })
    if (!res.ok) throw new Error('Failed to fetch response')
    const data = await res.json()
    const newBackendId = data.chatId || null
    if (newBackendId && currentSessionId) {
      setChatSessions((prev) => prev.map((s) => (s.id === currentSessionId ? { ...s, backendChatId: newBackendId } : s)))
    }
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: data.message || 'Hello! I\'m your BCYI x YorkU AI assistant. I can help you create newsletters, blog posts, donor emails, social media captions, and more!',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMessage])
  }

  useEffect(() => {
    const { sessions, currentId } = loadChatsFromStorage()
    if (sessions.length > 0) {
      setChatSessions(sessions)
      setCurrentSessionId(currentId)
      const current = sessions.find(s => s.id === currentId)
      if (current) {
        setMessages(current.messages)
        if (current.contentType) setSelectedType(current.contentType)
        if (current.messages.length > 0 && current.messages[current.messages.length - 1].role === 'user') {
          retryOnLoadRef.current = true
        }
      }
    }
    setHydrated(true)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    saveChatsToStorage(chatSessions, currentSessionId)
  }, [hydrated, chatSessions, currentSessionId])
  useEffect(() => {
    if (!hydrated || !retryOnLoadRef.current || !currentSessionId || messages.length === 0) return
    const last = messages[messages.length - 1]
    if (last.role !== 'user') return
    retryOnLoadRef.current = false
    setIsLoading(true)
    sendMessageToApi(last.content, selectedType, currentSession?.backendChatId ?? null, messages.slice(0, -1))
      .catch(() => {
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Response was interrupted. Please try sending again.',
          timestamp: new Date(),
        }])
      })
      .finally(() => setIsLoading(false))
  }, [hydrated, currentSessionId, messages.length, selectedType])

  useEffect(() => {
    fetch('/api/drive/auth/status').then(r => r.json()).then(d => setDriveConnected(d.connected)).catch(() => setDriveConnected(false))
  }, [])

  useEffect(() => {
    if (!driveConnected) {
      setSummaries([])
      return
    }
    setLoadingSummaries(true)
    fetch('/api/drive/summaries')
      .then((r) => r.ok ? r.json() : { summaries: [] })
      .then((d) => setSummaries(d.summaries || []))
      .catch(() => setSummaries([]))
      .finally(() => setLoadingSummaries(false))
  }, [driveConnected])
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('drive_connected') === '1') {
      setDriveConnected(true)
      window.history.replaceState({}, '', window.location.pathname)
    }
    if (params.get('drive_error')) {
      alert('Drive connect error: ' + params.get('drive_error'))
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Save current session when messages change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setChatSessions(prev => 
        prev.map(session => 
          session.id === currentSessionId
            ? { 
                ...session, 
                messages, 
                updatedAt: new Date(),
                title: messages[0]?.content.slice(0, 50) || 'New Chat'
              }
            : session
        )
      )
    }
  }, [messages, currentSessionId])

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      contentType: 'general',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setChatSessions(prev => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
    setMessages([])
    setSelectedType('general')
  }

  const loadChatSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId)
    if (session) {
      setCurrentSessionId(sessionId)
      setMessages(session.messages)
      setSelectedType(session.contentType)
    }
  }

  const deleteChatSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setChatSessions(prev => prev.filter(s => s.id !== sessionId))
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null)
      setMessages([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Create new session if none exists
    if (!currentSessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: input.slice(0, 50),
        messages: [],
        contentType: selectedType,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setChatSessions(prev => [newSession, ...prev])
      setCurrentSessionId(newSession.id)
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    const fileIdToSend = selectedSummary?.id

    try {
      await sendMessageToApi(input, selectedType, currentSession?.backendChatId ?? null, messages, fileIdToSend)
    } catch (error) {
      console.error('[bcyi-ai-assistant] Chat error:', error)
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Hello! I\'m your BCYI x YorkU AI assistant. Currently in demo mode - please connect your backend API.',
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
      setSelectedSummary(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const disconnectDrive = async () => {
    try {
      const res = await fetch('/api/drive/auth/disconnect', { method: 'POST' })
      if (!res.ok) throw new Error((await res.json()).error || 'Disconnect failed')
      setDriveConnected(false)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Disconnect failed')
    }
  }

  const connectDrive = async () => {
    try {
      const res = await fetch('/api/drive/auth/url')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to get auth URL')
      window.location.href = data.url
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Connect failed')
    }
  }

  const listDriveFiles = async () => {
    setListing(true)
    try {
      const res = await fetch('/api/drive/files?read_sample=test_event_summary')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'List failed')
      const lines = [
        `Files read (${data.count}): ${(data.file_names || []).join(', ') || 'none'}`,
        '',
      ]
      if (data.read_sample?.found === false) lines.push(`Read sample "test_event_summary": not found`)
      else if (data.read_sample?.content_preview) lines.push(`Read sample "${data.read_sample.file_name}":\n${data.read_sample.content_preview}`)
      alert(lines.join('\n'))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'List failed')
    } finally {
      setListing(false)
    }
  }

  const sortDrive = async () => {
    setSorting(true)
    try {
      const res = await fetch('/api/drive/sort', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sort failed')
      const lines = [data.message, '']
      if (data.stats) lines.push(`Stats: ${JSON.stringify(data.stats)}`)
      if (data.files_found?.length) lines.push('Files found: ' + data.files_found.map((f: { name: string }) => f.name).join(', '))
      if (data.folders_created?.length) lines.push('Folders created: ' + data.folders_created.join(', '))
      if (data.sorted?.length) lines.push('Sorted: ' + data.sorted.map((s: { name: string; target_folder: string }) => `${s.name} → ${s.target_folder}`).join('; '))
      if (data.skipped?.length) lines.push('Skipped: ' + data.skipped.map((s: { name: string; reason?: string }) => s.name + (s.reason ? ` (${s.reason})` : '')).join(', '))
      if (data.failed?.length) lines.push('Failed: ' + data.failed.map((f: { name: string; reason?: string }) => f.name + (f.reason ? ` (${f.reason})` : '')).join(', '))
      alert(lines.join('\n'))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Sort failed')
    } finally {
      setSorting(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border bg-card flex-col">
        <div className="p-4 border-b border-border">
          <Button
            onClick={createNewChat}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {/* Chat History */}
          <div className="p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Chat History
            </h3>
            {chatSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No chats yet. Start a new conversation!
              </p>
            ) : (
              <div className="space-y-1">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => loadChatSession(session.id)}
                    className={cn(
                      'group relative w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                      currentSessionId === session.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent text-foreground'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-balance">
                          {session.title}
                        </p>
                        <p className={cn(
                          "text-xs mt-1",
                          currentSessionId === session.id
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        )}>
                          {session.messages.length} messages
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteChatSession(session.id, e)}
                        className={cn(
                          "opacity-0 group-hover:opacity-100 transition-opacity",
                          currentSessionId === session.id
                            ? 'text-primary-foreground/70 hover:text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content Types */}
          <div className="p-4 border-t border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Content Types
            </h3>
            <div className="space-y-1">
              {contentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value as ContentType)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2',
                    selectedType === type.value
                      ? 'bg-secondary text-secondary-foreground'
                      : 'hover:bg-accent text-foreground'
                  )}
                >
                  {type.value !== 'general' && (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-background/40">
                      <Image
                        src={getContentTypeIconSrc(type.value as ContentType)}
                        alt={type.label}
                        width={16}
                        height={16}
                      />
                    </span>
                  )}
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              BY
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">BCYI x YorkU</p>
              <p className="text-xs text-muted-foreground">AI Assistant</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card/90 backdrop-blur-sm px-6 py-3">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>

              <div className="hidden md:flex items-center gap-3">
                <Image
                  src="/icons/aorta-heart.png"
                  alt="Aorta"
                  width={32}
                  height={32}
                  className="rounded-full shadow-sm"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold tracking-tight text-foreground">
                      Aorta
                    </span>
                    <span className="h-5 w-px bg-border" />
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      BCYI x YorkU AI Assistant
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Create newsletters, blog posts, donor emails and social content.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {driveConnected ? (
                <Button variant="outline" size="sm" onClick={disconnectDrive} className="hidden sm:inline-flex">
                  Disconnect Drive
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={connectDrive} className="hidden sm:inline-flex">
                  Connect Google Drive
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={listDriveFiles}
                disabled={listing}
                className="hidden md:inline-flex"
              >
                {listing ? 'Listing…' : 'List files'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={sortDrive}
                disabled={sorting}
                className="hidden md:inline-flex"
              >
                <FolderInput className="w-4 h-4 mr-2" />
                {sorting ? 'Sorting…' : 'Sort Drive'}
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 shadow-md">
                  <Image
                    src="/icons/aorta-heart-center.png"
                    alt="Aorta heart"
                    width={40}
                    height={40}
                  />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">
                  Welcome to BCYI x YorkU AI Assistant
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl text-balance">
                  I'm here to help you create engaging content for Black Creek Youth Initiative. 
                  Generate newsletters, blog posts, donor emails, social media captions, and more!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  {contentTypes.slice(0, 4).map((type) => (
                    <Card
                      key={type.value}
                      className="p-4 hover:shadow-lg transition-shadow cursor-pointer border border-border hover:border-primary bg-card/90"
                      onClick={() => {
                        setSelectedType(type.value as ContentType)
                        textareaRef.current?.focus()
                      }}
                    >
                      <div className="mb-3 flex items-center justify-center">
                        <Image
                          src={getContentTypeIconSrc(type.value as ContentType)}
                          alt={type.label}
                          width={32}
                          height={32}
                        />
                      </div>
                      <h3 className="font-semibold text-foreground">{type.label}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {type.value === 'newsletter' && 'Create engaging monthly updates'}
                        {type.value === 'blog-post' && 'Write impactful stories'}
                        {type.value === 'donor-email' && 'Thank and engage supporters'}
                        {type.value === 'social-media' && 'Craft compelling posts'}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-4',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="w-10 h-10 border-2 border-primary">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-6 py-4',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border text-foreground'
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <div className="leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    )}
                    <p
                      className={cn(
                        'text-xs mt-2',
                        message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="w-10 h-10 border-2 border-secondary">
                      <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
                        U
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <Avatar className="w-10 h-10 border-2 border-primary">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[80%] rounded-2xl px-6 py-4 bg-card border border-border">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card p-4">
          <div className="max-w-4xl mx-auto space-y-3">
            {driveConnected && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Latest events (select to build prompt)</p>
                <div className="flex flex-wrap gap-2">
                  {loadingSummaries ? (
                    <span className="text-sm text-muted-foreground">Loading summaries…</span>
                  ) : summaries.length === 0 ? (
                    <span className="text-sm text-muted-foreground">No event summaries found.</span>
                  ) : (
                    summaries.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setSelectedSummary(s)
                          setTimeout(() => setPromptModalOpen(true), 10)
                        }}
                        className={cn(
                          'rounded-full px-3 py-1.5 text-sm border transition-colors',
                          selectedSummary?.id === s.id
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/50 border-border hover:bg-muted text-foreground'
                        )}
                      >
                        {s.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Ask me to create ${contentTypes.find(t => t.value === selectedType)?.label.toLowerCase()}...`}
                    className="min-h-[60px] max-h-[200px] resize-none pr-12 bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                    disabled={isLoading}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                    {selectedType !== 'general' && (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-md">
                        {contentTypes.find(t => t.value === selectedType)?.label}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="h-[60px] w-[60px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <SendHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-3">
              AI-powered assistant for Black Creek Youth Initiative x York University
            </p>
          </div>
        </div>

        <PromptVariablesModal
          open={promptModalOpen}
          onClose={() => setPromptModalOpen(false)}
          selectedSummary={selectedSummary}
          contentType={selectedType}
          onGeneratePrompt={(promptText) => {
            setInput(promptText)
            textareaRef.current?.focus()
          }}
        />
      </main>
    </div>
  )
}
