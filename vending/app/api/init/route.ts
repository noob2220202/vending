import { NextResponse } from 'next/server';
import { runAsync, ensureDBInitialized } from '@/lib/db';

export async function POST() {
  try {
    await ensureDBInitialized();

    return NextResponse.json({ message: '데이터베이스 초기화 완료' });
  } catch (error) {
    console.error('초기화 오류:', error);
    return NextResponse.json(
      { error: '초기화 실패' },
      { status: 500 }
    );
  }
}
