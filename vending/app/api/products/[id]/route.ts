import { NextResponse } from 'next/server';
import { ensureDBInitialized, getAsync } from '@/lib/db';

interface Params { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  try {
    await ensureDBInitialized();
    const idNum = Number(params.id);
    if (!Number.isFinite(idNum)) {
      return NextResponse.json({ error: '잘못된 ID' }, { status: 400 });
    }
    const row = await getAsync('SELECT * FROM products WHERE id = ?', [idNum]);
    if (!row) return NextResponse.json({ error: '제품을 찾을 수 없습니다.' }, { status: 404 });
    return NextResponse.json({ success: true, data: { ...row, plan: row.plan ? JSON.parse(row.plan) : [] } });
  } catch (e) {
    console.error('제품 상세 조회 오류:', e);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}


