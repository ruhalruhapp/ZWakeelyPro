import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const member = await db.teamMember.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.role !== undefined && { role: body.role }),
        ...(body.phone !== undefined && { phone: body.phone || null }),
        ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl || null }),
        ...(body.barNumber !== undefined && { barNumber: body.barNumber || null }),
        ...(body.specialization !== undefined && { specialization: body.specialization || null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
      include: {
        _count: {
          select: {
            assignedTasks: true,
            comments: true,
          },
        },
      },
    })

    return NextResponse.json(member)
  } catch (error: unknown) {
    console.error('PUT /api/team/[id] error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.teamMember.delete({ where: { id } })

    return NextResponse.json({ message: 'Team member deleted successfully' })
  } catch (error: unknown) {
    console.error('DELETE /api/team/[id] error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 })
  }
}
