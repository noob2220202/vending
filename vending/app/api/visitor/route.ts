import { NextResponse } from 'next/server';
import { allAsync, runAsync } from '@/lib/db';

export async function GET() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayVisitors = await allAsync(
      'SELECT COUNT(*) as count FROM visits WHERE time >= datetime(?)',
      [today.toISOString()]
    );

    const weekVisitors = await allAsync(
      'SELECT COUNT(*) as count FROM visits WHERE time >= datetime(?)',
      [weekAgo.toISOString()]
    );

    const monthVisitors = await allAsync(
      'SELECT COUNT(*) as count FROM visits WHERE time >= datetime(?)',
      [monthAgo.toISOString()]
    );

    return NextResponse.json({
      success: true,
      data: {
        today: todayVisitors[0]?.count || 0,
        thisWeek: weekVisitors[0]?.count || 0,
        thisMonth: monthVisitors[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('방문자 통계 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for') || '';
    const headerIp = forwarded.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '';

    let ip = headerIp;
    if (!ip) {
      try {
        const body = await request.json();
        ip = body?.ip || '';
      } catch {}
    }

    if (!ip) {
      ip = '0.0.0.0';
    }

    await runAsync(
      'INSERT OR REPLACE INTO visits (ip, time) VALUES (?, datetime("now"))',
      [ip]
    );

    return NextResponse.json({
      success: true,
      message: '방문 기록이 저장되었습니다.'
    });
  } catch (error) {
    console.error('방문 기록 저장 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

