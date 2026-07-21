import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const members = await db.teamMember.findMany({
      include: {
        _count: {
          select: {
            assignedTasks: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('GET /api/team error:', error)
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const member = await db.teamMember.create({
      data: {
        name: body.name,
        email: body.email,
        role: body.role || 'associate',
        phone: body.phone || null,
        avatarUrl: body.avatarUrl || null,
        barNumber: body.barNumber || null,
        specialization: body.specialization || null,
        isActive: body.isActive ?? true,
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

    return NextResponse.json(member, { status: 201 })
  } catch (error: unknown) {
    console.error('POST /api/team error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 })
  }
}
