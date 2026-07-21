import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const caseId = searchParams.get('caseId') || ''

    const now = new Date()
    const targetMonth = month ? parseInt(month, 10) - 1 : now.getMonth()
    const targetYear = year ? parseInt(year, 10) : now.getFullYear()

    const startDate = new Date(targetYear, targetMonth, 1)
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999)

    const where: Record<string, unknown> = {
      startDate: { gte: startDate, lte: endDate },
    }

    if (caseId) {
      where.caseId = caseId
    }

    const events = await db.calendarEvent.findMany({
      where,
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
      orderBy: { startDate: 'asc' },
    })

    // Also find cases with nextHearing or statuteLimitDate in the month
    const caseDateWhere: Record<string, unknown> = {
      OR: [
        { nextHearing: { gte: startDate, lte: endDate } },
        { statuteLimitDate: { gte: startDate, lte: endDate } },
      ],
    }

    if (caseId) {
      caseDateWhere.id = caseId
    }

    const casesWithDates = await db.case.findMany({
      where: caseDateWhere,
      select: {
        id: true,
        caseNumber: true,
        title: true,
        nextHearing: true,
        statuteLimitDate: true,
      },
    })

    // Convert case dates to pseudo-calendar events
    const caseEvents = casesWithDates.flatMap((c) => {
      const result: Array<Record<string, unknown>> = []
      if (c.nextHearing) {
        result.push({
          id: `case-hearing-${c.id}`,
          title: `Hearing: ${c.title}`,
          description: `Case ${c.caseNumber} - Next Hearing`,
          eventType: 'hearing',
          startDate: c.nextHearing,
          allDay: true,
          color: '#f43f5e',
          case: { id: c.id, caseNumber: c.caseNumber, title: c.title },
          _isCaseDate: true,
        })
      }
      if (c.statuteLimitDate) {
        result.push({
          id: `case-statute-${c.id}`,
          title: `Statute Limit: ${c.title}`,
          description: `Case ${c.caseNumber} - Statute of Limitations`,
          eventType: 'deadline',
          startDate: c.statuteLimitDate,
          allDay: true,
          color: '#f97316',
          case: { id: c.id, caseNumber: c.caseNumber, title: c.title },
          _isCaseDate: true,
        })
      }
      return result
    })

    return NextResponse.json({
      events: [...events, ...caseEvents],
      month: targetMonth + 1,
      year: targetYear,
    })
  } catch (error) {
    console.error('GET /api/calendar error:', error)
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const event = await db.calendarEvent.create({
      data: {
        title: body.title,
        description: body.description || null,
        eventType: body.eventType || 'hearing',
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        allDay: body.allDay ?? false,
        location: body.location || null,
        color: body.color || null,
        reminder: body.reminder || null,
        caseId: body.caseId || null,
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('POST /api/calendar error:', error)
    return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 })
  }
}
