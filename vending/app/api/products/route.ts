import { NextResponse } from 'next/server';
import { allAsync, runAsync, ensureDBInitialized } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await ensureDBInitialized();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let products;
    if (category) {
      products = await allAsync(
        'SELECT * FROM products WHERE category = ? ORDER BY id DESC',
        [category]
      );
    } else {
      products = await allAsync('SELECT * FROM products ORDER BY id DESC');
    }
    
    const parsedProducts = products.map((product: any) => ({
      ...product,
      plan: product.plan ? JSON.parse(product.plan) : []
    }));
    
    return NextResponse.json(parsedProducts);
  } catch (error) {
    console.error('제품 조회 오류:', error);
    return NextResponse.json(
      { error: '제품을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureDBInitialized();
    const body = await request.json();
    const { name, price, description, stock } = body;

    await runAsync(
      'INSERT INTO products (name, price, description, stock) VALUES (?, ?, ?, ?)',
      [name, price, description || null, stock || 0]
    );

    return NextResponse.json(
      { message: '제품이 추가되었습니다.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('제품 추가 오류:', error);
    return NextResponse.json(
      { error: '제품 추가에 실패했습니다.' },
      { status: 500 }
    );
  }
}

