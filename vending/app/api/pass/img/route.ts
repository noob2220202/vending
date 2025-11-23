import { NextResponse } from 'next/server';
import { PASS_SERVER_URL } from '@/lib/config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const img = searchParams.get('img');
    if (!img) return NextResponse.json({ error: 'img 쿼리 필수' }, { status: 400 });

    const res = await fetch(`${PASS_SERVER_URL}/api/img?img=${encodeURIComponent(img)}`);
    const buf = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/png';
    return new Response(buf, {
      status: res.status,
      headers: { 'Content-Type': contentType }
    });
  } catch (e) {
    console.error('PASS img 프록시 오류:', e);
    return NextResponse.json({ error: '이미지 프록시 실패' }, { status: 500 });
  }
}
