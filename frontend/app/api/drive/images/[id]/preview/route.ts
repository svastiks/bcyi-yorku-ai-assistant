import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const res = await fetch(`${BACKEND_URL}/api/drive/images/${encodeURIComponent(id)}/preview`)
    if (!res.ok) {
      return new NextResponse(null, { status: res.status })
    }
    const blob = await res.blob()
    const contentType = res.headers.get('Content-Type') || 'image/jpeg'
    return new NextResponse(blob, {
      headers: { 'Content-Type': contentType },
    })
  } catch (e) {
    return new NextResponse(null, { status: 500 })
  }
}
