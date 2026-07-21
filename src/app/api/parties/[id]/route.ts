import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const party = await db.caseParty.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.role !== undefined && { role: body.role }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.email !== undefined && { email: body.email || null }),
        ...(body.phone !== undefined && { phone: body.phone || null }),
        ...(body.lawyer !== undefined && { lawyer: body.lawyer || null }),
        ...(body.notes !== undefined && { notes: body.notes || null }),
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
    })

    return NextResponse.json(party)
  } catch (error: unknown) {
    console.error('PUT /api/parties/[id] error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Party not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update party' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.caseParty.delete({ where: { id } })

    return NextResponse.json({ message: 'Party deleted successfully' })
  } catch (error: unknown) {
    console.error('DELETE /api/parties/[id] error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Party not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete party' }, { status: 500 })
  }
}
