import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const verifySchema = z.object({
  approved: z.boolean(),
  reason: z.string().optional(),
});

export async function POST(
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
    const { approved, reason } = verifySchema.parse(body);

    const vendor = await db.vendor.findUnique({
      where: { id },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const updatedVendor = await db.vendor.update({
      where: { id },
      data: {
        verified: approved,
        verificationStatus: approved ? 'approved' : 'rejected',
        verificationDate: new Date(),
      },
      include: {
        community: true,
      },
    });

    // Log the action
    await db.auditLog.create({
      data: {
        userId: user.userId,
        action: approved ? 'VENDOR_VERIFIED' : 'VENDOR_REJECTED',
        resource: 'VENDOR',
        resourceId: vendor.id,
        changes: JSON.stringify({ verified: approved, reason }),
      },
    });

    return NextResponse.json(updatedVendor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Vendor verification error:', error);
    return NextResponse.json({ error: 'Failed to verify vendor' }, { status: 500 });
  }
}
