import { NextResponse } from 'next/server';
import { getAsync, runAsync, ensureDBInitialized } from '@/lib/db';
import { getUserIdFromCookies } from '@/lib/jwt';
import { AOS_SERVER_URL, PUSHBULLET_TOKEN } from '@/lib/config';

export async function POST(request: Request) {
  try {
    await ensureDBInitialized();
    
    const userId = getUserIdFromCookies();
    if (!userId) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const user = await getAsync('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    if (!user.name || !user.phone || !user.isp || !user.birth) {
      return NextResponse.json({ error: '본인 인증이 필요합니다' }, { status: 403 });
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: '올바른 금액을 입력하세요' }, { status: 400 });
    }

    if (amount < 10000) {
      return NextResponse.json({ error: '최소 충전 금액은 10,000원입니다' }, { status: 400 });
    }

    const result = await new Promise<any>((resolve, reject) => {
      const db = require('@/lib/db').default;
      db.run(
        'INSERT INTO chargelogs (user_id, amount, payment_method, status) VALUES (?, ?, ?, ?)',
        [userId, amount, '계좌이체', '대기'],
        function(this: any, err: any) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID });
        }
      );
    });

    const chargeLogId = result.lastID;

    try {
      const aosResponse = await fetch(`${AOS_SERVER_URL}/bank`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time: Math.floor(Date.now() / 1000),
          pushbullet: PUSHBULLET_TOKEN || '',
          amount: amount,
          name: user.name,
          userId: userId,
          chargeLogId: chargeLogId
        })
      });

      const aosData = await aosResponse.json();
      
      if (!aosResponse.ok || !aosData.success) {
        console.error('AOS 서버 오류:', aosData.message);
      }
    } catch (aosError) {
      console.error('AOS 서버 연결 실패:', aosError);
    }

    return NextResponse.json({ 
      success: true, 
      message: '충전 요청이 접수되었습니다. 계좌로 입금하시면 1분 내로 자동 충전됩니다.',
      data: {
        amount,
        chargeLogId
      }
    });

  } catch (error) {
    console.error('충전 요청 실패:', error);
    return NextResponse.json({ 
      error: '충전 요청 중 오류가 발생했습니다' 
    }, { status: 500 });
  }
}

