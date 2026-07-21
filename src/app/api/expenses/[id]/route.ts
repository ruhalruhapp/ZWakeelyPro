import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const expense = await db.expense.update({
      where: { id },
      data: {
        ...(body.description !== undefined && { description: body.description }),
        ...(body.amount !== undefined && { amount: body.amount }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.isBillable !== undefined && { isBillable: body.isBillable }),
        ...(body.date !== undefined && { date: new Date(body.date) }),
        ...(body.receiptPath !== undefined && { receiptPath: body.receiptPath || null }),
        ...(body.notes !== undefined && { notes: body.notes || null }),
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
    })

    return NextResponse.json(expense)
  } catch (error: unknown) {
    console.error('PUT /api/expenses/[id] error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.expense.delete({ where: { id } })

    return NextResponse.json({ message: 'Expense deleted successfully' })
  } catch (error: unknown) {
    console.error('DELETE /api/expenses/[id] error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}
