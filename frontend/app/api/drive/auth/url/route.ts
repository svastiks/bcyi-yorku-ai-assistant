import { NextResponse } from 'next/server'
import { BackendAPIClient } from '@/lib/api-client'

const backendAPI = new BackendAPIClient()

export async function GET() {
  try {
    const result = await backendAPI.getDriveAuthUrl()
    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to get auth URL' },
      { status: 500 }
    )
  }
}
