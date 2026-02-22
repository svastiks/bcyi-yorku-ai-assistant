"use client";

import React from "react";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  SendHorizontal,
  Sparkles,
  Menu,
  Plus,
  FolderInput,
  Copy,
  Check,
  BarChart2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { PromptVariablesModal } from "@/components/prompt-variables-modal";
import { useTheme } from "next-themes";
import { getIconPath } from '@/lib/icon-utils'

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  contentType: ContentType;
  createdAt: Date;
  updatedAt: Date;
  backendChatId?: string | null;
};

type ContentType =
  | "newsletter"
  | "blog-post"
  | "donor-email"
  | "social-media"
  | "social-reach"
  | "general";

type SummaryItem = { id: string; name: string };

type YouTubeChannel = {
  name: string;
  thumbnail: string;
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  channelUrl: string;
};

type YouTubeVideo = {
  id: string;
  title: string;
  thumbnail: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  publishedAt: string;
  videoUrl: string;
};

type MetaPost = { message: string; created_time: string; likes: number; comments: number };
type MetaPage = { id: string; name: string; followers_count: string; fan_count: string; pageUrl: string; posts: MetaPost[] };
type InstagramMedia = { id: string; caption: string; timestamp: string; media_type: string; media_url: string; thumbnail_url: string; mediaUrl: string };
type MetaData = {
  facebook: { pages: MetaPage[] };
  instagram: { username: string; followers_count: string; media_count: string; profile_picture_url: string; profileUrl: string; media: InstagramMedia[] } | null;
};

const contentTypes = [
  { value: "newsletter", label: "Newsletter" },
  { value: "blog-post", label: "Blog Post" },
  { value: "donor-email", label: "Donor Email" },
  { value: "social-media", label: "Social Media" },
  { value: "general", label: "General" },
];

const CHAT_STORAGE_KEY = "bcyi_chats";

function loadChatsFromStorage(): {
  sessions: ChatSession[];
  currentId: string | null;
} {
  if (typeof window === "undefined") return { sessions: [], currentId: null };
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return { sessions: [], currentId: null };
    const { sessions, currentId } = JSON.parse(raw);
    const sessionsWithDates = (sessions || []).map(
      (s: {
        messages?: Array<Message & { timestamp?: string | Date }>;
        createdAt?: string;
        updatedAt?: string;
        [k: string]: unknown;
      }) => ({
        ...s,
        messages: (s.messages || []).map((m) => ({
          ...m,
          timestamp:
            m.timestamp instanceof Date
              ? m.timestamp
              : new Date((m.timestamp as string) || 0),
        })),
        createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
        updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
      }),
    ) as ChatSession[];
    return { sessions: sessionsWithDates, currentId: currentId || null };
  } catch {
    return { sessions: [], currentId: null };
  }
}

function saveChatsToStorage(sessions: ChatSession[], currentId: string | null) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CHAT_STORAGE_KEY,
      JSON.stringify({
        sessions: sessions.map((s) => ({
          ...s,
          messages: s.messages.map((m) => ({
            ...m,
            timestamp: m.timestamp.toISOString(),
          })),
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
        })),
        currentId: currentId,
      }),
    );
  } catch (_) {}
}

