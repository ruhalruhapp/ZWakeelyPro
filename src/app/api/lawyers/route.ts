import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit')) || 100));

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;

    const lawyers = await db.lawyer.findMany({
      where,
      include: {
        _count: { select: { cases: true, tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(lawyers);
  } catch (error) {
    console.error('GET /api/lawyers error:', error);
    return NextResponse.json({ error: 'Failed to fetch lawyers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, avatarUrl, role, firm, licenseNo, phone } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
    }

    const lawyer = await db.lawyer.create({
      data: { name, email, avatarUrl: avatarUrl || null, role: role || 'associate', firm: firm || null, licenseNo: licenseNo || null, phone: phone || null },
    });

    return NextResponse.json(lawyer, { status: 201 });
  } catch (error) {
    console.error('POST /api/lawyers error:', error);
    return NextResponse.json({ error: 'Failed to create lawyer' }, { status: 500 });
  }
}
