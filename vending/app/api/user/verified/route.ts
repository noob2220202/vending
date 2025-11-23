import { NextResponse } from 'next/server';
import { ensureDBInitialized, getAsync } from '@/lib/db';
import { getUserIdFromCookies } from '@/lib/jwt';

export async function GET() {
  try {
    const userId = getUserIdFromCookies();
    if (!userId) return NextResponse.json({ verified: false });
    await ensureDBInitialized();
    const row = await getAsync('SELECT name, phone, birth FROM users WHERE id = ?', [userId]);
    if (!row) return NextResponse.json({ verified: false });
    const verified = Boolean(row.name && row.phone && row.birth);
    return NextResponse.json({ verified, data: verified ? row : null });
  } catch (e) {
    console.error('인증 상태 조회 오류:', e);
    return NextResponse.json({ verified: false }, { status: 500 });
  }
}


