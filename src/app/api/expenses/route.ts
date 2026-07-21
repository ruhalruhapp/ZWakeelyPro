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

    const expenses = await db.expense.findMany({
      where,
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('GET /api/expenses error:', error)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const expense = await db.expense.create({
      data: {
        description: body.description,
        amount: body.amount,
        currency: body.currency || 'SAR',
        category: body.category || 'other',
        isBillable: body.isBillable ?? true,
        date: new Date(body.date),
        receiptPath: body.receiptPath || null,
        notes: body.notes || null,
        caseId: body.caseId,
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('POST /api/expenses error:', error)
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}
