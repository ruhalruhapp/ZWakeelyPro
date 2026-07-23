import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const lawyer = await db.lawyer.findUnique({
      where: { id },
      include: {
        _count: { select: { cases: true, tasks: true, timeEntries: true } },
      },
    });
    if (!lawyer) return NextResponse.json({ error: 'Lawyer not found' }, { status: 404 });
    return NextResponse.json(lawyer);
  } catch (error) {
    console.error('GET /api/lawyers/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch lawyer' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const lawyer = await db.lawyer.update({ where: { id }, data: body });
    return NextResponse.json(lawyer);
  } catch (error) {
    console.error('PUT /api/lawyers/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update lawyer' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.lawyer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/lawyers/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete lawyer' }, { status: 500 });
  }
}
