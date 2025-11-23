import { NextResponse } from 'next/server';
import { allAsync, ensureDBInitialized, runAsync } from '@/lib/db';
import { getUserIdFromCookies } from '@/lib/jwt';

export async function GET(request: Request) {
  try {
    await ensureDBInitialized();
    
    const userId = getUserIdFromCookies();
    if (!userId) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const buylogs = await allAsync(
      'SELECT * FROM buylogs WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return NextResponse.json({ success: true, data: buylogs });
  } catch (error) {
    console.error('구매내역 조회 실패:', error);
    return NextResponse.json({ error: '구매내역 조회 실패' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDBInitialized();

    const userId = getUserIdFromCookies();
    if (!userId) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, productName, planDay, amount, price, code } = body;

    if (!productId || !productName || !planDay || !amount || !price || !code) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 });
    }

    await runAsync(
      'INSERT INTO buylogs (user_id, product_id, product_name, plan_day, amount, price, code) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, productId, productName, planDay, amount, price, code]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('구매내역 추가 실패:', error);
    return NextResponse.json({ error: '구매내역 추가 실패' }, { status: 500 });
  }
}

