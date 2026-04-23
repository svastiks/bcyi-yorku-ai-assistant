import { NextResponse } from 'next/server'
import { BackendAPIClient } from '@/lib/api-client'
import { RateLimitedError, RATE_LIMIT_USER_MESSAGE } from '@/lib/rate-limit'

const backendAPI = new BackendAPIClient()

export async function POST() {
  try {
    const result = await backendAPI.sortDrive()
    return NextResponse.json(result)
  } catch (e) {
    if (e instanceof RateLimitedError) {
      return NextResponse.json(
        { error: RATE_LIMIT_USER_MESSAGE, code: 'rate_limit' },
        { status: 429 },
      )
    }
    const message = e instanceof Error ? e.message : 'Sort failed'
    console.error('[API] Sort error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
