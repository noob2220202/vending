import { NextResponse } from 'next/server';
import { getAsync, runAsync, ensureDBInitialized } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await ensureDBInitialized();

    const body = await request.json();
    const { userId, chargeLogId, amount, success } = body;

    if (!userId || !chargeLogId || !amount) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 });
    }

    const chargeLog = await getAsync(
      'SELECT * FROM chargelogs WHERE id = ? AND user_id = ?',
      [chargeLogId, userId]
    );

    if (!chargeLog) {
      return NextResponse.json({ error: '충전 내역을 찾을 수 없습니다' }, { status: 404 });
    }

    if (chargeLog.status === '완료') {
      return NextResponse.json({ error: '이미 처리된 충전입니다' }, { status: 400 });
    }

    if (success) {
      const user = await getAsync('SELECT * FROM users WHERE id = ?', [userId]);
      if (!user) {
        return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
      }

      await runAsync(
        'UPDATE users SET money = money + ? WHERE id = ?',
        [amount, userId]
      );

      await runAsync(
        'UPDATE chargelogs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['완료', chargeLogId]
      );

      await runAsync(
        'INSERT INTO notifications (user_id, type, title, message, data) VALUES (?, ?, ?, ?, ?)',
        [
          userId,
          'success',
          '충전 완료',
          `${amount.toLocaleString()}원이 충전되었습니다.`,
          JSON.stringify({ amount, chargeLogId })
        ]
      );

      return NextResponse.json({ 
        success: true, 
        message: '충전이 완료되었습니다'
      });
    } else {
      await runAsync(
        'UPDATE chargelogs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['실패', chargeLogId]
      );

      await runAsync(
        'INSERT INTO notifications (user_id, type, title, message, data) VALUES (?, ?, ?, ?, ?)',
        [
          userId,
          'error',
          '충전 실패',
          '입금 확인에 실패했습니다. 관리자에게 문의하세요.',
          JSON.stringify({ amount, chargeLogId })
        ]
      );


      return NextResponse.json({ 
        success: false, 
        message: '충전에 실패했습니다'
      });
    }

  } catch (error) {
    console.error('충전 콜백 처리 실패:', error);
    return NextResponse.json({ 
      error: '충전 처리 중 오류가 발생했습니다' 
    }, { status: 500 });
  }
}

