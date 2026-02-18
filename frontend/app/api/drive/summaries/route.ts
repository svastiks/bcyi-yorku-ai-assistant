import { NextResponse } from 'next/server'
import { BackendAPIClient } from '@/lib/api-client'

const backendAPI = new BackendAPIClient()

export async function GET() {
  try {
    const result = await backendAPI.getSummaries()
    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'List summaries failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
