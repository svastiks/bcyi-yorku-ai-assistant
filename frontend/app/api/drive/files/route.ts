import { NextRequest, NextResponse } from 'next/server'
import { BackendAPIClient } from '@/lib/api-client'

const backendAPI = new BackendAPIClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folder_id') ?? undefined
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined
    const readSample = searchParams.get('read_sample') ?? undefined
    const result = await backendAPI.listDriveFiles({ folderId, limit, readSample })
    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'List files failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
