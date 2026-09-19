import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'OPERATIONS_ADMIN'].includes(user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          items: true,
          customer: { select: { id: true, name: true, email: true, phone: true } },
          vendor: { select: { id: true, name: true } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: {
        total,
        byStatus: {
          pending: await db.order.count({ where: { status: 'PENDING_PAYMENT' } }),
          paid: await db.order.count({ where: { status: 'PAID' } }),
          processing: await db.order.count({ where: { status: 'PROCESSING' } }),
          delivered: await db.order.count({ where: { status: 'DELIVERED' } }),
          cancelled: await db.order.count({ where: { status: 'CANCELLED' } }),
        },
      },
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
