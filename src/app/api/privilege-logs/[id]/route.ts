import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const log = await db.privilegeLog.findUnique({
      where: { id },
      include: { case: { select: { id: true, caseNumber: true, title: true } } },
    });
    if (!log) return NextResponse.json({ error: 'Privilege log not found' }, { status: 404 });
    return NextResponse.json(log);
  } catch (error) {
    console.error('GET /api/privilege-logs/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch privilege log' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const log = await db.privilegeLog.update({ where: { id }, data: body });
    return NextResponse.json(log);
  } catch (error) {
    console.error('PUT /api/privilege-logs/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update privilege log' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.privilegeLog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/privilege-logs/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete privilege log' }, { status: 500 });
  }
}
