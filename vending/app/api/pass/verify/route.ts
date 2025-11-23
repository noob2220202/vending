import { NextResponse } from 'next/server';
import { PASS_SERVER_URL, PASS_API_KEY } from '@/lib/config';
import { ensureDBInitialized, runAsync } from '@/lib/db';
import { getUserIdFromCookies } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    if (!PASS_API_KEY) {
      return NextResponse.json({ error: '서버 환경변수 PASS_API_KEY가 필요합니다.' }, { status: 500 });
    }
    const { task_id, auth_code } = await request.json();
    if (!task_id || !auth_code) {
      return NextResponse.json({ error: 'task_id, auth_code 필수' }, { status: 400 });
    }


    const res = await fetch(`${PASS_SERVER_URL}/api/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: PASS_API_KEY, task_id, auth_code })
    });
    const data = await res.json();

    if (res.ok && data?.status === 'success' && data?.data) {
      const userId = getUserIdFromCookies();
      if (userId) {
        const { name, phone, birth, isp } = data.data;
        await ensureDBInitialized();
        await runAsync('UPDATE users SET name = ?, phone = ?, birth = ? ,isp = ? WHERE id = ?', [name, phone, birth, isp, userId]);
      }
    }

    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error('PASS verify 프록시 오류:', e);
    return NextResponse.json({ error: 'PASS verify 호출 실패' }, { status: 500 });
  }
}


