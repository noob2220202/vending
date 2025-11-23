import { NextResponse } from 'next/server';
import { runAsync } from '@/lib/db';
import { getIsAdminFromCookies } from '@/lib/jwt';

interface Params { params: { id: string } }

export async function PUT(request: Request, { params }: Params) {
  if (!getIsAdminFromCookies()) return NextResponse.json({ error: '권한 없음' }, { status: 401 });
  const { name } = await request.json();
  if (!name) return NextResponse.json({ error: 'name 필수' }, { status: 400 });
  await runAsync('UPDATE categories SET name = ? WHERE id = ?', [name, params.id]);
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!getIsAdminFromCookies()) return NextResponse.json({ error: '권한 없음' }, { status: 401 });
  await runAsync('DELETE FROM categories WHERE id = ?', [params.id]);
  return NextResponse.json({ success: true });
}
