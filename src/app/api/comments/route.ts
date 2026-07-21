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

    const comments = await db.comment.findMany({
      where: {
        ...where,
        parentId: null, // only top-level comments
      },
      include: {
        lawyer: { select: { id: true, name: true, avatarUrl: true } },
        member: { select: { id: true, name: true, avatarUrl: true, role: true } },
        case: { select: { id: true, caseNumber: true, title: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            lawyer: { select: { id: true, name: true, avatarUrl: true } },
            member: { select: { id: true, name: true, avatarUrl: true, role: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('GET /api/comments error:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const comment = await db.comment.create({
      data: {
        content: body.content,
        isInternal: body.isInternal ?? true,
        caseId: body.caseId,
        lawyerId: body.lawyerId || null,
        memberId: body.memberId || null,
        parentId: body.parentId || null,
      },
      include: {
        lawyer: { select: { id: true, name: true, avatarUrl: true } },
        member: { select: { id: true, name: true, avatarUrl: true, role: true } },
        case: { select: { id: true, caseNumber: true, title: true } },
        replies: true,
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('POST /api/comments error:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
