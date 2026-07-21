import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('caseId') || ''
    const lawyerId = searchParams.get('lawyerId') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    const where: Record<string, unknown> = {}

    if (caseId) {
      where.caseId = caseId
    }
    if (lawyerId) {
      where.lawyerId = lawyerId
    }
    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) {
        (where.date as Record<string, unknown>).gte = new Date(dateFrom)
      }
      if (dateTo) {
        (where.date as Record<string, unknown>).lte = new Date(dateTo)
      }
    }

    const entries = await db.timeEntry.findMany({
      where,
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        lawyer: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('GET /api/time-entries error:', error)
    return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const entry = await db.timeEntry.create({
      data: {
        description: body.description,
        duration: body.duration,
        rate: body.rate ?? null,
        isBillable: body.isBillable ?? true,
        activityType: body.activityType || 'other',
        date: new Date(body.date),
        notes: body.notes || null,
        caseId: body.caseId,
        lawyerId: body.lawyerId,
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        lawyer: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('POST /api/time-entries error:', error)
    return NextResponse.json({ error: 'Failed to create time entry' }, { status: 500 })
  }
}
