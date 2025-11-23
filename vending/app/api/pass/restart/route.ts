import { NextResponse } from 'next/server';
import { PASS_SERVER_URL, PASS_API_KEY } from '@/lib/config';

export async function POST(request: Request) {
  try {
    if (!PASS_API_KEY) {
      return NextResponse.json({ error: '서버 환경변수 PASS_API_KEY가 필요합니다.' }, { status: 500 });
    }
    const { task_id, isp } = await request.json();
    if (!task_id || !isp) {
      return NextResponse.json({ error: 'task_id, isp 필수' }, { status: 400 });
    }
    const res = await fetch(`${PASS_SERVER_URL}/api/isp-submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: PASS_API_KEY, task_id, isp })
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error('PASS restart 프록시 오류:', e);
    return NextResponse.json({ error: 'PASS restart 호출 실패' }, { status: 500 });
  }
}


