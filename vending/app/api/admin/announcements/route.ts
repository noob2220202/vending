import { NextResponse } from 'next/server';
import { allAsync, runAsync } from '@/lib/db';
import { getIsAdminFromCookies } from '@/lib/jwt';

export async function GET() {
  if (!getIsAdminFromCookies()) return NextResponse.json({ error: '권한 없음' }, { status: 401 });
  const rows = await allAsync('SELECT * FROM announcements ORDER BY created_at DESC');
  return NextResponse.json({ success: true, data: rows });
}

export async function POST(request: Request) {
  if (!getIsAdminFromCookies()) return NextResponse.json({ error: '권한 없음' }, { status: 401 });
  const { title, content } = await request.json();
  if (!title || !content) return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 });
  await runAsync('INSERT INTO announcements (title, content) VALUES (?, ?)', [title, content]);
  return NextResponse.json({ success: true });
}
