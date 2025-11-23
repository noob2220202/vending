import { NextResponse } from 'next/server';
import { allAsync, ensureDBInitialized, runAsync } from '@/lib/db';
import { getUserIdFromCookies } from '@/lib/jwt';

export async function GET(request: Request) {
  try {
    await ensureDBInitialized();
    const userId = getUserIdFromCookies();
    if (!userId) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

    const chargelogs = await allAsync(
      'SELECT * FROM chargelogs WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return NextResponse.json({ success: true, data: chargelogs });
  } catch (error) {
    console.error('충전내역 조회 실패:', error);
    return NextResponse.json({ error: '충전내역 조회 실패' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDBInitialized();
    const userId = getUserIdFromCookies();
    if (!userId) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

    const body = await request.json();
    const { amount, paymentMethod, status = '완료' } = body;

    if (!amount || !paymentMethod) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 });
    }

    await runAsync(
      'INSERT INTO chargelogs (user_id, amount, payment_method, status) VALUES (?, ?, ?, ?)',
      [userId, amount, paymentMethod, status]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('충전내역 추가 실패:', error);
    return NextResponse.json({ error: '충전내역 추가 실패' }, { status: 500 });
  }
}

