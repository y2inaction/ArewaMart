import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const verified = searchParams.get('verified') === 'true';

    const communities = await db.community.findMany({
      where: verified ? { verified: true } : {},
      include: {
        vendors: { select: { id: true }, take: 1 },
        members: { select: { id: true }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ communities });
  } catch (error) {
    console.error('Communities fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch communities' }, { status: 500 });
  }
}
