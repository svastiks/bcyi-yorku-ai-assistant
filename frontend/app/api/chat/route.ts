import { NextRequest, NextResponse } from 'next/server'
import { BackendAPIClient } from '@/lib/api-client'
import { toBackendContentType } from '@/lib/content-types'
import { RateLimitedError, RATE_LIMIT_USER_MESSAGE } from '@/lib/rate-limit'

const backendAPI = new BackendAPIClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, contentType, history, chatId, summaryFileId, imageDriveIds, imageInline, includeDriveContext } = body

    // Convert frontend content type (kebab-case) to backend format (snake_case)
    const backendContentType = toBackendContentType(contentType);

    // Try to call actual backend API
    try {
      // Check if we have a chat ID, if not create one
      let sessionChatId = chatId;
      
      if (!sessionChatId) {
        const createResponse = await backendAPI.createChat(backendContentType);
        sessionChatId = createResponse.chat_id;
      }

      // Send message to backend (optional: context summary, image attachments)
      const response = await backendAPI.sendMessage(sessionChatId, message, {
        context_file_id: summaryFileId || undefined,
        image_drive_ids: Array.isArray(imageDriveIds) ? imageDriveIds : undefined,
        image_inline: Array.isArray(imageInline) ? imageInline : undefined,
        include_drive_context: typeof includeDriveContext === "boolean" ? includeDriveContext : undefined,
      });

      return NextResponse.json({
        message: response.message,
        contentType,
        chatId: sessionChatId,
        contextFilesUsed: response.context_files_used,
      });
    } catch (backendError) {
      if (backendError instanceof RateLimitedError) {
        return NextResponse.json(
          { error: RATE_LIMIT_USER_MESSAGE, code: 'rate_limit' },
          { status: 429 },
        )
      }
      console.error('[API] Backend error, falling back to demo:', backendError);

      // Fallback to demo response if backend is unavailable
      const demoResponse = getDemoResponse(contentType);
      
      return NextResponse.json({
        message: demoResponse,
        contentType,
        chatId: chatId || `demo-${Date.now()}`,
        contextFilesUsed: 0,
        demo: true,
      });
    }
  } catch (error) {
    console.error('[API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

function getDemoResponse(contentType: string): string {
  // Demo response for testing when backend is unavailable
  const demoResponses: Record<string, string> = {
      newsletter: `Here's a draft newsletter:

**Monthly Update - [Your Organization]**

Dear Community,

This month has been filled with incredible moments of growth and connection in our programs. Use your event summary or context files to fill in specific highlights, numbers, and upcoming events.

Highlights:
• [Use context for key outcomes and partnerships]
• [Use context for program completions or milestones]
• [Use context for upcoming events]

Your support makes all of this possible. Together, we're building a stronger community.

With gratitude,
[Your Team Name]`,
      'blog-post': `Here's a blog post draft:

**[Use context for a specific, compelling title]**

[Use your event summaries and impact stories to open with a real story or moment.]

Through our programs, we've seen the power of [use context for themes: leadership, community, etc.]. From [use context for examples], our participants show that with the right support, people can transform their communities.

[Use context for specific initiatives, outcomes, and a closing that ties to your mission.]

What would you like to adjust or expand?`,
      'donor-email': `Here's a thank you email for donors:

Subject: Your Impact - Thank You!

Dear [Donor Name],

On behalf of everyone at [Your Organization], thank you for your generous donation of [Amount].

Your support directly enables us to:
• [Use context for programs and services]
• [Use context]
• [Use context]

[Use context for a specific impact story or number.]

Thank you for believing in our mission and investing in our community.

With deep appreciation,
[Your Name]
[Title]`,
      'social-media': `Here are some social media caption ideas:

[Use your event summary or context to plug in your organization name, event details, and hashtags.]

Instagram Post 1:
[Hook from context] — [key detail]. [CTA]. [Hashtags from context]

Instagram Post 2:
[Quote or moment from context] [Engagement prompt] [Hashtags]

Instagram Post 3:
[Event or program highlight from context] [CTA] [Hashtags]

Upload an event summary or connect Google Drive so I can pull your real events and voice.`,
      general: `Hello! I'm your AI content assistant. I can help you create:

📧 **Newsletters** - Monthly updates and community announcements
✍️ **Blog Posts** - Stories and impact pieces
💝 **Donor Emails** - Thank you notes and impact reports
📱 **Social Media Content** - Captions for Instagram, Facebook, and more

Upload an event summary or connect Google Drive to give me your organization's context — then I'll match your voice and use real details from your files.

What would you like to work on today?`,
  }

  return demoResponses[contentType] || demoResponses.general;
}
