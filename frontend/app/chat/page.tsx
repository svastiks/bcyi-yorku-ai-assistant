"use client";

import React from "react";
import Link from "next/link";
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
  Paperclip,
  ImagePlus,
  HardDrive,
  X,
  HelpCircle,
  ChevronLeft,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { PromptVariablesModal } from "@/components/prompt-variables-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import { getIconPath } from "@/lib/icon-utils";
import { markHasVisitedChat } from "@/lib/landing-prefs";

type MessageAttachmentDisplay =
  | { type: "local"; preview: string }
  | { type: "drive"; id: string; name: string; modified_time?: string | null };

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  /** Attachments shown with this message (e.g. image we asked to describe) */
  attachments?: MessageAttachmentDisplay[];
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  contentType: ContentType;
  createdAt: Date;
  updatedAt: Date;
  backendChatId?: string | null;
  /** Summary file used for context in this chat; kept until user deselects or picks another */
  selectedSummary?: SummaryItem | null;
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

type MetaPost = {
  message: string;
  created_time: string;
  likes: number;
  comments: number;
};
type MetaPage = {
  id: string;
  name: string;
  followers_count: string;
  fan_count: string;
  pageUrl: string;
  posts: MetaPost[];
};
type InstagramMedia = {
  id: string;
  caption: string;
  timestamp: string;
  media_type: string;
  media_url: string;
  thumbnail_url: string;
  mediaUrl: string;
};
type MetaData = {
  facebook: { pages: MetaPage[] };
  instagram: {
    username: string;
    followers_count: string;
    media_count: string;
    profile_picture_url: string;
    profileUrl: string;
    media: InstagramMedia[];
  } | null;
};

type LocalAttachment = { type: "local"; file: File; preview: string };
type DriveAttachment = {
  type: "drive";
  id: string;
  name: string;
  modified_time?: string | null;
};
type AttachedImage = LocalAttachment | DriveAttachment;

const MAX_ATTACHMENTS = 2;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB per image

const DRIVE_IMAGES_LIST_CACHE_KEY = "aorta_drive_images_list";
const DRIVE_IMAGES_LIST_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
/** After a successful Drive resync, block another until this elapses (Google API rate limits) */
const DRIVE_RESYNC_COOLDOWN_MS = 15_000;

const contentTypes = [
  { value: "newsletter", label: "Newsletter" },
  { value: "blog-post", label: "Blog Post" },
  { value: "donor-email", label: "Donor Email" },
  { value: "social-media", label: "Social Media" },
  { value: "general", label: "General" },
];

const CHAT_STORAGE_KEY = "aorta_chats";
/** Pre-rename key; migrated once then removed */
const LEGACY_CHAT_STORAGE_KEY = "bcyi_chats";

/** v2: default-open; v1 had many "closed" prefs — bump key once so default is open again */
const SIDEBAR_OPEN_STORAGE_KEY = "aorta_chat_sidebar_open_v2";

type SortDriveApiResponse = {
  message?: string;
  stats?: {
    total?: number;
    moved?: number;
    skipped?: number;
    already_placed?: number;
    failed?: number;
  };
  files_found?: Array<{ name: string }>;
  folders_created?: string[];
  sorted?: Array<{ name: string; target_folder: string }>;
  skipped?: Array<{ name: string; reason?: string }>;
  already_placed?: Array<{ name: string; target_folder: string }>;
  failed?: Array<{ name: string; reason?: string }>;
};

function skipReasonLabel(reason?: string) {
  if (reason === "folder") return "Drive folder (not moved by organizer)";
  return reason || "";
}

