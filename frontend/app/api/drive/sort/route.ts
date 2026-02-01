import { NextResponse } from 'next/server'
import { BackendAPIClient } from '@/lib/api-client'

const backendAPI = new BackendAPIClient()

export async function POST() {
  try {
    const result = await backendAPI.sortDrive()
    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Sort failed'
    console.error('[API] Sort error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
