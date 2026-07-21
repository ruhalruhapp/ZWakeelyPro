import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('caseId') || ''

    const where: Record<string, unknown> = {}
    if (caseId) {
      where.caseId = caseId
    }

    const logs = await db.privilegeLog.findMany({
      where,
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('GET /api/privilege-logs error:', error)
    return NextResponse.json({ error: 'Failed to fetch privilege logs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const log = await db.privilegeLog.create({
      data: {
        documentTitle: body.documentTitle,
        privilegeType: body.privilegeType,
        dateCreated: body.dateCreated ? new Date(body.dateCreated) : null,
        description: body.description || null,
        withheldFrom: body.withheldFrom || null,
        caseId: body.caseId,
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error('POST /api/privilege-logs error:', error)
    return NextResponse.json({ error: 'Failed to create privilege log' }, { status: 500 })
  }
}
