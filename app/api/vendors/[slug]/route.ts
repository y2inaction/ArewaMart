import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params;
  try {
    const vendor = await db.vendor.findUnique({
      where: { slug: resolvedParams.slug },
      include: {
        community: true,
        products: { take: 50, orderBy: { createdAt: 'desc' } },
        reviews: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Vendor fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch vendor' }, { status: 500 });
  }
}
