import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken, setAuthCookie, setRefreshCookie, generateRefreshToken } from '@/lib/auth';
import { z } from 'zod';

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = RegisterSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: 'CUSTOMER',
      },
    });

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken(user.id);

    const response = NextResponse.json(
      {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      },
      { status: 201 }
    );

    await setAuthCookie(token);
    await setRefreshCookie(refreshToken);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
