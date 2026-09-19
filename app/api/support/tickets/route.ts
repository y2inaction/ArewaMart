import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const createTicketSchema = z.object({
  subject: z.string().min(5).max(200),
  description: z.string().min(10).max(3000),
  category: z.string().min(3).max(50),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
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

    const [tickets, total] = await Promise.all([
      db.supportTicket.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.supportTicket.count({ where: { userId: user.userId } }),
    ]);

    return NextResponse.json({
      tickets,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Tickets fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { priority, ...ticketData } = createTicketSchema.parse(body);

    const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`;

    const ticket = await db.supportTicket.create({
      data: {
        ...ticketData,
        ticketNumber,
        userId: user.userId,
        priority: priority || 'normal',
        status: 'open',
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Ticket creation error:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
