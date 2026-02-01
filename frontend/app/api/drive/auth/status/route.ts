import { NextResponse } from 'next/server'
import { BackendAPIClient } from '@/lib/api-client'

const backendAPI = new BackendAPIClient()

export async function GET() {
  try {
    const result = await backendAPI.getDriveAuthStatus()
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ connected: false })
  }
}
