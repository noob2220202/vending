import { NextResponse } from 'next/server';
import { getAsync } from '@/lib/db';

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const id = parseInt(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: '잘못된 ID' }, { status: 400 });
    }

    const row = await getAsync('SELECT * FROM announcements WHERE id = ?', [id]);
    if (!row) {
      return NextResponse.json({ error: '존재하지 않는 공지입니다.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    console.error('공지 상세 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}


