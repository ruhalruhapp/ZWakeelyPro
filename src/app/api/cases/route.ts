import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const priority = searchParams.get('priority') || ''
    const caseType = searchParams.get('caseType') || ''
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { caseNumber: { contains: search } },
        { description: { contains: search } },
        { court: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }
    if (priority) {
      where.priority = priority
    }
    if (caseType) {
      where.caseType = caseType
    }

    const [cases, total] = await Promise.all([
      db.case.findMany({
        where,
        skip,
        take: limit,
        include: {
          lawyer: { select: { id: true, name: true, email: true, avatarUrl: true } },
          client: { select: { id: true, fullName: true, email: true, phone: true, company: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      db.case.count({ where }),
    ])

    return NextResponse.json({
      data: cases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/cases error:', error)
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const caseData = await db.case.create({
      data: {
        caseNumber: body.caseNumber,
        title: body.title,
        description: body.description || null,
        caseType: body.caseType,
        status: body.status || 'intake',
        priority: body.priority || 'medium',
        court: body.court || null,
        judge: body.judge || null,
        filedDate: body.filedDate ? new Date(body.filedDate) : null,
        nextHearing: body.nextHearing ? new Date(body.nextHearing) : null,
        closedDate: body.closedDate ? new Date(body.closedDate) : null,
        value: body.value ?? null,
        currency: body.currency || 'SAR',
        notes: body.notes || null,
        isPro: body.isPro ?? true,
        isVisibleToClient: body.isVisibleToClient ?? false,
        lawyerId: body.lawyerId,
        clientId: body.clientId || null,
      },
      include: {
        lawyer: { select: { id: true, name: true, email: true, avatarUrl: true } },
        client: { select: { id: true, fullName: true, email: true, phone: true, company: true } },
      },
    })

    return NextResponse.json(caseData, { status: 201 })
  } catch (error) {
    console.error('POST /api/cases error:', error)
    return NextResponse.json({ error: 'Failed to create case' }, { status: 500 })
  }
}