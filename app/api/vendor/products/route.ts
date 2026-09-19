import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(3).max(200),
  nameHa: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  price: z.number().int().positive(),
  compareAt: z.number().int().positive().optional(),
  categoryId: z.string(),
  featured: z.boolean().optional(),
});

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !['VENDOR', 'VENDOR_STAFF'].includes(user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const vendor = await db.vendor.findFirst({
      where: { ownerId: user.userId },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where: { vendorId: vendor.id },
        include: { category: true, images: { take: 1 } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.product.count({ where: { vendorId: vendor.id } }),
    ]);

    return NextResponse.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !['VENDOR', 'VENDOR_STAFF'].includes(user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendor = await db.vendor.findFirst({
      where: { ownerId: user.userId },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const body = await req.json();
    const { categoryId, ...productData } = createProductSchema.parse(body);

    const slug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();

    const product = await db.product.create({
      data: {
        ...productData,
        slug,
        vendorId: vendor.id,
        categoryId,
        active: true,
      },
      include: { category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Product creation error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
