import { NextRequest, NextResponse } from 'next/server'
import { BackendAPIClient } from '@/lib/api-client'

const backendAPI = new BackendAPIClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined
    const result = await backendAPI.getDriveImages({ limit })
    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'List Drive images failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
