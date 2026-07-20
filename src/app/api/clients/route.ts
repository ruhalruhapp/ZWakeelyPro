import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { company: { contains: search } },
        { nationalId: { contains: search } },
      ]
    }

    if (type) {
      where.type = type
    }

    const clients = await db.client.findMany({
      where,
      include: {
        _count: { select: { cases: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('GET /api/clients error:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const client = await db.client.create({
      data: {
        fullName: body.fullName,
        email: body.email || null,
        phone: body.phone || null,
        nationalId: body.nationalId || null,
        address: body.address || null,
        company: body.company || null,
        type: body.type || 'individual',
      },
      include: {
        _count: { select: { cases: true } },
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('POST /api/clients error:', error)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}