import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Auto-set completedAt when marking task as completed
    const completedAt =
      body.status === 'completed' && !body.completedAt
        ? new Date()
        : body.completedAt !== undefined
          ? body.completedAt
            ? new Date(body.completedAt)
            : null
          : undefined

    const task = await db.task.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
        ...(completedAt !== undefined && { completedAt }),
        ...(body.lawyerId !== undefined && { lawyerId: body.lawyerId }),
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        lawyer: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    return NextResponse.json(task)
  } catch (error: unknown) {
    console.error('PUT /api/tasks/[id] error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.task.delete({ where: { id } })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error: unknown) {
    console.error('DELETE /api/tasks/[id] error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}