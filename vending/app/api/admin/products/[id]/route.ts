import { NextResponse } from 'next/server';
import { getAsync, runAsync } from '@/lib/db';
import { getIsAdminFromCookies } from '@/lib/jwt';

interface Params { params: { id: string } }

export async function PUT(request: Request, { params }: Params) {
  if (!getIsAdminFromCookies()) return NextResponse.json({ error: '권한 없음' }, { status: 401 });
  const { name, price, description, category, plan, specification, status } = await request.json();
  await runAsync(
    'UPDATE products SET name=?, price=?, description=?, category=?, plan=?, specification=?, status=? WHERE id=?',
    [name, price, description || '', category, JSON.stringify(plan || []), specification || '', status ?? '1', params.id]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!getIsAdminFromCookies()) return NextResponse.json({ error: '권한 없음' }, { status: 401 });
  await runAsync('DELETE FROM products WHERE id = ?', [params.id]);
  return NextResponse.json({ success: true });
}
