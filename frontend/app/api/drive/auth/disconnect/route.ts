import { NextResponse } from 'next/server'
import { BackendAPIClient } from '@/lib/api-client'

const backendAPI = new BackendAPIClient()

export async function POST() {
  try {
    await backendAPI.disconnectDrive()
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Disconnect failed' },
      { status: 500 }
    )
  }
}
