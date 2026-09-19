import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const createAddressSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  street: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  postalCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await db.address.findMany({
      where: { userId: user.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Addresses fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { isDefault, ...addressData } = createAddressSchema.parse(body);

    if (isDefault) {
      await db.address.updateMany({
        where: { userId: user.userId },
        data: { isDefault: false },
      });
    }

    const address = await db.address.create({
      data: {
        ...addressData,
        userId: user.userId,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Address creation error:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}
