import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const GRAPH = 'https://graph.facebook.com/v19.0'

async function graphGet(path: string, token: string, params: Record<string, string> = {}) {
  const url = new URL(`${GRAPH}${path}`)
  url.searchParams.set('access_token', token)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  const res = await fetch(url.toString())
  return res.json()
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value

  if (!token) {
    return NextResponse.json({ error: 'Not connected to Meta' }, { status: 401 })
  }

  try {
    // 1. Get Facebook pages
    const pagesData = await graphGet('/me/accounts', token, {
      fields: 'id,name,fan_count,followers_count,access_token',
    })

    if (pagesData.error) {
      return NextResponse.json({ error: pagesData.error.message }, { status: 400 })
    }

    const rawPages: Array<{
      id: string
      name: string
      fan_count?: number
      followers_count?: number
      access_token: string
    }> = pagesData.data || []

    const pages = await Promise.all(
      rawPages.slice(0, 1).map(async (page) => {
        // 2. Get recent posts for the page
        const postsData = await graphGet(`/${page.id}/posts`, page.access_token, {
          fields: 'message,created_time,likes.summary(true),comments.summary(true)',
          limit: '5',
        })

        const posts = (postsData.data || []).map((p: {
          id: string
          message?: string
          created_time: string
          likes?: { summary?: { total_count?: number } }
          comments?: { summary?: { total_count?: number } }
        }) => ({
          message: p.message || '',
          created_time: p.created_time,
          likes: p.likes?.summary?.total_count ?? 0,
          comments: p.comments?.summary?.total_count ?? 0,
        }))

        return {
          id: page.id,
          name: page.name,
          followers_count: String(page.followers_count ?? 0),
          fan_count: String(page.fan_count ?? 0),
          pageUrl: `https://www.facebook.com/${page.id}`,
          posts,
        }
      })
    )

    // 3. Get Instagram business account linked to first page
    let instagram = null
    if (rawPages.length > 0) {
      const firstPage = rawPages[0]
      const igLinkData = await graphGet(`/${firstPage.id}`, firstPage.access_token, {
        fields: 'instagram_business_account',
      })

      const igId = igLinkData?.instagram_business_account?.id
      if (igId) {
        // 4. Get Instagram profile
        const igProfile = await graphGet(`/${igId}`, firstPage.access_token, {
          fields: 'username,followers_count,media_count,profile_picture_url',
        })

        // 5. Get Instagram media
        const igMediaData = await graphGet(`/${igId}/media`, firstPage.access_token, {
          fields: 'id,caption,timestamp,media_type,media_url,thumbnail_url',
          limit: '5',
        })

        const media = (igMediaData.data || []).map((m: {
          id: string
          caption?: string
          timestamp: string
          media_type: string
          media_url?: string
          thumbnail_url?: string
        }) => ({
          id: m.id,
          caption: m.caption || '',
          timestamp: m.timestamp,
          media_type: m.media_type,
          media_url: m.media_url || '',
          thumbnail_url: m.thumbnail_url || m.media_url || '',
          mediaUrl: `https://www.instagram.com/p/${m.id}/`,
        }))

        instagram = {
          username: igProfile.username || '',
          followers_count: String(igProfile.followers_count ?? 0),
          media_count: String(igProfile.media_count ?? 0),
          profile_picture_url: igProfile.profile_picture_url || '',
          profileUrl: igProfile.username ? `https://www.instagram.com/${igProfile.username}/` : '',
          media,
        }
      }
    }

    return NextResponse.json({
      facebook: { pages },
      instagram,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to fetch Meta data' },
      { status: 500 }
    )
  }
}
