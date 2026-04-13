/**
 * After a user has opened the chat app once, `/` redirects to `/chat` so they
 * land where they work. Use `/?learn=1` (optionally `#how`) from the chat UI
 * to view the marketing page without redirect.
 */
export const HAS_VISITED_CHAT_STORAGE_KEY = "aorta_has_visited_chat";

/** Survives stripping `?learn=1` from the URL (e.g. React Strict Mode re-runs). Cleared when opening chat. */
const LANDING_SESSION_BYPASS_KEY = "aorta_marketing_session";

export function readHasVisitedChat(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(HAS_VISITED_CHAT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSessionMarketingBypass(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(LANDING_SESSION_BYPASS_KEY, "1");
  } catch {
    // ignore
  }
}

export function readSessionMarketingBypass(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(LANDING_SESSION_BYPASS_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearSessionMarketingBypass(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(LANDING_SESSION_BYPASS_KEY);
  } catch {
    // ignore
  }
}

export function markHasVisitedChat(): void {
  if (typeof window === "undefined") return;
  clearSessionMarketingBypass();
  try {
    localStorage.setItem(HAS_VISITED_CHAT_STORAGE_KEY, "1");
  } catch {
    // ignore quota / private mode
  }
}

/** When this query param is present, the landing page is shown even if the user has visited chat. */
export const LANDING_BYPASS_REDIRECT_PARAM = "learn";
