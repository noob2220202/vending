import { NextResponse } from 'next/server';
import { allAsync } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '5';
    
    const announcements = await allAsync(
      'SELECT * FROM announcements ORDER BY created_at DESC LIMIT ?',
      [parseInt(limit)]
    );
    
    return NextResponse.json(announcements);
  } catch (error) {
    console.error('공지사항 조회 오류:', error);
    return NextResponse.json(
      { error: '공지사항을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

