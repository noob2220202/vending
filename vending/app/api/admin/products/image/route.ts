import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { ensureDBInitialized, getAsync } from '@/lib/db';

const PRODUCTS_IMAGE_DIR = path.join(process.cwd(), 'public', 'products');

async function ensureImageDir() {
  try {
    await fs.access(PRODUCTS_IMAGE_DIR);
  } catch {
    await fs.mkdir(PRODUCTS_IMAGE_DIR, { recursive: true });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDBInitialized();
    await ensureImageDir();

    const formData = await request.formData();
    const image = formData.get('image') as File;
    const productId = formData.get('productId') as string;

    if (!image || !productId) {
      return NextResponse.json({ 
        error: '이미지와 제품 ID가 필요합니다' 
      }, { status: 400 });
    }

    if (!image.type.includes('png')) {
      return NextResponse.json({ 
        error: 'PNG 이미지만 업로드 가능합니다' 
      }, { status: 400 });
    }

    const product = await getAsync(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    );

    if (!product) {
      return NextResponse.json({ 
        error: '존재하지 않는 제품입니다' 
      }, { status: 404 });
    }

    const fileName = `${productId}.png`;
    const filePath = path.join(PRODUCTS_IMAGE_DIR, fileName);

    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      message: '이미지가 업로드되었습니다',
      fileName 
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ 
      error: '이미지 업로드 중 오류가 발생했습니다' 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureImageDir();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ 
        error: '제품 ID가 필요합니다' 
      }, { status: 400 });
    }

    const fileName = `${productId}.png`;
    const filePath = path.join(PRODUCTS_IMAGE_DIR, fileName);

    try {
      await fs.unlink(filePath);
      return NextResponse.json({ 
        success: true, 
        message: '이미지가 삭제되었습니다' 
      });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return NextResponse.json({ 
          error: '이미지가 존재하지 않습니다' 
        }, { status: 404 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Image delete error:', error);
    return NextResponse.json({ 
      error: '이미지 삭제 중 오류가 발생했습니다' 
    }, { status: 500 });
  }
}

