import { NextResponse } from 'next/server';
import { allAsync, ensureDBInitialized, runAsync } from '@/lib/db';

export async function GET() {
  try {
    await ensureDBInitialized();
    const nowIso = new Date().toISOString();
    const rows = await allAsync(
      'SELECT * FROM emergency_announcements WHERE end_at >= datetime(?) ORDER BY created_at DESC',
      [nowIso]
    );
    if (!rows?.length) return NextResponse.json({ success: true, data: [] });
    return NextResponse.json({ success: true, data: rows });
  } catch (e) {
    console.error('긴급 공지 조회 오류:', e);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDBInitialized();
    const { title, content, end_at } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'title, content 필수' }, { status: 400 });
    }
    await runAsync(
      'INSERT INTO emergency_announcements (title, content, end_at) VALUES (?, ?, ?)',
      [title, content, end_at || new Date(Date.now() + 24*60*60*1000).toISOString()]
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('긴급 공지 등록 오류:', e);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}


