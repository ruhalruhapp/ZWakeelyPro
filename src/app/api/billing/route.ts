import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('caseId') || ''
    const status = searchParams.get('status') || ''

    const where: Record<string, unknown> = {}

    if (caseId) {
      where.caseId = caseId
    }
    if (status) {
      where.status = status
    }

    const billings = await db.billing.findMany({
      where,
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(billings)
  } catch (error) {
    console.error('GET /api/billing error:', error)
    return NextResponse.json({ error: 'Failed to fetch billings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const billing = await db.billing.create({
      data: {
        description: body.description,
        hours: body.hours ?? null,
        rate: body.rate ?? null,
        amount: body.amount,
        currency: body.currency || 'SAR',
        status: body.status || 'draft',
        invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        paidDate: body.paidDate ? new Date(body.paidDate) : null,
        caseId: body.caseId,
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
    })

    return NextResponse.json(billing, { status: 201 })
  } catch (error) {
    console.error('POST /api/billing error:', error)
    return NextResponse.json({ error: 'Failed to create billing entry' }, { status: 500 })
  }
}