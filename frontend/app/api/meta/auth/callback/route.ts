import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')
  const errorDesc = searchParams.get('error_description')

  if (errorParam) {
    return NextResponse.redirect(new URL(`/?meta_error=${encodeURIComponent(errorDesc || errorParam)}`, request.url))
  }

  const cookieStore = await cookies()
  const savedState = cookieStore.get('meta_state')?.value

  if (!state || !savedState || state !== savedState) {
    return NextResponse.redirect(new URL('/?meta_error=invalid_state', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?meta_error=missing_code', request.url))
  }

  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET
  const redirectUri = process.env.META_REDIRECT_URI

  if (!appId || !appSecret || !redirectUri) {
    return NextResponse.redirect(new URL('/?meta_error=server_misconfigured', request.url))
  }

  try {
    // Exchange code for short-lived token
    const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token')
    tokenUrl.searchParams.set('client_id', appId)
    tokenUrl.searchParams.set('client_secret', appSecret)
    tokenUrl.searchParams.set('redirect_uri', redirectUri)
    tokenUrl.searchParams.set('code', code)

    const tokenRes = await fetch(tokenUrl.toString())
    const tokenData = await tokenRes.json()

    if (!tokenRes.ok || !tokenData.access_token) {
      const msg = tokenData.error?.message || 'token_exchange_failed'
      return NextResponse.redirect(new URL(`/?meta_error=${encodeURIComponent(msg)}`, request.url))
    }

    // Exchange short-lived token for long-lived token (60 days)
    const longLivedUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token')
    longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token')
    longLivedUrl.searchParams.set('client_id', appId)
    longLivedUrl.searchParams.set('client_secret', appSecret)
    longLivedUrl.searchParams.set('fb_exchange_token', tokenData.access_token)

    const longLivedRes = await fetch(longLivedUrl.toString())
    const longLivedData = await longLivedRes.json()

    const finalToken = longLivedData.access_token || tokenData.access_token

    // Clear state cookie and store access token
    cookieStore.delete('meta_state')
    cookieStore.set('meta_access_token', finalToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 60, // 60 days
      path: '/',
    })

    return NextResponse.redirect(new URL('/?meta_connected=1', request.url))
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown_error'
    return NextResponse.redirect(new URL(`/?meta_error=${encodeURIComponent(msg)}`, request.url))
  }
}
