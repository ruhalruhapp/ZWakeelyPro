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

    const parties = await db.caseParty.findMany({
      where,
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(parties)
  } catch (error) {
    console.error('GET /api/parties error:', error)
    return NextResponse.json({ error: 'Failed to fetch parties' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const party = await db.caseParty.create({
      data: {
        name: body.name,
        role: body.role,
        type: body.type || 'individual',
        email: body.email || null,
        phone: body.phone || null,
        lawyer: body.lawyer || null,
        notes: body.notes || null,
        caseId: body.caseId,
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
    })

    return NextResponse.json(party, { status: 201 })
  } catch (error) {
    console.error('POST /api/parties error:', error)
    return NextResponse.json({ error: 'Failed to create party' }, { status: 500 })
  }
}
