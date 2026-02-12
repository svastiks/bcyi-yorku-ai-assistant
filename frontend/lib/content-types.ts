/**
 * Content type mappings between frontend and backend
 */

export const CONTENT_TYPE_MAP = {
  'newsletter': 'newsletter',
  'blog-post': 'blog_post',
  'donor-email': 'donor_email',
  'social-media': 'social_media',
  'general': 'general',
} as const;

export const REVERSE_CONTENT_TYPE_MAP = {
  'newsletter': 'newsletter',
  'blog_post': 'blog-post',
  'donor_email': 'donor-email',
  'social_media': 'social-media',
  'general': 'general',
} as const;

/**
 * Convert frontend content type to backend format
 */
export function toBackendContentType(frontendType: string): string {
  return CONTENT_TYPE_MAP[frontendType as keyof typeof CONTENT_TYPE_MAP] || frontendType;
}

/**
 * Convert backend content type to frontend format
 */
export function toFrontendContentType(backendType: string): string {
  return REVERSE_CONTENT_TYPE_MAP[backendType as keyof typeof REVERSE_CONTENT_TYPE_MAP] || backendType;
}
