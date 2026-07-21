import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const flags = await db.featureFlag.findMany({
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(flags)
  } catch (error) {
    console.error('GET /api/feature-flags error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feature flags' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, enabled } = body

    if (!key || enabled === undefined) {
      return NextResponse.json(
        { error: 'Key and enabled fields are required' },
        { status: 400 }
      )
    }

    const flag = await db.featureFlag.update({
      where: { key },
      data: { enabled },
    })

    return NextResponse.json(flag)
  } catch (error: unknown) {
    console.error('PUT /api/feature-flags error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Feature flag not found' }, { status: 404 })
    }
    return NextResponse.json(
      { error: 'Failed to update feature flag' },
      { status: 500 }
    )
  }
}