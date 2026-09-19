import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, generateToken, setAuthCookie, setRefreshCookie, generateRefreshToken } from '@/lib/auth';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = LoginSchema.parse(body);

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken(user.id);

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });

    await setAuthCookie(token);
    await setRefreshCookie(refreshToken);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
