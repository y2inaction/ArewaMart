import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const verified = searchParams.get('verified') === 'true';
    const community = searchParams.get('community');

    const vendors = await db.vendor.findMany({
      where: {
        ...(verified ? { verified: true } : {}),
        ...(community ? { community: { slug: community } } : {}),
      },
      include: { community: true },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(vendors);
  } catch (error) {
    console.error('Vendors fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, description, phone, whatsapp, location, communityId } = body;

    const vendor = await db.vendor.create({
      data: {
        name,
        slug,
        description,
        phone,
        whatsapp,
        location,
        ...(communityId ? { communityId } : {}),
        verified: false,
      },
      include: { community: true },
    });

    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    console.error('Vendor creation error:', error);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}
