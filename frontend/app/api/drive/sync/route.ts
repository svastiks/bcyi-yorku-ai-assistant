import { NextResponse } from 'next/server'
import { BackendAPIClient } from '@/lib/api-client'

const backendAPI = new BackendAPIClient()

export async function POST() {
  try {
    const result = await backendAPI.syncDrive()
    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Sync failed'
    console.error('[API] Drive sync error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
