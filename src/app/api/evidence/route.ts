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

    const items = await db.evidenceItem.findMany({
      where,
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('GET /api/evidence error:', error)
    return NextResponse.json({ error: 'Failed to fetch evidence items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const item = await db.evidenceItem.create({
      data: {
        title: body.title,
        description: body.description || null,
        itemType: body.itemType || 'document',
        category: body.category || null,
        dateReceived: body.dateReceived ? new Date(body.dateReceived) : null,
        isPrivileged: body.isPrivileged ?? false,
        privilegeType: body.privilegeType || null,
        isConfidential: body.isConfidential ?? false,
        tags: body.tags ? JSON.stringify(body.tags) : null,
        linkedDocId: body.linkedDocId || null,
        source: body.source || null,
        chainOfCustody: body.chainOfCustody ? JSON.stringify(body.chainOfCustody) : null,
        caseId: body.caseId,
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('POST /api/evidence error:', error)
    return NextResponse.json({ error: 'Failed to create evidence item' }, { status: 500 })
  }
}
