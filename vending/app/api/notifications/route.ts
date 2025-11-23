import { NextResponse } from 'next/server';
import { getAsync, runAsync, ensureDBInitialized } from '@/lib/db';
import { getUserIdFromCookies } from '@/lib/jwt';

export async function GET(request: Request) {
  try {
    await ensureDBInitialized();
    const userId = getUserIdFromCookies();
    
    if (!userId) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const notifications = await getAsync(
      `SELECT cl.*, u.name as user_name 
       FROM chargelogs cl 
       JOIN users u ON cl.user_id = u.id 
       WHERE cl.user_id = ? AND cl.status = '완료' AND cl.updated_at > datetime('now', '-1 day')
       ORDER BY cl.updated_at DESC 
       LIMIT 10`,
      [userId]
    );

    return NextResponse.json({ 
      success: true, 
      data: notifications || [] 
    });

  } catch (error) {
    console.error('알림 조회 실패:', error);
    return NextResponse.json({ 
      error: '알림 조회 중 오류가 발생했습니다' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDBInitialized();
    
    const body = await request.json();
    const { userId, type, title, message, data } = body;

    if (!userId) {
      return NextResponse.json({ error: '사용자 ID가 필요합니다' }, { status: 400 });
    }

    await runAsync(
      'INSERT INTO notifications (user_id, type, title, message, data, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, type || 'info', title, message, JSON.stringify(data || {}), new Date().toISOString()]
    );

    return NextResponse.json({ 
      success: true, 
      message: '알림이 생성되었습니다' 
    });

  } catch (error) {
    console.error('알림 생성 실패:', error);
    return NextResponse.json({ 
      error: '알림 생성 중 오류가 발생했습니다' 
    }, { status: 500 });
  }
}