function SortDriveResultBody({ data }: { data: SortDriveApiResponse }) {
  const st = data.stats;
  const moved = Array.isArray(data.sorted) ? data.sorted : [];
  const skipped = Array.isArray(data.skipped) ? data.skipped : [];
  const alreadyPlaced = Array.isArray(data.already_placed)
    ? data.already_placed
    : [];
  const failed = Array.isArray(data.failed) ? data.failed : [];
  const folders = Array.isArray(data.folders_created)
    ? data.folders_created
    : [];

  const total =
    typeof st?.total === "number" ? st.total : data.files_found?.length;
  const movedCount = typeof st?.moved === "number" ? st.moved : moved.length;
  const skippedCount =
    typeof st?.skipped === "number" ? st.skipped : skipped.length;
  const alreadyCount =
    typeof st?.already_placed === "number"
      ? st.already_placed
      : alreadyPlaced.length;
  const failedCount =
    typeof st?.failed === "number" ? st.failed : failed.length;

  return (
    <div className="space-y-4 text-sm text-left">
      {total != null && (
        <p className="text-muted-foreground">
          Aorta uses built-in rules (name patterns and file types) to pick a
          target folder. Files already in that folder are left as-is.{" "}
          <span className="text-foreground font-medium">
            {total} item{total === 1 ? "" : "s"} scanned
          </span>
          {movedCount > 0 && (
            <>
              ,{" "}
              <span className="text-foreground font-medium">
                {movedCount} moved
              </span>
            </>
          )}
          {alreadyCount > 0 && (
            <>
              ,{" "}
              <span className="text-foreground font-medium">
                {alreadyCount} already in the right folder
              </span>
            </>
          )}
          {skippedCount > 0 && (
            <>
              ,{" "}
              <span className="text-foreground font-medium">
                {skippedCount} not moved (e.g. folder rows)
              </span>
            </>
          )}
          {failedCount > 0 && (
            <>
              ,{" "}
              <span className="text-destructive font-medium">
                {failedCount} failed
              </span>
            </>
          )}
          .
        </p>
      )}
      {folders.length > 0 && (
        <div>
          <p className="font-medium text-foreground mb-1.5">Folders</p>
          <ul className="max-h-28 overflow-y-auto rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
            {folders.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      )}
      {moved.length > 0 && (
        <div>
          <p className="font-medium text-foreground mb-1.5">Moved into folders</p>
          <ul className="max-h-48 overflow-y-auto rounded-md border bg-muted/30 px-3 py-2 space-y-1.5 text-xs">
            {moved.map((s) => (
              <li key={`${s.name}-${s.target_folder}`}>
                <span className="text-foreground">{s.name}</span>
                <span className="text-muted-foreground"> → {s.target_folder}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {alreadyPlaced.length > 0 && (
        <div>
          <p className="font-medium text-foreground mb-1.5">
            Already in the right folder
          </p>
          <p className="text-xs text-muted-foreground mb-1.5">
            These files already lived under the folder our rules assign — no API
            move was needed.
          </p>
          <ul className="max-h-40 overflow-y-auto rounded-md border bg-muted/30 px-3 py-2 space-y-1.5 text-xs">
            {alreadyPlaced.map((s) => (
              <li key={`${s.name}-${s.target_folder}`}>
                <span className="text-foreground">{s.name}</span>
                <span className="text-muted-foreground"> → {s.target_folder}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {skipped.length > 0 && (
        <div>
          <p className="font-medium text-foreground mb-1.5">
            Not moved (folders in results)
          </p>
          <ul className="max-h-32 overflow-y-auto rounded-md border bg-muted/30 px-3 py-2 space-y-1 text-xs text-muted-foreground">
            {skipped.map((s) => (
              <li key={s.name}>
                {s.name}
                {s.reason ? ` — ${skipReasonLabel(s.reason)}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
      {failed.length > 0 && (
        <div>
          <p className="font-medium text-destructive mb-1.5">Failed</p>
          <ul className="max-h-32 overflow-y-auto rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 space-y-1 text-xs">
            {failed.map((f) => (
              <li key={f.name}>
                {f.name}
                {f.reason ? ` (${f.reason})` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function loadChatsFromStorage(): {
  sessions: ChatSession[];
  currentId: string | null;
} {
  if (typeof window === "undefined") return { sessions: [], currentId: null };
  try {
    let raw = localStorage.getItem(CHAT_STORAGE_KEY);
    let fromLegacy = false;
    if (!raw) {
      raw = localStorage.getItem(LEGACY_CHAT_STORAGE_KEY);
      fromLegacy = !!raw;
    }
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
    if (fromLegacy) {
      try {
        localStorage.removeItem(LEGACY_CHAT_STORAGE_KEY);
      } catch {
        // ignore quota / private mode
      }
    }
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
  // const [listing, setListing] = useState(false); // used by List files (commented out)
  const [driveConnected, setDriveConnected] = useState<boolean | null>(null);
  const [selectedType, setSelectedType] = useState<ContentType>("general");
  const [hydrated, setHydrated] = useState(false);
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [loadingSummaries, setLoadingSummaries] = useState(false);
  const [resyncingDrive, setResyncingDrive] = useState(false);
  /** Wall-clock ms when resync is allowed again (set after successful sync only) */
  const [resyncCooldownUntil, setResyncCooldownUntil] = useState<number | null>(
    null,
  );
  const [, setResyncCooldownTick] = useState(0);
  const [driveActionConfirm, setDriveActionConfirm] = useState<
    "disconnect" | "sort" | null
  >(null);
  const [driveResultDialog, setDriveResultDialog] = useState<{
    variant: "success" | "error";
    title: string;
    body: React.ReactNode;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [youtubeData, setYoutubeData] = useState<{
    channel: YouTubeChannel | null;
    videos: YouTubeVideo[];
  } | null>(null);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [youtubeFetched, setYoutubeFetched] = useState(false);
  const [activeSocialPlatform, setActiveSocialPlatform] = useState<
    "youtube" | null
  >("youtube");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [attachments, setAttachments] = useState<AttachedImage[]>([]);
  const [driveImagesOpen, setDriveImagesOpen] = useState(false);
  const [driveImages, setDriveImages] = useState<
    Array<{
      id: string;
      name: string;
      mime_type: string;
      modified_time: string | null;
      size: number | null;
    }>
  >([]);
  const [driveImagesLoading, setDriveImagesLoading] = useState(false);
  const [drivePreviewFailed, setDrivePreviewFailed] = useState<Set<string>>(
    new Set(),
  );
  const [driveChipPreviewFailed, setDriveChipPreviewFailed] = useState<
    Set<string>
  >(new Set());
  const [searchDriveContext, setSearchDriveContext] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const driveImagesOpenRef = useRef(false);
  const retryOnLoadRef = useRef(false);
  /** Content type to restore when leaving Social Media Stats */
  const contentTypeBeforeSocialRef = useRef<ContentType>("general");

  const persistSidebarOpen = (open: boolean) => {
    setSidebarOpen(open);
    try {
      localStorage.setItem(SIDEBAR_OPEN_STORAGE_KEY, open ? "1" : "0");
    } catch {
      /* noop */
    }
  };

  const { theme } = useTheme();

  const isDark =
    mounted &&
    (theme === "dark" ||
      (theme === "system" &&
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches));

  const getContentTypeIconSrc = (value: ContentType) => {
    const iconFolder = isDark ? "/icons/darkModeIcons" : "/icons";

    switch (value) {
      case "newsletter":
        return `${iconFolder}/newsletter.png`;
      case "blog-post":
        return `${iconFolder}/blog-post.png`;
      case "donor-email":
        return `${iconFolder}/donor-email.png`;
      case "social-media":
        return `${iconFolder}/social-media.png`;
      default:
        return `${iconFolder}/general.png`;
    }
  };
  const src = getIconPath("aorta-heart", isDark);

  const currentSession = chatSessions.find((s) => s.id === currentSessionId);
  /** Selected summary is stored on the current chat session so follow-ups use the same context */
  const selectedSummary = currentSession?.selectedSummary ?? null;
  const setSelectedSummaryForSession = (summary: SummaryItem | null) => {
    if (!currentSessionId) return;
    setChatSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId ? { ...s, selectedSummary: summary } : s,
      ),
    );
  };

  const sendMessageToApi = async (
    messageContent: string,
    contentType: ContentType,
    backendChatId: string | null,
    history: Message[],
    summaryFileId?: string,
    imageDriveIds?: string[],
    imageInline?: Array<{ mime_type: string; data: string }>,
    includeDriveContext?: boolean,
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
        imageDriveIds: imageDriveIds?.length ? imageDriveIds : undefined,
        imageInline: imageInline?.length ? imageInline : undefined,
        includeDriveContext: includeDriveContext ?? searchDriveContext,
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
        "Hello! I'm your AI content assistant. I can help you create newsletters, blog posts, donor emails, social media captions, and more!",
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
    markHasVisitedChat();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SIDEBAR_OPEN_STORAGE_KEY);
      if (raw !== null) setSidebarOpen(raw === "1");
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setSidebarOpen((prev) => {
        if (!prev) return prev;
        try {
          localStorage.setItem(SIDEBAR_OPEN_STORAGE_KEY, "0");
        } catch {
          /* noop */
        }
        return false;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => {
      document.body.style.overflow = mq.matches && sidebarOpen ? "hidden" : "";
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

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
      currentSession?.selectedSummary?.id,
      undefined,
      undefined,
      searchDriveContext,
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
    const params = new URLSearchParams(window.location.search);
    if (params.get("drive_connected") === "1") {
      setDriveResultDialog({
        variant: "success",
        title: "Google Drive connected",
        body: (
          <p className="text-muted-foreground">
            Aorta can read summaries, images, and file context from your Drive.
            Use the toolbar to attach images or build prompts from event
            summaries.
          </p>
        ),
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
    const err = params.get("drive_error");
    if (err) {
      setDriveResultDialog({
        variant: "error",
        title: "Couldn’t connect Google Drive",
        body: (
          <p className="text-muted-foreground break-words">{err}</p>
        ),
      });
      window.history.replaceState({}, "", window.location.pathname);
    }

    fetch("/api/drive/auth/status")
      .then((r) => r.json())
      .then((d: { connected?: unknown }) =>
        setDriveConnected(d?.connected === true),
      )
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
    if (!driveImagesOpen || !driveConnected) return;
    setDrivePreviewFailed(new Set());

    const cached = (() => {
      try {
        const raw = sessionStorage.getItem(DRIVE_IMAGES_LIST_CACHE_KEY);
        if (!raw) return null;
        const { images, fetchedAt } = JSON.parse(raw);
        if (
          !Array.isArray(images) ||
          Date.now() - (fetchedAt || 0) > DRIVE_IMAGES_LIST_CACHE_TTL_MS
        )
          return null;
        return images as Array<{
          id: string;
          name: string;
          mime_type: string;
          modified_time: string | null;
          size: number | null;
        }>;
      } catch {
        return null;
      }
    })();

    if (cached) {
      setDriveImages(cached);
      setDriveImagesLoading(false);
    } else {
      setDriveImagesLoading(true);
    }

    // Always refetch in background so new uploads appear even if TTL hasn't expired
    fetch("/api/drive/images?limit=100")
      .then((r) => (r.ok ? r.json() : { images: [] }))
      .then((d) => {
        const images = d.images || [];
        setDriveImages(images);
        setDriveImagesLoading(false);
        try {
          sessionStorage.setItem(
            DRIVE_IMAGES_LIST_CACHE_KEY,
            JSON.stringify({ images, fetchedAt: Date.now() }),
          );
        } catch {
          // ignore quota or disabled storage
        }
      })
      .catch(() => {
        if (!cached) setDriveImages([]);
        setDriveImagesLoading(false);
      });
  }, [driveImagesOpen, driveConnected]);

  useEffect(() => {
    driveImagesOpenRef.current = driveImagesOpen;
  }, [driveImagesOpen]);

  useEffect(() => {
    if (!resyncCooldownUntil || Date.now() >= resyncCooldownUntil) return;
    const id = window.setInterval(() => {
      setResyncCooldownTick((n) => n + 1);
      if (Date.now() >= resyncCooldownUntil) {
        window.clearInterval(id);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [resyncCooldownUntil]);

  const resyncOnCooldown =
    resyncCooldownUntil !== null && Date.now() < resyncCooldownUntil;
  const resyncCooldownSecondsLeft = resyncCooldownUntil
    ? Math.max(0, Math.ceil((resyncCooldownUntil - Date.now()) / 1000))
    : 0;

  const onDrivePreviewError = (id: string) => {
    setDrivePreviewFailed((prev) => new Set(prev).add(id));
  };

  const onLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const next: AttachedImage[] = [...attachments];
    for (let i = 0; i < files.length && next.length < MAX_ATTACHMENTS; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_IMAGE_SIZE_BYTES) continue;
      const preview = URL.createObjectURL(file);
      next.push({ type: "local", file, preview });
    }
    setAttachments(next);
    e.target.value = "";
  };

  const addDriveImage = (
    id: string,
    name: string,
    modifiedTime?: string | null,
  ) => {
    if (attachments.length >= MAX_ATTACHMENTS) return;
    if (attachments.some((a) => a.type === "drive" && a.id === id)) return;
    setAttachments((prev) => [
      ...prev,
      { type: "drive", id, name, modified_time: modifiedTime },
    ]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const next = [...prev];
      const a = next[index];
      if (a.type === "local" && a.preview) URL.revokeObjectURL(a.preview);
      if (a.type === "drive")
        setDriveChipPreviewFailed((s) => {
          const n = new Set(s);
          n.delete(a.id);
          return n;
        });
      next.splice(index, 1);
      return next;
    });
  };

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
    if (messages.length === 0 && !isLoading) {
      messagesScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    scrollToBottom();
  }, [messages, isLoading]);

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
      selectedSummary: null,
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

  const fileToBase64 = (
    file: File,
  ): Promise<{ mime_type: string; data: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const data = (reader.result as string).split(",")[1];
        if (!data) return reject(new Error("Invalid file read"));
        resolve({
          mime_type: file.type || "image/jpeg",
          data,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
        selectedSummary: null,
      };
      setChatSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
    }

    const attachmentDisplays: MessageAttachmentDisplay[] = attachments.map(
      (a) =>
        a.type === "local"
          ? { type: "local", preview: a.preview }
          : {
              type: "drive",
              id: a.id,
              name: a.name,
              modified_time: a.modified_time,
            },
    );

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      attachments: attachmentDisplays.length ? attachmentDisplays : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = input;
    setInput("");
    setIsLoading(true);

    const fileIdToSend = currentSession?.selectedSummary?.id;
    const driveIds = attachments
      .filter((a): a is DriveAttachment => a.type === "drive")
      .map((a) => a.id);
    let imageInlinePayload:
      | Array<{ mime_type: string; data: string }>
      | undefined;
    const localAttachments = attachments.filter(
      (a): a is LocalAttachment => a.type === "local",
    );
    if (localAttachments.length > 0) {
      try {
        imageInlinePayload = await Promise.all(
          localAttachments.map((a) => fileToBase64(a.file)),
        );
      } catch (err) {
        console.error("Failed to read local images:", err);
      }
    }
    setAttachments([]);

    try {
      await sendMessageToApi(
        messageToSend,
        selectedType,
        currentSession?.backendChatId ?? null,
        messages,
        fileIdToSend,
        driveIds.length ? driveIds : undefined,
        imageInlinePayload,
        searchDriveContext,
      );
    } catch (error) {
      console.error("[aorta-ai-assistant] Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Hello! I'm your AI content assistant. Currently in demo mode — please connect your backend API.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
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
      setDriveResultDialog({
        variant: "success",
        title: "Disconnected from Google Drive",
        body: (
          <p className="text-muted-foreground">
            Aorta no longer has access to your account for this app. Nothing was
            deleted in Drive. Reconnect anytime from the toolbar to use
            summaries, images, and context again.
          </p>
        ),
      });
    } catch (e) {
      setDriveResultDialog({
        variant: "error",
        title: "Disconnect failed",
        body: (
          <p className="text-muted-foreground">
            {e instanceof Error ? e.message : "Disconnect failed"}
          </p>
        ),
      });
    }
  };

  const connectDrive = async () => {
    try {
      const res = await fetch("/api/drive/auth/url");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get auth URL");
      window.location.href = data.url;
    } catch (e) {
      setDriveResultDialog({
        variant: "error",
        title: "Couldn’t start Google sign-in",
        body: (
          <p className="text-muted-foreground">
            {e instanceof Error ? e.message : "Connect failed"}
          </p>
        ),
      });
    }
  };

  /* List files — disabled (see header toolbar comment)
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
  */

  const sortDrive = async () => {
    setSorting(true);
    try {
      const res = await fetch("/api/drive/sort", { method: "POST" });
      const data = (await res.json()) as SortDriveApiResponse & {
        error?: string;
        detail?: string;
      };
      if (!res.ok) {
        const msg =
          typeof data.error === "string"
            ? data.error
            : typeof data.detail === "string"
              ? data.detail
              : "Sort failed";
        throw new Error(msg);
      }
      setDriveResultDialog({
        variant: "success",
        title: data.message || "Sorting complete",
        body: <SortDriveResultBody data={data} />,
      });
    } catch (e) {
      setDriveResultDialog({
        variant: "error",
        title: "Sorting failed",
        body: (
          <p className="text-muted-foreground">
            {e instanceof Error ? e.message : "Sort failed"}
          </p>
        ),
      });
    } finally {
      setSorting(false);
    }
  };

  /** Re-hit Drive on the server, then refresh summary pills and image list cache */
  const resyncDriveFromCloud = async () => {
    if (
      driveConnected !== true ||
      resyncingDrive ||
      (resyncCooldownUntil !== null && Date.now() < resyncCooldownUntil)
    ) {
      return;
    }
    setResyncingDrive(true);
    setLoadingSummaries(true);
    try {
      const syncRes = await fetch("/api/drive/sync", { method: "POST" });
      const syncJson = await syncRes.json().catch(() => ({}));
      if (!syncRes.ok) {
        const msg =
          typeof syncJson.error === "string"
            ? syncJson.error
            : typeof syncJson.detail === "string"
              ? syncJson.detail
              : "Drive sync failed";
        throw new Error(msg);
      }
      const [sumRes, imgRes] = await Promise.all([
        fetch("/api/drive/summaries"),
        fetch("/api/drive/images?limit=100"),
      ]);
      const sumData = sumRes.ok ? await sumRes.json() : { summaries: [] };
      const imgData = imgRes.ok ? await imgRes.json() : { images: [] };
      setSummaries(sumData.summaries || []);
      const images = imgData.images || [];
      try {
        sessionStorage.setItem(
          DRIVE_IMAGES_LIST_CACHE_KEY,
          JSON.stringify({ images, fetchedAt: Date.now() }),
        );
      } catch {
        /* noop */
      }
      if (driveImagesOpenRef.current) {
        setDriveImages(images);
      }
      setResyncCooldownUntil(Date.now() + DRIVE_RESYNC_COOLDOWN_MS);
    } catch (e) {
      setDriveResultDialog({
        variant: "error",
        title: "Resync failed",
        body: (
          <p className="text-muted-foreground">
            {e instanceof Error ? e.message : "Resync failed"}
          </p>
        ),
      });
    } finally {
      setLoadingSummaries(false);
      setResyncingDrive(false);
    }
  };

  const fetchYouTubeData = async () => {
    if (youtubeFetched && youtubeData) return;
    setYoutubeLoading(true);
    setYoutubeError(null);
    try {
      const res = await fetch("/api/youtube");
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to fetch YouTube data");
      setYoutubeData(data);
      setYoutubeFetched(true);
    } catch (e) {
      setYoutubeError(
        e instanceof Error ? e.message : "Failed to fetch YouTube data",
      );
    } finally {
      setYoutubeLoading(false);
    }
  };

  useEffect(() => {
    if (selectedType === "social-reach" && activeSocialPlatform === "youtube") {
      fetchYouTubeData();
    }
  }, [selectedType, activeSocialPlatform]);

  const formatCount = (n: string) => {
    const num = parseInt(n, 10);
    if (isNaN(num)) return "0";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
  };

  const openSocialStatsView = () => {
    if (selectedType !== "social-reach") {
      contentTypeBeforeSocialRef.current = selectedType;
    }
    setSelectedType("social-reach");
  };

  const backToChatFromSocial = () => {
    setSelectedType(contentTypeBeforeSocialRef.current);
  };

  /** Leave stats/other views and focus the main chat composer */
  const goToChatHome = () => {
    if (selectedType === "social-reach") {
      setSelectedType(contentTypeBeforeSocialRef.current);
    }
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      messagesScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close sidebar"
          onClick={() => persistSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-card shrink-0 overflow-y-auto overflow-x-hidden",
          "transition-[transform,width] duration-200 ease-in-out",
          "fixed inset-y-0 left-0 z-50 w-64 max-w-[min(100vw,16rem)] lg:static lg:z-auto lg:max-w-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          sidebarOpen ? "lg:w-64" : "lg:w-0 lg:min-w-0 lg:border-r-0",
        )}
      >
        <div className="p-4 border-b border-border flex items-center gap-2 w-full">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={() => persistSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </Button>
          <Button
            onClick={createNewChat}
            className="flex-1 min-w-0 bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2 shrink-0" />
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
          <button
            type="button"
            onClick={goToChatHome}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-1 -m-1 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Back to chat"
          >
            <div className="w-10 h-10 rounded flex items-center justify-center text-primary-foreground font-bold shrink-0">
              <Image
                src={getIconPath("aorta-heart", isDark)}
                alt=""
                width={50}
                height={50}
                className="rounded-full shadow-sm"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                AI Content Assistant
              </p>
              <p className="text-xs text-muted-foreground">AI Assistant</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Header */}
        <header className="border-b border-border bg-card/90 backdrop-blur-sm px-6 py-3">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 px-2.5 sm:px-3 shrink-0 border-border bg-background/80"
                    onClick={() => persistSidebarOpen(!sidebarOpen)}
                    aria-label={
                      sidebarOpen
                        ? "Hide chat list sidebar"
                        : "Show chat list sidebar"
                    }
                    aria-expanded={sidebarOpen}
                  >
                    {sidebarOpen ? (
                      <>
                        <ChevronLeft className="hidden sm:inline w-5 h-5 shrink-0 text-primary" />
                        <span className="hidden sm:inline text-xs font-semibold">
                          Hide chats
                        </span>
                        <X className="sm:hidden w-5 h-5 shrink-0 text-primary" />
                      </>
                    ) : (
                      <>
                        <Menu className="w-5 h-5 shrink-0 text-primary" />
                        <span className="hidden sm:inline text-xs font-semibold">
                          Chats
                        </span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="max-w-xs text-center">
                    {sidebarOpen
                      ? "Collapse the sidebar — chat history and content types"
                      : "Expand the sidebar — switch chats and pick a content type"}
                  </p>
                </TooltipContent>
              </Tooltip>

              <button
                type="button"
                onClick={goToChatHome}
                className="hidden cursor-pointer md:flex items-center gap-3 rounded-lg -my-1 -mx-2 px-2 py-1 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Back to chat"
              >
                <Image
                  src={getIconPath("aorta-heart", isDark)}
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-full shadow-sm shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-semibold tracking-tight text-foreground">
                      Aorta
                    </span>
                    <span className="h-5 w-px bg-border shrink-0" />
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      AI Content Assistant
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Create newsletters, social content, and more.
                  </p>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Social Media Stats button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={
                      selectedType === "social-reach" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={openSocialStatsView}
                    className="hidden sm:inline-flex items-center gap-2"
                  >
                    <BarChart2 className="w-4 h-4" />
                    Social Media Stats
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-center">
                    YouTube Stats and other platforms
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Drive buttons group */}
              <div className="hidden md:flex items-center gap-1 bg-muted/60 border border-border rounded-lg px-1.5 py-1">
                {driveConnected === true ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDriveActionConfirm("disconnect")}
                        className="h-7 text-xs"
                      >
                        Disconnect Drive
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-center">
                        Clear the Google Drive integration
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={connectDrive}
                        className="h-7 text-xs"
                      >
                        Connect Google Drive
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-center">
                        Sign in with Google so Aorta can read Drive files,
                        summaries, and images you attach
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <div className="w-px h-4 bg-border" />
                {/* List files — disabled for now (dev/debug helper; restore if needed)
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
                */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={cn(
                        "inline-flex",
                        driveConnected !== true && "cursor-not-allowed",
                      )}
                      tabIndex={driveConnected !== true ? 0 : undefined}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDriveActionConfirm("sort")}
                        disabled={sorting || driveConnected !== true}
                        className="h-7 text-xs"
                      >
                        <FolderInput className="w-3.5 h-3.5 mr-1.5" />
                        {sorting ? "Sorting…" : "Sort Drive"}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-center">
                      {driveConnected === true
                        ? "Run the Organizer on your Drive - moves files into folders using naming rules"
                        : "Connect Google Drive to Access sorting."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Mobile: just connect/disconnect drive */}
              <div className="flex sm:hidden">
                {driveConnected === true ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDriveActionConfirm("disconnect")}
                      >
                        Disconnect Drive
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-center">
                        Clear the Google account link stored on the server for
                        this app
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={connectDrive}
                      >
                        Connect Drive
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-center">
                        Sign in with Google so Aorta can use your Drive files
                        and images
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 shrink-0"
                    asChild
                  >
                    <Link href="/?learn=1#how">
                      <HelpCircle className="w-4 h-4 shrink-0" />
                      <span className="hidden sm:inline font-medium">
                        How it works
                      </span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-center">
                    Open the intro site — features, how it works, and tips
                  </p>
                </TooltipContent>
              </Tooltip>

              <ThemeToggle />
            </div>
          </div>
        </header>

        {selectedType === "social-reach" ? (
          /* Social Media Stats Dashboard */
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Heading */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <BarChart2 className="w-6 h-6 text-primary shrink-0" />
                  <h2 className="text-2xl font-bold text-foreground">
                    Social Media Stats
                  </h2>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 shrink-0"
                  onClick={backToChatFromSocial}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to chat
                </Button>
              </div>

              {/* Platform buttons */}
              <div className="flex flex-wrap gap-2 items-center">
                {/* YouTube */}
                <Button
                  variant={
                    activeSocialPlatform === "youtube" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setActiveSocialPlatform("youtube");
                    fetchYouTubeData();
                  }}
                  disabled={youtubeLoading}
                  className="flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
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
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.83 1.54V6.78a4.85 4.85 0 0 1-1.06-.09z" />
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
                      <p className="text-sm text-destructive mb-3">
                        {youtubeError}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setYoutubeFetched(false);
                          fetchYouTubeData();
                        }}
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
                              <p className="text-xs text-muted-foreground">
                                Subscribers
                              </p>
                              <p className="text-base font-semibold text-foreground">
                                {formatCount(
                                  youtubeData.channel.subscriberCount,
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Total Views
                              </p>
                              <p className="text-base font-semibold text-foreground">
                                {formatCount(youtubeData.channel.viewCount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Videos
                              </p>
                              <p className="text-base font-semibold text-foreground">
                                {formatCount(youtubeData.channel.videoCount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                  {youtubeData?.videos &&
                    youtubeData.videos.length > 0 &&
                    !youtubeLoading && (
                      <div>
                        <h3 className="text-base font-semibold text-foreground mb-3">
                          Recent Videos
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {youtubeData.videos.map((video) => (
                            <Card
                              key={video.id}
                              className="py-0 overflow-hidden"
                            >
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
                                  {new Date(
                                    video.publishedAt,
                                  ).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                                <div className="flex gap-3 text-xs text-muted-foreground pt-1">
                                  <span>
                                    {formatCount(video.viewCount)} views
                                  </span>
                                  <span>
                                    {formatCount(video.likeCount)} likes
                                  </span>
                                  <span>
                                    {formatCount(video.commentCount)} comments
                                  </span>
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
                <p className="text-sm text-muted-foreground">
                  Select a platform above to view analytics.
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div
              ref={messagesScrollRef}
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
            >
              <div className="max-w-4xl mx-auto p-4 space-y-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center text-center pt-4 pb-8 sm:pt-6 sm:pb-10">
                    <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-5 shadow-md">
                      <Image
                        src="/icons/aorta-heart.png"
                        alt="Aorta heart"
                        width={40}
                        height={40}
                        priority
                      />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">
                      Welcome to AI Content Assistant
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6 max-w-2xl text-balance">
                      I'm here to help you create engaging content for Black
                      Creek Youth Initiative. Generate newsletters, blog posts,
                      donor emails, social media captions, and more!
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                      {contentTypes.slice(0, 4).map((type) => (
                        <Card
                          key={type.value}
                          className={cn(
                            "p-4 min-h-[148px] hover:shadow-lg transition-shadow cursor-pointer border bg-card/90",
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
                          <div className="mt-2 mb-3 flex h-14 items-center justify-center rounded-lg bg-muted/30">
                            <Image
                              src={getContentTypeIconSrc(
                                type.value as ContentType,
                              )}
                              alt=""
                              width={32}
                              height={32}
                              loading="eager"
                              className="object-contain"
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
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start",
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
                            ref={(el) => {
                              messageRefs.current[message.id] = el;
                            }}
                            className="leading-relaxed pr-6 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0"
                          >
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <>
                            {message.attachments &&
                              message.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {message.attachments.map((att, idx) => (
                                    <div
                                      key={
                                        att.type === "local"
                                          ? att.preview
                                          : att.id
                                      }
                                      className="rounded-lg overflow-hidden border border-white/20 shrink-0"
                                      style={{ maxWidth: 160, maxHeight: 120 }}
                                    >
                                      {att.type === "local" ? (
                                        <img
                                          src={att.preview}
                                          alt=""
                                          className="w-full h-full object-cover max-h-[120px]"
                                          onError={(e) => {
                                            e.currentTarget.style.display =
                                              "none";
                                          }}
                                        />
                                      ) : (
                                        <img
                                          src={`/api/drive/images/${encodeURIComponent(att.id)}/preview?mtime=${encodeURIComponent(att.modified_time || "")}`}
                                          alt=""
                                          className="w-full h-full object-cover max-h-[120px]"
                                          onError={(e) => {
                                            e.currentTarget.style.display =
                                              "none";
                                          }}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </p>
                          </>
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

            {/* Input Area — sits above dev overlays; blur helps hide stray fixed UI behind */}
            <div className="relative z-30 border-t border-border bg-card/95 backdrop-blur-md p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_32px_-8px_rgba(0,0,0,0.08)]">
              <div className="max-w-4xl mx-auto space-y-2 sm:space-y-3">
                {driveConnected === true && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Latest events (select to build prompt)
                      </p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className={cn(
                              "inline-flex",
                              (resyncingDrive || resyncOnCooldown) &&
                                "cursor-not-allowed",
                            )}
                            tabIndex={
                              resyncingDrive || resyncOnCooldown ? 0 : undefined
                            }
                          >
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 gap-1.5 px-2.5 text-xs shrink-0"
                              disabled={resyncingDrive || resyncOnCooldown}
                              onClick={() => void resyncDriveFromCloud()}
                            >
                              <RefreshCw
                                className={cn(
                                  "h-3.5 w-3.5",
                                  resyncingDrive && "animate-spin",
                                )}
                              />
                              {resyncingDrive
                                ? "Syncing…"
                                : resyncOnCooldown
                                  ? `Wait ${resyncCooldownSecondsLeft}s`
                                  : "Resync"}
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-center text-xs">
                            {resyncingDrive
                              ? "Syncing with Google Drive…"
                              : resyncOnCooldown
                                ? `You can resync once every 15 seconds. Try again in ${resyncCooldownSecondsLeft}s to avoid hitting Google rate limits.`
                                : "Refresh summaries and Drive images from Google Drive. After each successful resync, wait 15 seconds before the next one."}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
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
                              const next =
                                selectedSummary?.id === s.id ? null : s;
                              setSelectedSummaryForSession(next);
                              if (next)
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
                <p className="text-xs text-muted-foreground text-center px-1">
                  AI-powered content assistant for your organization
                </p>
                <form onSubmit={handleSubmit} className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/heic"
                    multiple
                    className="hidden"
                    onChange={onLocalFileChange}
                  />
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {attachments.map((a, i) => (
                        <div
                          key={a.type === "local" ? a.preview : a.id}
                          className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 overflow-hidden"
                        >
                          {a.type === "local" && (
                            <img
                              src={a.preview}
                              alt=""
                              className="h-10 w-10 object-cover shrink-0"
                            />
                          )}
                          {a.type === "drive" && (
                            <div className="h-10 w-10 shrink-0 bg-muted flex items-center justify-center rounded overflow-hidden relative">
                              {driveChipPreviewFailed.has(a.id) ? (
                                <HardDrive className="w-4 h-4 text-muted-foreground shrink-0" />
                              ) : (
                                <img
                                  src={`/api/drive/images/${encodeURIComponent(a.id)}/preview?mtime=${encodeURIComponent(a.modified_time || "")}`}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={() =>
                                    setDriveChipPreviewFailed((prev) =>
                                      new Set(prev).add(a.id),
                                    )
                                  }
                                />
                              )}
                            </div>
                          )}
                          <span className="text-xs truncate max-w-[120px] px-1">
                            {a.type === "local" ? a.file.name : a.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(i)}
                            className="p-1 hover:bg-muted rounded"
                            aria-label="Remove attachment"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              disabled={
                                isLoading ||
                                attachments.length >= MAX_ATTACHMENTS
                              }
                              className="h-[60px] w-[60px] rounded-xl shrink-0 border-border"
                              aria-label="Attach image"
                            >
                              <Paperclip className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[14rem]">
                          <p className="text-center text-balance leading-snug">
                            Add images from your device or Google Drive — up to
                            two per message.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent align="start" className="w-52">
                        <DropdownMenuItem
                          onClick={() => fileInputRef.current?.click()}
                          disabled={attachments.length >= MAX_ATTACHMENTS}
                        >
                          <ImagePlus className="w-4 h-4 mr-2" />
                          From device (max 2, 5MB each)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDriveImagesOpen(true)}
                          disabled={
                            driveConnected !== true ||
                            attachments.length >= MAX_ATTACHMENTS
                          }
                        >
                          <HardDrive className="w-4 h-4 mr-2" />
                          From Google Drive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <label
                            className={cn(
                              "flex h-[60px] shrink-0 items-center gap-2 rounded-xl border px-3 cursor-pointer transition-colors",
                              "bg-muted/70 border-border hover:bg-muted text-foreground",
                              searchDriveContext &&
                                "border-primary/40 bg-primary/10",
                            )}
                          >
                            <Switch
                              checked={searchDriveContext}
                              onCheckedChange={setSearchDriveContext}
                              aria-label="Search Drive for context"
                              className="data-[state=unchecked]:bg-muted data-[state=unchecked]:border data-[state=unchecked]:border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <span className="text-xs font-medium whitespace-nowrap">
                              Search Drive
                            </span>
                          </label>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-[15rem] px-3 py-2"
                        >
                          <p className="text-center text-balance text-xs leading-relaxed">
                            <span className="font-semibold">On:</span> include
                            Google Drive context in replies.
                          </p>
                          <p className="text-center text-balance text-xs leading-relaxed mt-2 pt-2 border-t border-background/25">
                            <span className="font-semibold">Off:</span> skip
                            Drive search for faster responses.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
            <AlertDialog
              open={driveActionConfirm !== null}
              onOpenChange={(open) => {
                if (!open) setDriveActionConfirm(null);
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {driveActionConfirm === "disconnect"
                      ? "Disconnect Google Drive?"
                      : "Sort files in Google Drive?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="text-sm text-muted-foreground space-y-2 text-left">
                      {driveActionConfirm === "disconnect" ? (
                        <>
                          <p className="font-semibold text-destructive">
                            Warning
                          </p>
                          <p>
                            Aorta will lose access to your Google account for
                            this app. Event summaries, Drive images, and file
                            context in chat will stop working until you connect
                            again. Nothing is deleted in Google Drive.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-destructive">
                            Warning
                          </p>
                          <p>
                            This runs the organizer and may move files into
                            folders based on naming rules. Changes apply
                            directly in your Drive. Make sure you are comfortable
                            with the rules before continuing — there is no
                            automatic undo.
                          </p>
                        </>
                      )}
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel type="button">No, cancel</AlertDialogCancel>
                  <Button
                    type="button"
                    variant={
                      driveActionConfirm === "disconnect"
                        ? "destructive"
                        : "default"
                    }
                    onClick={() => {
                      const action = driveActionConfirm;
                      setDriveActionConfirm(null);
                      if (action === "disconnect") void disconnectDrive();
                      else if (action === "sort") void sortDrive();
                    }}
                  >
                    {driveActionConfirm === "disconnect"
                      ? "Yes, disconnect"
                      : "Yes, sort files"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Dialog
              open={driveResultDialog !== null}
              onOpenChange={(open) => {
                if (!open) setDriveResultDialog(null);
              }}
            >
              <DialogContent className="sm:max-w-lg max-h-[min(90vh,32rem)] flex flex-col gap-0">
                <DialogHeader>
                  <DialogTitle
                    className={cn(
                      "flex items-start gap-2.5 pr-8 text-left",
                      driveResultDialog?.variant === "error" &&
                        "text-destructive",
                    )}
                  >
                    {driveResultDialog?.variant === "success" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    )}
                    <span>{driveResultDialog?.title}</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto min-h-0 py-2 text-sm">
                  {driveResultDialog?.body}
                </div>
                <DialogFooter className="pt-2 sm:pt-4">
                  <Button
                    type="button"
                    onClick={() => setDriveResultDialog(null)}
                  >
                    OK
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={driveImagesOpen} onOpenChange={setDriveImagesOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Choose image from Google Drive</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Select up to {MAX_ATTACHMENTS} images (max 5MB each). Newest
                  first. You can also type e.g. “Take the latest image and give
                  me an Instagram caption” to use the most recent image from
                  Drive without selecting it here.
                </p>
                {driveImagesLoading ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Loading images…
                  </div>
                ) : driveImages.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No images found in Drive, or connect Google Drive first.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto min-h-0">
                    {driveImages.map((img) => {
                      const already = attachments.some(
                        (a) => a.type === "drive" && a.id === img.id,
                      );
                      const disabled =
                        already ||
                        (attachments.length >= MAX_ATTACHMENTS &&
                          !attachments.some(
                            (a) => a.type === "drive" && a.id === img.id,
                          ));
                      return (
                        <button
                          key={img.id}
                          type="button"
                          disabled={disabled}
                          onClick={() =>
                            addDriveImage(img.id, img.name, img.modified_time)
                          }
                          className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-lg border text-left transition-colors",
                            "hover:bg-muted/80 disabled:opacity-50 disabled:pointer-events-none",
                            already && "ring-2 ring-primary",
                          )}
                        >
                          <div className="w-full aspect-square bg-muted rounded flex items-center justify-center overflow-hidden relative">
                            {drivePreviewFailed.has(img.id) ? (
                              <HardDrive className="w-8 h-8 text-muted-foreground shrink-0" />
                            ) : (
                              <img
                                src={`/api/drive/images/${encodeURIComponent(img.id)}/preview?mtime=${encodeURIComponent(img.modified_time || "")}`}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={() => onDrivePreviewError(img.id)}
                              />
                            )}
                          </div>
                          <span className="text-xs truncate w-full">
                            {img.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </main>
    </div>
  );
}
