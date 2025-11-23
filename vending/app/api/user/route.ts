import { NextResponse } from 'next/server';
import { getAsync, runAsync } from '@/lib/db';
import { getUserIdFromCookies, signUserToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromCookies();
    if (!userId) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const user = await getAsync(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
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
  } catch (error) {
    console.error('유저 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, password } = body;

    if (!id || !password) {
      return NextResponse.json(
        { error: 'ID, 비밀번호는 필수입니다.' },
        { status: 400 }
      );
    }

    await runAsync(
      `INSERT INTO users (id, password, money, used_money, role, lastip) 
       VALUES (?, ?, 0, 0, '비구매자', '')`,
      [id, password]
    );

    const user = await getAsync('SELECT * FROM users WHERE id = ?', [id]);

    const token = signUserToken(user.id);
    const res = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        money: user.money,
        used_money: user.used_money,
        role: user.role,
        lastip: user.lastip,
        name: user.name,
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
      maxAge: 60 * 60 * 24 * 7
    });
    return res;
  } catch (error: any) {
    console.error('유저 생성 오류:', error);
    if (error.message?.includes('UNIQUE')) {
      return NextResponse.json(
        { error: '이미 존재하는 ID입니다.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