export default function ChatPage() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [listing, setListing] = useState(false);
  const [driveConnected, setDriveConnected] = useState<boolean | null>(null);
  const [selectedType, setSelectedType] = useState<ContentType>("general");
  const [hydrated, setHydrated] = useState(false);
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<SummaryItem | null>(
    null,
  );
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [loadingSummaries, setLoadingSummaries] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [youtubeData, setYoutubeData] = useState<{ channel: YouTubeChannel | null; videos: YouTubeVideo[] } | null>(null);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [youtubeFetched, setYoutubeFetched] = useState(false);
  const [activeSocialPlatform, setActiveSocialPlatform] = useState<"youtube" | null>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const retryOnLoadRef = useRef(false);

  const { theme } = useTheme();

  const isDark = mounted && (theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches));

  const getContentTypeIconSrc = (value: ContentType) => {
    const iconFolder = isDark ? '/icons/darkModeIcons' : '/icons'

    switch (value) {
      case "newsletter":
        return `${iconFolder}/newsletter.png`
      case "blog-post":
        return `${iconFolder}/blog-post.png`
      case "donor-email":
        return `${iconFolder}/donor-email.png`
      case "social-media":
        return `${iconFolder}/social-media.png`
      default:
        return `${iconFolder}/general.png`
    }
  };
  const src = getIconPath('aorta-heart', isDark)

  const currentSession = chatSessions.find((s) => s.id === currentSessionId);

  const sendMessageToApi = async (
    messageContent: string,
    contentType: ContentType,
    backendChatId: string | null,
    history: Message[],
    summaryFileId?: string,
  ) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: messageContent,
        contentType,
        history,
        chatId: backendChatId,
        summaryFileId,
      }),
    });
    if (!res.ok) throw new Error("Failed to fetch response");
    const data = await res.json();
    const newBackendId = data.chatId || null;
    if (newBackendId && currentSessionId) {
      setChatSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId ? { ...s, backendChatId: newBackendId } : s,
        ),
      );
    }
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content:
        data.message ||
        "Hello! I'm your BCYI x YorkU AI assistant. I can help you create newsletters, blog posts, donor emails, social media captions, and more!",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  useEffect(() => {
    const { sessions, currentId } = loadChatsFromStorage();
    if (sessions.length > 0) {
      setChatSessions(sessions);
      setCurrentSessionId(currentId);
      const current = sessions.find((s) => s.id === currentId);
      if (current) {
        setMessages(current.messages);
        if (current.contentType) setSelectedType(current.contentType);
        if (
          current.messages.length > 0 &&
          current.messages[current.messages.length - 1].role === "user"
        ) {
          retryOnLoadRef.current = true;
        }
      }
    }
    setHydrated(true);
  }, []);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!hydrated) return;
    saveChatsToStorage(chatSessions, currentSessionId);
  }, [hydrated, chatSessions, currentSessionId]);
  useEffect(() => {
    if (
      !hydrated ||
      !retryOnLoadRef.current ||
      !currentSessionId ||
      messages.length === 0
    )
      return;
    const last = messages[messages.length - 1];
    if (last.role !== "user") return;
    retryOnLoadRef.current = false;
    setIsLoading(true);
    sendMessageToApi(
      last.content,
      selectedType,
      currentSession?.backendChatId ?? null,
      messages.slice(0, -1),
    )
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Response was interrupted. Please try sending again.",
            timestamp: new Date(),
          },
        ]);
      })
      .finally(() => setIsLoading(false));
  }, [hydrated, currentSessionId, messages.length, selectedType]);

  useEffect(() => {
    fetch("/api/drive/auth/status")
      .then((r) => r.json())
      .then((d) => setDriveConnected(d.connected))
      .catch(() => setDriveConnected(false));
  }, []);

  useEffect(() => {
    if (!driveConnected) {
      setSummaries([]);
      return;
    }
    setLoadingSummaries(true);
    fetch("/api/drive/summaries")
      .then((r) => (r.ok ? r.json() : { summaries: [] }))
      .then((d) => setSummaries(d.summaries || []))
      .catch(() => setSummaries([]))
      .finally(() => setLoadingSummaries(false));
  }, [driveConnected]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("drive_connected") === "1") {
      setDriveConnected(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("drive_error")) {
      alert("Drive connect error: " + params.get("drive_error"));
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const copyMessage = async (messageId: string) => {
    const element = messageRefs.current[messageId];
    if (!element) return;

    const htmlContent = element.innerHTML;
    const textContent = element.innerText;

    try {
      if (typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": new Blob([textContent], { type: "text/plain" }),
            "text/html": new Blob([htmlContent], { type: "text/html" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(textContent);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(textContent);
      } catch {
        // silently fail
      }
    }

    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save current session when messages change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setChatSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,
                messages,
                updatedAt: new Date(),
                title: messages[0]?.content.slice(0, 50) || "New Chat",
              }
            : session,
        ),
      );
    }
  }, [messages, currentSessionId]);

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      contentType: "general",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChatSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setSelectedType("general");
  };

  const loadChatSession = (sessionId: string) => {
    const session = chatSessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setSelectedType(session.contentType);
    }
  };

  const deleteChatSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Create new session if none exists
    if (!currentSessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: input.slice(0, 50),
        messages: [],
        contentType: selectedType,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setChatSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    const fileIdToSend = selectedSummary?.id;

    try {
      await sendMessageToApi(
        input,
        selectedType,
        currentSession?.backendChatId ?? null,
        messages,
        fileIdToSend,
      );
    } catch (error) {
      console.error("[bcyi-ai-assistant] Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Hello! I'm your BCYI x YorkU AI assistant. Currently in demo mode - please connect your backend API.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setSelectedSummary(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const disconnectDrive = async () => {
    try {
      const res = await fetch("/api/drive/auth/disconnect", { method: "POST" });
      if (!res.ok)
        throw new Error((await res.json()).error || "Disconnect failed");
      setDriveConnected(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Disconnect failed");
    }
  };

  const connectDrive = async () => {
    try {
      const res = await fetch("/api/drive/auth/url");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get auth URL");
      window.location.href = data.url;
    } catch (e) {
      alert(e instanceof Error ? e.message : "Connect failed");
    }
  };

  const listDriveFiles = async () => {
    setListing(true);
    try {
      const res = await fetch(
        "/api/drive/files?read_sample=test_event_summary",
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "List failed");
      const lines = [
        `Files read (${data.count}): ${(data.file_names || []).join(", ") || "none"}`,
        "",
      ];
      if (data.read_sample?.found === false)
        lines.push(`Read sample "test_event_summary": not found`);
      else if (data.read_sample?.content_preview)
        lines.push(
          `Read sample "${data.read_sample.file_name}":\n${data.read_sample.content_preview}`,
        );
      alert(lines.join("\n"));
    } catch (e) {
      alert(e instanceof Error ? e.message : "List failed");
    } finally {
      setListing(false);
    }
  };

  const sortDrive = async () => {
    setSorting(true);
    try {
      const res = await fetch("/api/drive/sort", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sort failed");
      const lines = [data.message, ""];
      if (data.stats) lines.push(`Stats: ${JSON.stringify(data.stats)}`);
      if (data.files_found?.length)
        lines.push(
          "Files found: " +
            data.files_found.map((f: { name: string }) => f.name).join(", "),
        );
      if (data.folders_created?.length)
        lines.push("Folders created: " + data.folders_created.join(", "));
      if (data.sorted?.length)
        lines.push(
          "Sorted: " +
            data.sorted
              .map(
                (s: { name: string; target_folder: string }) =>
                  `${s.name} → ${s.target_folder}`,
              )
              .join("; "),
        );
      if (data.skipped?.length)
        lines.push(
          "Skipped: " +
            data.skipped
              .map(
                (s: { name: string; reason?: string }) =>
                  s.name + (s.reason ? ` (${s.reason})` : ""),
              )
              .join(", "),
        );
      if (data.failed?.length)
        lines.push(
          "Failed: " +
            data.failed
              .map(
                (f: { name: string; reason?: string }) =>
                  f.name + (f.reason ? ` (${f.reason})` : ""),
              )
              .join(", "),
        );
      alert(lines.join("\n"));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Sort failed");
    } finally {
      setSorting(false);
    }
  };

  const fetchYouTubeData = async () => {
    if (youtubeFetched && youtubeData) return;
    setYoutubeLoading(true);
    setYoutubeError(null);
    try {
      const res = await fetch("/api/youtube");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch YouTube data");
      setYoutubeData(data);
      setYoutubeFetched(true);
    } catch (e) {
      setYoutubeError(e instanceof Error ? e.message : "Failed to fetch YouTube data");
    } finally {
      setYoutubeLoading(false);
    }
  };

  const formatCount = (n: string) => {
    const num = parseInt(n, 10);
    if (isNaN(num)) return "0";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
  };

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
                      "group relative w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                      currentSessionId === session.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent text-foreground",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-balance">
                          {session.title}
                        </p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            currentSessionId === session.id
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {session.messages.length} messages
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteChatSession(session.id, e)}
                        className={cn(
                          "opacity-0 group-hover:opacity-100 transition-opacity",
                          currentSessionId === session.id
                            ? "text-primary-foreground/70 hover:text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground",
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
              {contentTypes.slice(0, 4).map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value as ContentType)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                    selectedType === type.value
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-accent text-foreground",
                  )}
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-background/40">
                    <Image
                      src={getContentTypeIconSrc(type.value as ContentType)}
                      alt={type.label}
                      width={16}
                      height={16}
                    />
                  </span>
                  {type.label}
                </button>
              ))}
              <button
                onClick={() => setSelectedType("social-reach")}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                  selectedType === "social-reach"
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-accent text-foreground",
                )}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-background/40">
                  <BarChart2 className="w-4 h-4" />
                </span>
                Social Media Stats
              </button>
              <button
                onClick={() => setSelectedType("general")}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                  selectedType === "general"
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-accent text-foreground",
                )}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-background/40">
                  <Image
                    src={getContentTypeIconSrc("general")}
                    alt="General"
                    width={16}
                    height={16}
                  />
                </span>
                General
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded  flex items-center justify-center text-primary-foreground font-bold">
              <Image
                  src={getIconPath('aorta-heart',isDark)}
                  alt="Aorta"
                  width={50}
                  height={50}
                  className="rounded-full shadow-sm"
                />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                BCYI x YorkU
              </p>
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
                  src={getIconPath('aorta-heart',isDark)}
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
                    Create newsletters, blog posts, donor emails and social
                    content.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Social Media Stats button */}
              <Button
                variant={selectedType === "social-reach" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("social-reach")}
                className="hidden sm:inline-flex items-center gap-2"
              >
                <BarChart2 className="w-4 h-4" />
                Social Media Stats
              </Button>

              {/* Drive buttons group */}
              <div className="hidden md:flex items-center gap-1 bg-muted/60 border border-border rounded-lg px-1.5 py-1">
                {driveConnected ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={disconnectDrive}
                    className="h-7 text-xs"
                  >
                    Disconnect Drive
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={connectDrive}
                    className="h-7 text-xs"
                  >
                    Connect Google Drive
                  </Button>
                )}
                <div className="w-px h-4 bg-border" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={listDriveFiles}
                  disabled={listing}
                  className="h-7 text-xs"
                >
                  {listing ? "Listing…" : "List files"}
                </Button>
                <div className="w-px h-4 bg-border" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={sortDrive}
                  disabled={sorting}
                  className="h-7 text-xs"
                >
                  <FolderInput className="w-3.5 h-3.5 mr-1.5" />
                  {sorting ? "Sorting…" : "Sort Drive"}
                </Button>
              </div>

              {/* Mobile: just connect/disconnect drive */}
              <div className="flex sm:hidden">
                {driveConnected ? (
                  <Button variant="outline" size="sm" onClick={disconnectDrive}>
                    Disconnect Drive
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={connectDrive}>
                    Connect Drive
                  </Button>
                )}
              </div>

              <ThemeToggle />
            </div>
          </div>
        </header>

        {selectedType === "social-reach" ? (
          /* Social Media Stats Dashboard */
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Heading */}
              <div className="flex items-center gap-3">
                <BarChart2 className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Social Media Stats</h2>
              </div>

              {/* Platform buttons */}
              <div className="flex flex-wrap gap-2 items-center">
                {/* YouTube */}
                <Button
                  variant={activeSocialPlatform === "youtube" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setActiveSocialPlatform("youtube");
                    fetchYouTubeData();
                  }}
                  disabled={youtubeLoading}
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </Button>

                {/* Facebook — Coming Soon */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="flex items-center gap-2 opacity-50 cursor-not-allowed"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook — Coming Soon
                </Button>

                {/* Instagram — Coming Soon */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="flex items-center gap-2 opacity-50 cursor-not-allowed"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                  </svg>
                  Instagram — Coming Soon
                </Button>

                {/* TikTok — Coming Soon */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="flex items-center gap-2 opacity-50 cursor-not-allowed"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.83 1.54V6.78a4.85 4.85 0 0 1-1.06-.09z"/>
                  </svg>
                  TikTok — Coming Soon
                </Button>
              </div>

              {/* ── YouTube content ── */}
              {activeSocialPlatform === "youtube" && (
                <>
                  {youtubeLoading && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Loading YouTube data…</span>
                    </div>
                  )}
                  {youtubeError && !youtubeLoading && (
                    <Card className="p-4 border-destructive/50 bg-destructive/5">
                      <p className="text-sm text-destructive mb-3">{youtubeError}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setYoutubeFetched(false); fetchYouTubeData(); }}
                      >
                        Retry
                      </Button>
                    </Card>
                  )}
                  {youtubeData?.channel && !youtubeLoading && (
                    <Card className="p-5">
                      <div className="flex items-center gap-4">
                        {youtubeData.channel.thumbnail && (
                          <Image
                            src={youtubeData.channel.thumbnail}
                            alt={youtubeData.channel.name}
                            width={64}
                            height={64}
                            className="rounded-full border border-border"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <a
                            href={youtubeData.channel.channelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-semibold text-foreground hover:text-primary transition-colors truncate block"
                          >
                            {youtubeData.channel.name}
                          </a>
                          <div className="flex flex-wrap gap-6 mt-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Subscribers</p>
                              <p className="text-base font-semibold text-foreground">{formatCount(youtubeData.channel.subscriberCount)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Total Views</p>
                              <p className="text-base font-semibold text-foreground">{formatCount(youtubeData.channel.viewCount)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Videos</p>
                              <p className="text-base font-semibold text-foreground">{formatCount(youtubeData.channel.videoCount)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                  {youtubeData?.videos && youtubeData.videos.length > 0 && !youtubeLoading && (
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-3">Recent Videos</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {youtubeData.videos.map((video) => (
                          <Card key={video.id} className="py-0 overflow-hidden">
                            <a
                              href={video.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              {video.thumbnail && (
                                <div className="relative w-full aspect-video bg-muted">
                                  <Image
                                    src={video.thumbnail}
                                    alt={video.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                            </a>
                            <div className="p-3 space-y-1">
                              <a
                                href={video.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2 block"
                              >
                                {video.title}
                              </a>
                              <p className="text-xs text-muted-foreground">
                                {new Date(video.publishedAt).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                              <div className="flex gap-3 text-xs text-muted-foreground pt-1">
                                <span>{formatCount(video.viewCount)} views</span>
                                <span>{formatCount(video.likeCount)} likes</span>
                                <span>{formatCount(video.commentCount)} comments</span>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── No platform selected ── */}
              {activeSocialPlatform === null && (
                <p className="text-sm text-muted-foreground">Select a platform above to view analytics.</p>
              )}
            </div>
          </div>
        ) : (
          <>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-100 text-center">
                <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 shadow-md">
                  <Image
                    src="/icons/aorta-heart.png"
                    alt="Aorta heart"
                    width={40}
                    height={40}
                  />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">
                  Welcome to BCYI x YorkU AI Assistant
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl text-balance">
                  I'm here to help you create engaging content for Black Creek
                  Youth Initiative. Generate newsletters, blog posts, donor
                  emails, social media captions, and more!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  {contentTypes.slice(0, 4).map((type) => (
                    <Card
                      key={type.value}
                      className={cn(
                        "p-4 hover:shadow-lg transition-shadow cursor-pointer border bg-card/90",
                        selectedType === type.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary",
                      )}
                      onClick={() => {
                        setSelectedType(
                          selectedType === type.value
                            ? "general"
                            : (type.value as ContentType),
                        );
                        textareaRef.current?.focus();
                      }}
                    >
                      <div className="mt-2 mb-3 flex items-center justify-center">
                        <Image
                          src={getContentTypeIconSrc(type.value as ContentType)}
                          alt={type.label}
                          width={32}
                          height={32}
                        />
                      </div>
                      <h3 className="font-semibold text-foreground">
                        {type.label}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {type.value === "newsletter" &&
                          "Create engaging monthly updates"}
                        {type.value === "blog-post" &&
                          "Write impactful stories"}
                        {type.value === "donor-email" &&
                          "Thank and engage supporters"}
                        {type.value === "social-media" &&
                          "Craft compelling posts"}
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
                    "flex gap-4",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {message.role === "assistant" && (
                    <Avatar className="w-10 h-10 border-2 border-primary">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "relative max-w-[80%] rounded-2xl px-6 py-4",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-foreground",
                    )}
                  >
                    {message.role === "assistant" && (
                      <button
                        onClick={() => copyMessage(message.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Copy output"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {message.role === "assistant" ? (
                      <div
                        ref={(el) => { messageRefs.current[message.id] = el; }}
                        className="leading-relaxed pr-6 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0"
                      >
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    )}
                    <p
                      className={cn(
                        "text-xs mt-2",
                        message.role === "user"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {message.role === "user" && (
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
                <p className="text-xs font-medium text-muted-foreground">
                  Latest events (select to build prompt)
                </p>
                <div className="flex flex-wrap gap-2">
                  {loadingSummaries ? (
                    <span className="text-sm text-muted-foreground">
                      Loading summaries…
                    </span>
                  ) : summaries.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      No event summaries found.
                    </span>
                  ) : (
                    summaries.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedSummary(s);
                          setTimeout(() => setPromptModalOpen(true), 10);
                        }}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-sm border transition-colors",
                          selectedSummary?.id === s.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/50 border-border hover:bg-muted text-foreground",
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
                    placeholder={
                      selectedType === "general"
                        ? "Ask me to create (general)..."
                        : `Ask me to create ${contentTypes.find((t) => t.value === selectedType)?.label.toLowerCase()}...`
                    }
                    className="min-h-[60px] max-h-[200px] resize-none pr-12 bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                    disabled={isLoading}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                    {selectedType !== "general" && (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-md">
                        {
                          contentTypes.find((t) => t.value === selectedType)
                            ?.label
                        }
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
              AI-powered assistant for Black Creek Youth Initiative x York
              University
            </p>
          </div>
        </div>

        <PromptVariablesModal
          open={promptModalOpen}
          onClose={() => setPromptModalOpen(false)}
          selectedSummary={selectedSummary}
          contentType={selectedType}
          onGeneratePrompt={(promptText) => {
            setInput(promptText);
            textareaRef.current?.focus();
          }}
        />
          </>
        )}
      </main>
    </div>
  );
}
