import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const billing = await db.billing.findUnique({
      where: { id },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
    });
    if (!billing) return NextResponse.json({ error: 'Billing not found' }, { status: 404 });
    return NextResponse.json(billing);
  } catch (error) {
    console.error('GET /api/billing/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch billing' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const billing = await db.billing.update({ where: { id }, data: body });
    return NextResponse.json(billing);
  } catch (error) {
    console.error('PUT /api/billing/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update billing' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.billing.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/billing/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete billing' }, { status: 500 });
  }
}
