import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const updateProductSchema = z.object({
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'OPERATIONS_ADMIN'].includes(user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const updateData = updateProductSchema.parse(body);

    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updatedProduct = await db.product.update({
      where: { id },
      data: updateData,
      include: {
        vendor: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });

    // Log the action
    await db.auditLog.create({
      data: {
        userId: user.userId,
        action: updateData.active !== undefined ? (updateData.active ? 'PRODUCT_ACTIVATED' : 'PRODUCT_DEACTIVATED') : 'PRODUCT_FEATURED_TOGGLED',
        resource: 'PRODUCT',
        resourceId: product.id,
        changes: JSON.stringify(updateData),
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Product update error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
