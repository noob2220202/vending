import { NextResponse } from 'next/server';
import { signAdminToken } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const { id, password } = await request.json();
    if (id === 'cubix' && password === 'Exe222888!') {
      const token = signAdminToken('7d');
      const res = NextResponse.json({ success: true });
      res.cookies.set('admin_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      });
      return res;
    }
    return NextResponse.json({ error: '인증 실패' }, { status: 401 });
  } catch (e) {
    console.error('admin login error', e);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
