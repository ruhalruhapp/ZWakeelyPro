import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const entry = await db.timeEntry.update({
      where: { id },
      data: {
        ...(body.description !== undefined && { description: body.description }),
        ...(body.duration !== undefined && { duration: body.duration }),
        ...(body.rate !== undefined && { rate: body.rate ?? null }),
        ...(body.isBillable !== undefined && { isBillable: body.isBillable }),
        ...(body.activityType !== undefined && { activityType: body.activityType }),
        ...(body.date !== undefined && { date: new Date(body.date) }),
        ...(body.notes !== undefined && { notes: body.notes || null }),
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        lawyer: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    return NextResponse.json(entry)
  } catch (error: unknown) {
    console.error('PUT /api/time-entries/[id] error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update time entry' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.timeEntry.delete({ where: { id } })

    return NextResponse.json({ message: 'Time entry deleted successfully' })
  } catch (error: unknown) {
    console.error('DELETE /api/time-entries/[id] error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete time entry' }, { status: 500 })
  }
}
