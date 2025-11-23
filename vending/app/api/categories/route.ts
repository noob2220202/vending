import { NextResponse } from 'next/server';
import { allAsync, runAsync } from '@/lib/db';

export async function GET() {
  try {
    const categories = await allAsync('SELECT * FROM categories');
    
    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('카테고리 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: '카테고리 이름이 필요합니다.' },
        { status: 400 }
      );
    }

    await runAsync(
      'INSERT INTO categories (name) VALUES (?)',
      [name]
    );

    return NextResponse.json({
      success: true,
      message: '카테고리가 추가되었습니다.'
    });
  } catch (error: any) {
    console.error('카테고리 추가 오류:', error);
    if (error.message?.includes('UNIQUE')) {
      return NextResponse.json(
        { error: '이미 존재하는 카테고리입니다.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

