import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const createOrderSchema = z.object({
  cartItems: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })),
  address: z.string().min(10),
  whatsapp: z.string().optional(),
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

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where: { customerId: user.userId },
        include: {
          items: { include: { product: true } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.order.count({ where: { customerId: user.userId } }),
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { cartItems, address, whatsapp } = createOrderSchema.parse(body);

    if (!cartItems.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const orderItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }> = [];
    let subtotal = 0;
    let vendorId: string | undefined;

    for (const item of cartItems) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
        include: { vendor: true },
      });

      if (!product || !product.active) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found or inactive` },
          { status: 400 }
        );
      }

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      });

      subtotal += product.price * item.quantity;
      if (!vendorId && product.vendorId) {
        vendorId = product.vendorId;
      }
    }

    const orderNumber = `AM-${Date.now().toString(36).toUpperCase()}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: user.userId,
        vendorId,
        subtotal,
        deliveryFee: 0,
        discountAmount: 0,
        total: subtotal,
        currency: 'NGN',
        status: 'PENDING_PAYMENT',
        paymentStatus: 'PENDING',
        address,
        whatsapp,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: { include: { product: true } },
        payment: true,
      },
    });

    // Clear cart items for this user
    await db.cartItem.deleteMany({
      where: {
        cart: { userId: user.userId },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
