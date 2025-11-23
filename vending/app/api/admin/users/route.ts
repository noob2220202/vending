import { NextResponse } from 'next/server';
import { allAsync } from '@/lib/db';
import { getIsAdminFromCookies } from '@/lib/jwt';

export async function GET() {
  if (!getIsAdminFromCookies()) return NextResponse.json({ error: '권한 없음' }, { status: 401 });
  const rows = await allAsync('SELECT * FROM users ORDER BY id ASC');
  return NextResponse.json({ success: true, data: rows });
}
