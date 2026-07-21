import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entity = searchParams.get('entity') || ''
    const entityId = searchParams.get('entityId') || ''
    const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit')) || 50))

    const where: Record<string, unknown> = {}

    if (entity) {
      where.entity = entity
    }
    if (entityId) {
      where.entityId = entityId
    }

    const activities = await db.activity.findMany({
      where,
      include: {
        lawyer: { select: { id: true, name: true, email: true, avatarUrl: true } },
        case: { select: { id: true, caseNumber: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('GET /api/audit error:', error)
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 })
  }
}
