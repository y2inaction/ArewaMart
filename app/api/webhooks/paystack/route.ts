import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

function verifyPaystackSignature(signature: string, body: string): boolean {
  const hash = crypto
    .createHmac('sha512', SECRET_KEY)
    .update(body)
    .digest('hex');
  return hash === signature;
}

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-paystack-signature') || '';
    const body = await req.text();

    if (!verifyPaystackSignature(signature, body)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;

      const payment = await db.payment.findUnique({
        where: { reference },
        include: { order: true },
      });

      if (!payment) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      // Update payment status
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          verifiedAt: new Date(),
        },
      });

      // Update order status
      if (payment.order) {
        await db.order.update({
          where: { id: payment.order.id },
          data: {
            status: 'PAID',
            paymentStatus: 'SUCCESS',
          },
        });
      }

      return NextResponse.json({ success: true });
    }

    if (event.event === 'charge.failed') {
      const { reference } = event.data;

      const payment = await db.payment.findUnique({
        where: { reference },
        include: { order: true },
      });

      if (payment) {
        await db.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            verifiedAt: new Date(),
          },
        });

        if (payment.order) {
          await db.order.update({
            where: { id: payment.order.id },
            data: {
              status: 'CANCELLED',
              paymentStatus: 'FAILED',
            },
          });
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
