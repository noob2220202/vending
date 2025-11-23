import { NextResponse } from 'next/server';
import { getAsync } from '@/lib/db';
import { signUserToken } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, password } = body;

    if (!id || !password) {
      return NextResponse.json(
        { error: 'ID와 비밀번호가 필요합니다.' },
        { status: 400 }
      );
    }

    const user = await getAsync(
      'SELECT * FROM users WHERE id = ? AND password = ?',
      [id, password]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'ID 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    const token = signUserToken(user.id);
    const res = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        money: user.money,
        used_money: user.used_money,
        role: user.role,
        lastip: user.lastip,
        phone: user.phone,
        birth: user.birth,
        email: user.email
      }
    });
    res.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    return res;
  } catch (error) {
    console.error('로그인 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

