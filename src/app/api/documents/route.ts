import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId') || '';
    const folder = searchParams.get('folder') || '';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit')) || 100));

    const where: Record<string, unknown> = {};
    if (caseId) where.caseId = caseId;
    if (folder) where.folder = folder;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { fileName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }

    const documents = await db.caseDocument.findMany({
      where,
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
      },
      orderBy: { uploadedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('GET /api/documents error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileType, fileSize, filePath, folder, version, versionOf, tags, category, description, isConfidential, isVisibleToClient, caseId } = body;

    if (!fileName || !caseId) {
      return NextResponse.json({ error: 'fileName and caseId are required' }, { status: 400 });
    }

    const document = await db.caseDocument.create({
      data: {
        fileName,
        fileType: fileType || 'other',
        fileSize: fileSize || null,
        filePath: filePath || null,
        folder: folder || 'root',
        version: version || 1,
        versionOf: versionOf || null,
        tags: tags || null,
        category: category || 'general',
        description: description || null,
        isConfidential: isConfidential || false,
        isVisibleToClient: isVisibleToClient ?? true,
        caseId,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('POST /api/documents error:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
