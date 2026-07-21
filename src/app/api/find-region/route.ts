import { NextResponse } from 'next/server';

const REGIONS = [
  'us-east-1', 'us-west-1', 'eu-west-1', 'eu-central-1',
  'ap-southeast-1', 'ap-northeast-1', 'ap-south-1',
  'sa-east-1', 'ca-central-1',
];

const PROJECT_REF = 'tpbwwyscxxbrhhafwuga';
const DB_PASSWORD = '0AXr9nXevXagdj4l';

async function testConnection(region: string): Promise<boolean> {
  const url = `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-${region}.pooler.supabase.com:6543/postgres?sslmode=require&connect_timeout=5&pgbouncer=true`;
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient({ datasources: { db: { url } }, log: [] });
    await prisma.$queryRaw`SELECT 1 as ok`;
    await prisma.$disconnect();
    return true;
  } catch {
    return false;
  }
}

export async function POST() {
  const results: Record<string, string> = {};
  let workingRegion = '';

  const tests = REGIONS.map(async (region) => {
    const ok = await testConnection(region);
    results[region] = ok ? 'OK' : 'FAIL';
    if (ok && !workingRegion) workingRegion = region;
  });
  await Promise.all(tests);

  // Also try direct connection
  try {
    const { PrismaClient } = await import('@prisma/client');
    const directUrl = `postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres?sslmode=require&connect_timeout=5`;
    const prisma = new PrismaClient({ datasources: { db: { url: directUrl } }, log: [] });
    await prisma.$queryRaw`SELECT 1 as ok`;
    await prisma.$disconnect();
    results['direct'] = 'OK';
    if (!workingRegion) workingRegion = 'direct';
  } catch {
    results['direct'] = 'FAIL';
  }

  return NextResponse.json({
    workingRegion,
    allResults: results,
    poolerUrl: workingRegion && workingRegion !== 'direct'
      ? `postgresql://postgres.${PROJECT_REF}:[PASSWORD]@aws-0-${workingRegion}.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require`
      : null,
    directUrl: workingRegion === 'direct'
      ? `postgresql://postgres:[PASSWORD]@db.${PROJECT_REF}.supabase.co:5432/postgres?sslmode=require`
      : null,
  });
}