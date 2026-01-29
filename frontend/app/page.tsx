'use client'

import React from "react"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SendHorizontal, Sparkles, Menu, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

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
}

type ContentType = 'newsletter' | 'blog-post' | 'donor-email' | 'social-media' | 'general'

const contentTypes = [
  { value: 'newsletter', label: 'Newsletter', icon: '📧' },
  { value: 'blog-post', label: 'Blog Post', icon: '✍️' },
  { value: 'donor-email', label: 'Donor Email', icon: '💝' },
  { value: 'social-media', label: 'Social Media', icon: '📱' },
  { value: 'general', label: 'General', icon: '💬' },
]

export default function ChatPage() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<ContentType>('general')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentSession = chatSessions.find(s => s.id === currentSessionId)

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

    try {
      // Call the Next.js API route which proxies to the backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          contentType: selectedType,
          history: messages,
          chatId: currentSessionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'Hello! I\'m your BCYI x YorkU AI assistant. I can help you create newsletters, blog posts, donor emails, social media captions, and more!',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('[v0] Chat error:', error)
      
      // Fallback demo response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Hello! I\'m your BCYI x YorkU AI assistant. I can help you create newsletters, blog posts, donor emails, social media captions, and more! Currently in demo mode - please connect your backend API.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const startNewChat = createNewChat; // Declare startNewChat variable

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
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    selectedType === type.value
                      ? 'bg-secondary text-secondary-foreground'
                      : 'hover:bg-accent text-foreground'
                  )}
                >
                  <span className="mr-2">{type.icon}</span>
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
        <header className="border-b border-border bg-card p-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  BCYI x YorkU AI Assistant
                </h1>
                <p className="text-sm text-muted-foreground">
                  Creating content for youth empowerment
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
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
                      className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
                      onClick={() => {
                        setSelectedType(type.value as ContentType)
                        textareaRef.current?.focus()
                      }}
                    >
                      <div className="text-3xl mb-2">{type.icon}</div>
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
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
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
          <div className="max-w-4xl mx-auto">
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
      </main>
    </div>
  )
}
