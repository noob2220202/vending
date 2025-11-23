import { NextResponse } from 'next/server';
import { getAsync, runAsync } from '@/lib/db';
import { getUserIdFromCookies } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromCookies();
    if (!userId) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: '현재/새 비밀번호가 필요합니다.' }, { status: 400 });
    }

    const user = await getAsync('SELECT password FROM users WHERE id = ?', [userId]);
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (user.password !== currentPassword) {
      return NextResponse.json({ error: '현재 비밀번호가 일치하지 않습니다.' }, { status: 400 });
    }

    await runAsync('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}


