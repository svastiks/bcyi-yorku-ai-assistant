/**
 * API client for AI Content Assistant backend
 */

// On server-side (Next.js API routes), use BACKEND_URL (works in Docker)
// On client-side (browser), use NEXT_PUBLIC_BACKEND_URL
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export class BackendAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Create a new chat session
   */
  async createChat(contentType: string): Promise<{ chat_id: string; content_type: string; created_at: string }> {
    const response = await fetch(`${this.baseUrl}/api/chat/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_type: contentType }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create chat: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Send a message in a chat (optionally with attached images)
   */
  async sendMessage(
    chatId: string,
    message: string,
    opts?: {
      context_file_id?: string;
      image_drive_ids?: string[];
      image_inline?: Array<{ mime_type: string; data: string }>;
      include_drive_context?: boolean;
    }
  ): Promise<{
    message: string;
    context_files_used: number;
    timestamp: string;
  }> {
    const body: {
      message: string;
      context_file_id?: string;
      image_drive_ids?: string[];
      image_inline?: Array<{ mime_type: string; data: string }>;
      include_drive_context?: boolean;
    } = { message };
    if (opts?.context_file_id) body.context_file_id = opts.context_file_id;
    if (opts?.image_drive_ids?.length) body.image_drive_ids = opts.image_drive_ids;
    if (opts?.image_inline?.length) body.image_inline = opts.image_inline;
    if (opts?.include_drive_context === false) body.include_drive_context = false;
    const response = await fetch(`${this.baseUrl}/api/chat/${chatId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get chat history
   */
  async getChat(chatId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/chat/${chatId}`);

    if (!response.ok) {
      throw new Error(`Failed to get chat: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get content types
   */
  async getContentTypes(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }>> {
    const response = await fetch(`${this.baseUrl}/api/content/types`);

    if (!response.ok) {
      throw new Error(`Failed to get content types: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get OAuth URL to connect Google Drive (user redirects to this URL)
   */
  async getDriveAuthUrl(): Promise<{ url: string; state: string }> {
    const response = await fetch(`${this.baseUrl}/api/drive/auth/url`);
    if (!response.ok) throw new Error('Failed to get auth URL');
    return response.json();
  }

  /**
   * Check if Google Drive is connected (OAuth)
   */
  async getDriveAuthStatus(): Promise<{ connected: boolean }> {
    const response = await fetch(`${this.baseUrl}/api/drive/auth/status`);
    if (!response.ok) return { connected: false };
    return response.json();
  }

  /**
   * Disconnect Google Drive (clear OAuth token)
   */
  async disconnectDrive(): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/drive/auth/disconnect`, { method: 'POST' });
    if (!response.ok) throw new Error('Disconnect failed');
    return response.json();
  }

  /**
   * List event summary files (Summaries folder or name contains "summary") for prompt suggestions
   */
  async getSummaries(): Promise<{ summaries: Array<{ id: string; name: string; modified_time: string | null }> }> {
    const response = await fetch(`${this.baseUrl}/api/drive/summaries`);
    if (!response.ok) throw new Error('Failed to list summaries');
    return response.json();
  }

  /**
   * List Drive file names (optional read_sample=filename returns content preview)
   */
  async listDriveFiles(params?: { folderId?: string; limit?: number; readSample?: string }): Promise<{
    files: Array<{ id: string; name: string; mime_type: string }>;
    count: number;
    file_names: string[];
    read_sample?: { file_name: string; content_preview?: string; found?: boolean };
  }> {
    const sp = new URLSearchParams();
    if (params?.folderId) sp.set('folder_id', params.folderId);
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.readSample) sp.set('read_sample', params.readSample);
    const q = sp.toString();
    const response = await fetch(`${this.baseUrl}/api/drive/files${q ? `?${q}` : ''}`);
    if (!response.ok) throw new Error(`List files failed: ${response.statusText}`);
    return response.json();
  }

  /**
   * List image files from Google Drive (sorted by modified time, newest first)
   */
  async getDriveImages(params?: { limit?: number }): Promise<{
    images: Array<{
      id: string;
      name: string;
      mime_type: string;
      created_time: string | null;
      modified_time: string | null;
      size: number | null;
    }>;
    count: number;
  }> {
    const sp = new URLSearchParams();
    if (params?.limit) sp.set('limit', String(params.limit));
    const q = sp.toString();
    const response = await fetch(`${this.baseUrl}/api/drive/images${q ? `?${q}` : ''}`);
    if (!response.ok) throw new Error('Failed to list Drive images');
    return response.json();
  }

  /**
   * Get the most recently modified image in Google Drive
   */
  async getLatestDriveImage(): Promise<{
    image: {
      id: string;
      name: string;
      mime_type: string;
      modified_time: string | null;
      size: number | null;
    } | null;
    message?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/drive/images/latest`);
    if (!response.ok) throw new Error('Failed to get latest Drive image');
    return response.json();
  }

  /**
   * Sort Google Drive files (prefixes/suffixes/metadata → folders)
   */
  async sortDrive(): Promise<{ message: string; stats: Record<string, number>; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/api/drive/sort`, { method: 'POST' });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const msg = body.detail ?? body.error ?? response.statusText;
      throw new Error(typeof msg === 'string' ? msg : 'Sort failed');
    }
    return response.json();
  }

  /**
   * Trigger a Drive sync (lists files on the server; use before refreshing summaries/images).
   */
  async syncDrive(): Promise<{ message: string; files_found: number; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/api/drive/sync`, { method: 'POST' });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const msg = body.detail ?? body.error ?? response.statusText;
      throw new Error(typeof msg === 'string' ? msg : 'Sync failed');
    }
    return response.json();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${this.baseUrl}/health`);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Singleton instance
export const backendAPI = new BackendAPIClient();
