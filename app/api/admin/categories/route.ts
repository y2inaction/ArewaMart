import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  nameHa: z.string().min(2).max(100),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const categories = await db.category.findMany({
      include: { products: { select: { id: true }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'OPERATIONS_ADMIN'].includes(user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { nameHa, ...categoryData } = createCategorySchema.parse(body);

    const slug = categoryData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const category = await db.category.create({
      data: {
        ...categoryData,
        nameHa,
        slug,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Category creation error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
