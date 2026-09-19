import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const createRefundSchema = z.object({
  orderId: z.string(),
  reason: z.string().min(10).max(500),
  amount: z.number().int().positive(),
});

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const [refunds, total] = await Promise.all([
      db.refund.findMany({
        where: { order: { customerId: user.userId } },
        include: { order: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.refund.count({ where: { order: { customerId: user.userId } } }),
    ]);

    return NextResponse.json({
      refunds,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Refunds fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch refunds' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, reason, amount } = createRefundSchema.parse(body);

    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.customerId !== user.userId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const refund = await db.refund.create({
      data: {
        orderId,
        reason,
        amount,
        status: 'REQUESTED',
      },
      include: { order: true },
    });

    await db.order.update({
      where: { id: orderId },
      data: { status: 'REFUND_REQUESTED' },
    });

    return NextResponse.json(refund, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Refund creation error:', error);
    return NextResponse.json({ error: 'Failed to create refund request' }, { status: 500 });
  }
}
