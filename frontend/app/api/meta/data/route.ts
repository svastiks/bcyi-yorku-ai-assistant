import { NextResponse } from 'next/server'

const GRAPH = 'https://graph.facebook.com/v19.0'
const PAGE_ID = '100075897078349'
const IG_USERNAME = 'blackcreekyouthinitiative'

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
  const token = process.env.META_PAGE_ACCESS_TOKEN

  if (!token) {
    return NextResponse.json({ error: 'META_PAGE_ACCESS_TOKEN is not set in environment variables' }, { status: 500 })
  }

  try {
    // Get page info
    const pageData = await graphGet(`/${PAGE_ID}`, token, {
      fields: 'id,name,fan_count,followers_count',
    })

    if (pageData.error) {
      return NextResponse.json({ error: pageData.error.message }, { status: 400 })
    }

    // Get recent posts
    const postsData = await graphGet(`/${PAGE_ID}/posts`, token, {
      fields: 'message,created_time,likes.summary(true),comments.summary(true)',
      limit: '5',
    })

    const posts = (postsData.data || []).map((p: {
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

    const page = {
      id: PAGE_ID,
      name: pageData.name || 'Black Creek Youth Initiative',
      followers_count: String(pageData.followers_count ?? 0),
      fan_count: String(pageData.fan_count ?? 0),
      pageUrl: `https://www.facebook.com/profile.php?id=${PAGE_ID}`,
      posts,
    }

    // Get Instagram business account linked to the page
    let instagram = null
    const igLinkData = await graphGet(`/${PAGE_ID}`, token, {
      fields: 'instagram_business_account',
    })

    const igId = igLinkData?.instagram_business_account?.id
    if (igId) {
      const igProfile = await graphGet(`/${igId}`, token, {
        fields: 'username,followers_count,media_count,profile_picture_url',
      })

      const igMediaData = await graphGet(`/${igId}/media`, token, {
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
        username: igProfile.username || IG_USERNAME,
        followers_count: String(igProfile.followers_count ?? 0),
        media_count: String(igProfile.media_count ?? 0),
        profile_picture_url: igProfile.profile_picture_url || '',
        profileUrl: `https://www.instagram.com/${IG_USERNAME}/`,
        media,
      }
    }

    return NextResponse.json({
      facebook: { pages: [page] },
      instagram,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to fetch Meta data' },
      { status: 500 }
    )
  }
}
