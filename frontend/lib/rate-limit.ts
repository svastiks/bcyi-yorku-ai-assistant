/** User-facing copy when the backend returns HTTP 429 (slowapi / shared IP limits). */
export const RATE_LIMIT_USER_MESSAGE =
  "There's too much usage right now. Please try again soon.";

export class RateLimitedError extends Error {
  readonly code = "rate_limit" as const;
  constructor(message: string = RATE_LIMIT_USER_MESSAGE) {
    super(message);
    this.name = "RateLimitedError";
  }
}
