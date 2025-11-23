import { NextResponse } from 'next/server';
import { allAsync } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '5';
    
    const topProducts = await allAsync(
      `SELECT 
        p.id,
        p.name,
        p.category,
        COUNT(b.id) as count
      FROM buylogs b
      JOIN products p ON b.product_id = p.id
      GROUP BY b.product_id
      ORDER BY count DESC
      LIMIT ?`,
      [parseInt(limit)]
    );
    
    return NextResponse.json(topProducts);
  } catch (error) {
    console.error('구매 순위 조회 오류:', error);
    return NextResponse.json(
      { error: '구매 순위를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

