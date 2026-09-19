import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.customerId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot cancel order with status ${order.status}` },
        { status: 400 }
      );
    }

    const cancelledOrder = await db.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        paymentStatus: order.paymentStatus === 'SUCCESS' ? 'CANCELLED' : 'CANCELLED',
      },
      include: {
        items: { include: { product: true } },
        payment: true,
      },
    });

    return NextResponse.json(cancelledOrder);
  } catch (error) {
    console.error('Order cancellation error:', error);
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
  }
}
