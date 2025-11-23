import { NextResponse } from 'next/server';
import { allAsync, runAsync, ensureDBInitialized } from '@/lib/db';

export async function GET() {
  try {
    await ensureDBInitialized();

    const charges = await allAsync(`
      SELECT 
        c.id,
        c.user_id,
        c.amount,
        c.payment_method,
        c.status,
        c.created_at,
        u.name as user_name,
        u.phone as user_phone
      FROM chargelogs c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: charges
    });
  } catch (error) {
    console.error('충전 요청 조회 실패:', error);
    return NextResponse.json({
      error: '서버 오류가 발생했습니다'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureDBInitialized();

    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json({
        error: '충전 ID와 액션이 필요합니다'
      }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({
        error: '올바른 액션이 아닙니다'
      }, { status: 400 });
    }

    const charge = await allAsync(
      'SELECT * FROM chargelogs WHERE id = ?',
      [id]
    );

    if (!charge || charge.length === 0) {
      return NextResponse.json({
        error: '충전 요청을 찾을 수 없습니다'
      }, { status: 404 });
    }

    const chargeData = charge[0];

    if (action === 'approve') {
      await runAsync(
        'UPDATE users SET money = money + ? WHERE id = ?',
        [chargeData.amount, chargeData.user_id]
      );

      await runAsync(
        'UPDATE chargelogs SET status = ? WHERE id = ?',
        ['완료', id]
      );

      return NextResponse.json({
        success: true,
        message: '충전이 승인되었습니다'
      });
    } else {
      await runAsync(
        'UPDATE chargelogs SET status = ? WHERE id = ?',
        ['거부', id]
      );

      return NextResponse.json({
        success: true,
        message: '충전이 거부되었습니다'
      });
    }
  } catch (error) {
    console.error('충전 승인/거부 실패:', error);
    return NextResponse.json({
      error: '서버 오류가 발생했습니다'
    }, { status: 500 });
  }
}
