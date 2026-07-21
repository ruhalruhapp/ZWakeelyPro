import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const item = await db.evidenceItem.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description || null }),
        ...(body.itemType !== undefined && { itemType: body.itemType }),
        ...(body.category !== undefined && { category: body.category || null }),
        ...(body.dateReceived !== undefined && { dateReceived: body.dateReceived ? new Date(body.dateReceived) : null }),
        ...(body.isPrivileged !== undefined && { isPrivileged: body.isPrivileged }),
        ...(body.privilegeType !== undefined && { privilegeType: body.privilegeType || null }),
        ...(body.isConfidential !== undefined && { isConfidential: body.isConfidential }),
        ...(body.tags !== undefined && { tags: body.tags ? JSON.stringify(body.tags) : null }),
        ...(body.linkedDocId !== undefined && { linkedDocId: body.linkedDocId || null }),
        ...(body.source !== undefined && { source: body.source || null }),
        ...(body.chainOfCustody !== undefined && { chainOfCustody: body.chainOfCustody ? JSON.stringify(body.chainOfCustody) : null }),
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
    })

    return NextResponse.json(item)
  } catch (error: unknown) {
    console.error('PUT /api/evidence/[id] error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Evidence item not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update evidence item' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.evidenceItem.delete({ where: { id } })

    return NextResponse.json({ message: 'Evidence item deleted successfully' })
  } catch (error: unknown) {
    console.error('DELETE /api/evidence/[id] error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Evidence item not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete evidence item' }, { status: 500 })
  }
}
