import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const caseData = await db.case.findUnique({
      where: { id },
      include: {
        lawyer: { select: { id: true, name: true, email: true, avatarUrl: true, role: true, firm: true } },
        client: { select: { id: true, fullName: true, email: true, phone: true, nationalId: true, address: true, company: true, type: true } },
        tasks: { orderBy: { createdAt: 'desc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
        billings: { orderBy: { createdAt: 'desc' } },
        timelines: { orderBy: { eventDate: 'desc' } },
        activities: { orderBy: { createdAt: 'desc' }, take: 20, include: { lawyer: { select: { id: true, name: true, avatarUrl: true } } } },
      },
    })

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    return NextResponse.json(caseData)
  } catch (error) {
    console.error('GET /api/cases/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch case' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const caseData = await db.case.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.caseType !== undefined && { caseType: body.caseType }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.court !== undefined && { court: body.court }),
        ...(body.judge !== undefined && { judge: body.judge }),
        ...(body.filedDate !== undefined && { filedDate: body.filedDate ? new Date(body.filedDate) : null }),
        ...(body.nextHearing !== undefined && { nextHearing: body.nextHearing ? new Date(body.nextHearing) : null }),
        ...(body.closedDate !== undefined && { closedDate: body.closedDate ? new Date(body.closedDate) : null }),
        ...(body.value !== undefined && { value: body.value }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.isPro !== undefined && { isPro: body.isPro }),
        ...(body.isVisibleToClient !== undefined && { isVisibleToClient: body.isVisibleToClient }),
        ...(body.lawyerId !== undefined && { lawyerId: body.lawyerId }),
        ...(body.clientId !== undefined && { clientId: body.clientId }),
      },
      include: {
        lawyer: { select: { id: true, name: true, email: true, avatarUrl: true } },
        client: { select: { id: true, fullName: true, email: true, phone: true, company: true } },
      },
    })

    return NextResponse.json(caseData)
  } catch (error: unknown) {
    console.error('PUT /api/cases/[id] error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update case' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.case.delete({ where: { id } })

    return NextResponse.json({ message: 'Case deleted successfully' })
  } catch (error: unknown) {
    console.error('DELETE /api/cases/[id] error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete case' }, { status: 500 })
  }
}