import { NextRequest, NextResponse } from 'next/server'
import { BackendAPIClient } from '@/lib/api-client'
import { toBackendContentType } from '@/lib/content-types'

const backendAPI = new BackendAPIClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, contentType, history, chatId, summaryFileId } = body

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

      // Send message to backend (optional: priority context from selected event summary)
      const response = await backendAPI.sendMessage(sessionChatId, message, {
        context_file_id: summaryFileId || undefined,
      });

      return NextResponse.json({
        message: response.message,
        contentType,
        chatId: sessionChatId,
        contextFilesUsed: response.context_files_used,
      });
    } catch (backendError) {
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
      newsletter: `Here's a draft newsletter for BCYI:

**Monthly Update - Youth Empowerment in Action**

Dear BCYI Community,

This month has been filled with incredible moments of growth and connection in our programs. Our Youth Hub welcomed 45 young people who participated in leadership workshops, art sessions, and community building activities.

Highlights:
• 3 new community partnerships established
• 28 youth completed our violence prevention program
• Upcoming: Annual Community Celebration on March 15th

Your support makes all of this possible. Together, we're building a stronger, more inclusive Black Creek community.

With gratitude,
The BCYI Team`,
      'blog-post': `Here's a blog post draft about youth leadership:

**Young People at the Heart of Change**

At the Black Creek Youth Initiative, we believe that young people aren't just the leaders of tomorrow—they're the changemakers of today.

Through our programs, we've witnessed the incredible power of youth-led action. From organizing community events to advocating for human rights, our participants demonstrate that when given the right support and resources, young people can transform their communities.

This year alone, we've seen youth lead initiatives on racial justice, mental health awareness, and environmental sustainability. Their creativity, passion, and determination inspire us every day.

Join us in supporting these amazing young leaders as they continue to shape a brighter future for Black Creek and beyond.`,
      'donor-email': `Here's a thank you email for donors:

Subject: Your Impact on Young Lives - Thank You!

Dear [Donor Name],

On behalf of everyone at Black Creek Youth Initiative, I want to express our heartfelt gratitude for your generous donation of [Amount].

Your support directly enables us to:
• Provide safe, inclusive spaces for youth aged 12-29
• Deliver mental health support and violence prevention programs
• Offer homework help and educational resources
• Create opportunities for community engagement and leadership development

Last month alone, your contribution helped 85 young people access programs that are changing their lives. Stories like [Youth Story] remind us why this work matters.

Thank you for believing in our youth and investing in their future.

With deep appreciation,
[Your Name]
Executive Director, BCYI`,
      'social-media': `Here are some social media caption ideas for BCYI:

Instagram Post 1:
🌟 Youth empowerment in action! Our weekly programs bring young people together to learn, grow, and build community. Every Tuesday & Thursday, 4:30-6 PM at the Community Room. All youth ages 12-29 welcome! 💪🏽✨ #BCYI #BlackCreekYouth #YouthLeadership #CommunityMatters

Instagram Post 2:
💬 "This program isn't just about homework—it's about growing up together. It's a space where being real is valued more than being perfect." - Deandre, Program Participant

Your story matters. Your voice matters. Join us. 🫱🏽‍🫲🏾 #YouthVoices #Inclusion #BCYI

Instagram Post 3:
🎨 Creativity heals. Last week's art workshop was filled with color, expression, and powerful moments of self-discovery. Swipe to see what our youth created! → #ArtTherapy #YouthEmpowerment #BlackCreekStrong`,
      general: `Hello! I'm your BCYI x YorkU AI assistant. I can help you create:

📧 **Newsletters** - Monthly updates and community announcements
✍️ **Blog Posts** - Stories about youth leadership and community impact
💝 **Donor Emails** - Thank you notes and impact reports
📱 **Social Media Content** - Engaging captions for Instagram, Facebook, and more

Just let me know what type of content you'd like to create, and I'll help you craft something that captures the spirit of BCYI and resonates with your audience!

What would you like to work on today?`,
  }

  return demoResponses[contentType] || demoResponses.general;
}
