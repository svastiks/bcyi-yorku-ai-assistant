/**
 * Prompt variable options (from Prompt Variable Options UI).
 * Each option has a label and promptText: the phrase added to the generated prompt.
 */

export type PromptOption = { id: string; label: string; promptText: string }

export const PROMPT_TYPE_OPTIONS: PromptOption[] = [
  { id: 'social-media', label: 'Social Media', promptText: 'Create social media content.' },
  { id: 'newsletter', label: 'Newsletter', promptText: 'Create newsletter content.' },
  { id: 'blog-post', label: 'Blog Post', promptText: 'Create a blog post.' },
  { id: 'donor-email', label: 'Donor Email', promptText: 'Create donor email content.' },
]

export const PROMPT_OUTPUT_OPTIONS: PromptOption[] = [
  { id: 'caption', label: 'Generate a caption idea', promptText: 'Generate a caption idea.' },
  { id: 'email-hook', label: 'Generate an email hook', promptText: 'Generate an email hook subject line.' },
  { id: 'complete-post', label: 'Generate a complete post', promptText: 'Generate a complete post with a title, brief caption, body and hashtag sets.' },
]

export const WRITING_TONE_OPTIONS: PromptOption[] = [
  { id: 'upbeat', label: 'Make the tone upbeat and cheerful', promptText: 'Write with a tone that sounds upbeat, cheerful and approachable.' },
  { id: 'warm', label: 'Make the tone warm and human', promptText: 'Write with a tone that sounds warm, inviting and empathetic.' },
  { id: 'professional', label: 'Make the tone professional and direct', promptText: 'Write with a tone that sounds professional and direct about impact.' },
]

export const SOCIAL_MEDIA_TYPE_OPTIONS: PromptOption[] = [
  { id: 'linkedin', label: 'LinkedIn', promptText: 'Write the post in a format suitable for LinkedIn.' },
  { id: 'instagram', label: 'Instagram', promptText: 'Write the post in a format suitable for Instagram.' },
]

export const LENGTH_OPTIONS: PromptOption[] = [
  { id: '150', label: 'Keep under 150 words', promptText: 'Keep under 150 words.' },
  { id: '300', label: 'Keep under 300 words', promptText: 'Keep under 300 words.' },
  { id: '5para', label: 'Keep concise with fewer than 5 total paragraphs', promptText: 'Keep concise with fewer than 5 total paragraphs.' },
]

export const STRUCTURE_OPTIONS: PromptOption[] = [
  { id: 'longer', label: 'Use longer structured sentences when possible', promptText: 'Use longer structured sentences when possible.' },
  { id: 'shorter', label: 'Use shorter sentences when possible', promptText: 'Use shorter sentences when possible.' },
  { id: 'bullets', label: 'Include bullet point style formatting when necessary', promptText: 'Include bullet point style formatting when necessary.' },
]

export const INCLUDE_OPTIONS: PromptOption[] = [
  { id: 'cta', label: 'Include a call to action', promptText: 'Include a call to action.' },
  { id: 'data', label: 'Include a data point', promptText: 'Include a data point.' },
  { id: 'credibility', label: 'Include credibility signals', promptText: 'Include credibility signals.' },
]

export const AVOID_OPTIONS: PromptOption[] = [
  { id: 'buzzwords', label: 'Avoid buzzwords', promptText: 'Avoid buzzwords.' },
  { id: 'sales', label: 'Avoid sounding sales-driven', promptText: 'Avoid sounding sales-driven.' },
]

export const STRATEGIC_GOAL_OPTIONS: PromptOption[] = [
  { id: 'trust', label: 'Focus on building trust', promptText: 'Focus on building trust.' },
  { id: 'impact', label: 'Focus on demonstrating measurable impact', promptText: 'Focus on demonstrating measurable impact.' },
  { id: 'awareness', label: 'Focus on building awareness', promptText: 'Focus on building awareness.' },
]

export const OUTPUT_VARIATION_OPTIONS: PromptOption[] = [
  { id: 'hook-style', label: 'Each variation should use a different hook style', promptText: 'Each variation should use a different hook style.' },
  { id: 'statistic', label: 'Each variation should emphasize a different statistic or fact', promptText: 'Each variation should emphasize a different statistic or fact.' },
  { id: 'concise', label: 'Make one variation concise', promptText: 'Make one variation concise.' },
]

export function buildPromptFromSelections(parts: {
  promptOutput?: string
  tone?: string
  socialType?: string
  length?: string
  structure?: string
  include: string[]
  avoid: string[]
  avoidTopic?: string
  goal?: string
  variations: string[]
  eventName?: string
}): string {
  const bits: string[] = []
  if (parts.eventName) bits.push(`Based on the event summary: "${parts.eventName}".`)
  if (parts.promptOutput) bits.push(parts.promptOutput)
  if (parts.tone) bits.push(parts.tone)
  if (parts.socialType) bits.push(parts.socialType)
  if (parts.length) bits.push(parts.length)
  if (parts.structure) bits.push(parts.structure)
  if (parts.include.length) bits.push(parts.include.join(' '))
  if (parts.avoid.length) bits.push(parts.avoid.join(' '))
  if (parts.avoidTopic) bits.push(`Avoid specific topic: ${parts.avoidTopic}.`)
  if (parts.goal) bits.push(parts.goal)
  if (parts.variations.length) bits.push(parts.variations.join(' '))
  return bits.filter(Boolean).join(' ')
}
