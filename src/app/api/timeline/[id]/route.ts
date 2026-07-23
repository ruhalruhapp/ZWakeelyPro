import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const event = await db.timelineEvent.findUnique({
      where: { id },
      include: { case: { select: { id: true, caseNumber: true, title: true } } },
    });
    if (!event) return NextResponse.json({ error: 'Timeline event not found' }, { status: 404 });
    return NextResponse.json(event);
  } catch (error) {
    console.error('GET /api/timeline/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline event' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const event = await db.timelineEvent.update({ where: { id }, data: body });
    return NextResponse.json(event);
  } catch (error) {
    console.error('PUT /api/timeline/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update timeline event' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.timelineEvent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/timeline/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete timeline event' }, { status: 500 });
  }
}
