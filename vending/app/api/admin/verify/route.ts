import { NextResponse } from 'next/server';
import { getIsAdminFromCookies } from '@/lib/jwt';

export async function GET() {
  const isAdmin = getIsAdminFromCookies();
  if (!isAdmin) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json({ success: true });
}
