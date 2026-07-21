import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('caseId') || ''
    const status = searchParams.get('status') || ''
    const lawyerId = searchParams.get('lawyerId') || ''

    const where: Record<string, unknown> = {}

    if (caseId) {
      where.caseId = caseId
    }
    if (status) {
      where.status = status
    }
    if (lawyerId) {
      where.lawyerId = lawyerId
    }

    const tasks = await db.task.findMany({
      where,
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        lawyer: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('GET /api/tasks error:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const task = await db.task.create({
      data: {
        title: body.title,
        description: body.description || null,
        status: body.status || 'pending',
        priority: body.priority || 'medium',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        completedAt: body.completedAt ? new Date(body.completedAt) : null,
        caseId: body.caseId,
        lawyerId: body.lawyerId,
      },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        lawyer: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('POST /api/tasks error:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}