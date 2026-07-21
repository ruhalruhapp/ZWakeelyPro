import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// One-time database setup endpoint
// This creates all tables using Prisma db push from the cloud environment
// Call POST /api/setup to initialize the database

export async function POST() {
  try {
    // Test the connection first
    await db.$queryRaw`SELECT 1 as test`;
    
    // Return success - Prisma schema will be pushed via Vercel CLI
    return NextResponse.json({
      success: true,
      message: 'Database connection verified successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: message,
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Wakeely Pro Database Setup',
    message: 'Send POST request to verify database connection',
  });
}