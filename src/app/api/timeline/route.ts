import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('caseId') || ''

    if (!caseId) {
      return NextResponse.json(
        { error: 'caseId query parameter is required' },
        { status: 400 }
      )
    }

    const events = await db.timelineEvent.findMany({
      where: { caseId },
      orderBy: { eventDate: 'desc' },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('GET /api/timeline error:', error)
    return NextResponse.json({ error: 'Failed to fetch timeline events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const event = await db.timelineEvent.create({
      data: {
        title: body.title,
        description: body.description || null,
        eventType: body.eventType || 'note',
        eventDate: new Date(body.eventDate),
        caseId: body.caseId,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('POST /api/timeline error:', error)
    return NextResponse.json({ error: 'Failed to create timeline event' }, { status: 500 })
  }
}