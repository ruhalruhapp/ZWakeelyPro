import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Run Prisma db push from Vercel's cloud environment
export async function POST() {
  try {
    const result = await db.$queryRaw`SELECT current_database(), version()`;
    
    const { execSync } = await import('child_process');
    
    try {
      const pushOutput = execSync('npx prisma db push --accept-data-loss 2>&1', {
        timeout: 60000,
        env: { ...process.env },
      }).toString();
      
      return NextResponse.json({
        success: true,
        dbInfo: result,
        pushOutput,
        message: 'Database schema pushed successfully!',
      });
    } catch (pushError) {
      const errorMsg = pushError instanceof Error ? pushError.message : String(pushError);
      return NextResponse.json({
        success: false,
        dbInfo: result,
        cliError: errorMsg,
        message: 'Connection works but Prisma CLI push failed.',
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: message,
      message: 'Database connection failed',
    }, { status: 500 });
  }
}