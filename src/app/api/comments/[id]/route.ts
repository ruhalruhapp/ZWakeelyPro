import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comment = await db.comment.findUnique({
      where: { id },
      include: {
        lawyer: { select: { id: true, name: true, email: true, avatarUrl: true } },
        member: { select: { id: true, name: true, email: true } },
        replies: {
          include: {
            lawyer: { select: { id: true, name: true, avatarUrl: true } },
            member: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    return NextResponse.json(comment);
  } catch (error) {
    console.error('GET /api/comments/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch comment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const comment = await db.comment.update({ where: { id }, data: body });
    return NextResponse.json(comment);
  } catch (error) {
    console.error('PUT /api/comments/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.comment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/comments/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
