import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const event = await db.calendarEvent.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description || null }),
        ...(body.eventType !== undefined && { eventType: body.eventType }),
        ...(body.startDate !== undefined && { startDate: new Date(body.startDate) }),
        ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
        ...(body.allDay !== undefined && { allDay: body.allDay }),
        ...(body.location !== undefined && { location: body.location || null }),
        ...(body.color !== undefined && { color: body.color || null }),
        ...(body.reminder !== undefined && { reminder: body.reminder || null }),
        ...(body.caseId !== undefined && { caseId: body.caseId || null }),
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
    })

    return NextResponse.json(event)
  } catch (error: unknown) {
    console.error('PUT /api/calendar/[id] error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Calendar event not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update calendar event' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.calendarEvent.delete({ where: { id } })

    return NextResponse.json({ message: 'Calendar event deleted successfully' })
  } catch (error: unknown) {
    console.error('DELETE /api/calendar/[id] error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Calendar event not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete calendar event' }, { status: 500 })
  }
}
