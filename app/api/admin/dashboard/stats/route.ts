import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'OPERATIONS_ADMIN'].includes(user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalVendors,
      verifiedVendors,
      totalProducts,
      activeProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      db.user.count(),
      db.vendor.count(),
      db.vendor.count({ where: { verified: true } }),
      db.product.count(),
      db.product.count({ where: { active: true } }),
      db.order.count(),
      db.order.aggregate({
        _sum: { total: true },
      }),
      db.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      db.order.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    const revenueData = await db.order.aggregate({
      where: { createdAt: { gte: thirtyDaysAgo }, status: { not: 'CANCELLED' } },
      _sum: { total: true },
    });

    return NextResponse.json({
      overview: {
        totalUsers,
        totalVendors,
        verifiedVendors,
        totalProducts,
        activeProducts,
        totalOrders,
      },
      revenue: {
        total: totalRevenue._sum.total || 0,
        last30Days: revenueData._sum.total || 0,
      },
      orders: {
        total: totalOrders,
        last30Days: recentOrders,
        byStatus: ordersByStatus.reduce((acc: any, item: any) => {
          acc[item.status] = item._count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
