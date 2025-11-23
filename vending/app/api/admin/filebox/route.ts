import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { allAsync, ensureDBInitialized } from '@/lib/db';

const FILEBOX_DIR = path.join(process.cwd(), 'public', 'filebox');
const PRODUCTS_IMAGE_DIR = path.join(process.cwd(), 'public', 'products');

async function ensureFileboxDir() {
  try {
    await fs.access(FILEBOX_DIR);
  } catch {
    await fs.mkdir(FILEBOX_DIR, { recursive: true });
  }
}

async function ensureImageDir() {
  try {
    await fs.access(PRODUCTS_IMAGE_DIR);
  } catch {
    await fs.mkdir(PRODUCTS_IMAGE_DIR, { recursive: true });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const productId = searchParams.get('productId');
    const downloadAll = searchParams.get('downloadAll');

    if (action === 'download' && productId) {
      await ensureFileboxDir();
      
      const fileName = `${productId}.zip`;
      const filePath = path.join(FILEBOX_DIR, fileName);

      try {
        const fileBuffer = await fs.readFile(filePath);
        const stats = await fs.stat(filePath);

        return new NextResponse(fileBuffer as any, {
          status: 200,
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Length': stats.size.toString(),
          },
        });
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          return NextResponse.json({ 
            error: '파일이 존재하지 않습니다' 
          }, { status: 404 });
        }
        throw error;
      }
    }

    if (downloadAll === 'true') {
      await ensureFileboxDir();
      
      const files = await fs.readdir(FILEBOX_DIR);
      const zipFiles = files.filter(file => file.endsWith('.zip'));

      if (zipFiles.length === 0) {
        return NextResponse.json({ 
          error: '다운로드할 파일이 없습니다' 
        }, { status: 404 });
      }

      const fileList = await Promise.all(
        zipFiles.map(async (fileName) => {
          const filePath = path.join(FILEBOX_DIR, fileName);
          try {
            const stats = await fs.stat(filePath);
            return {
              fileName,
              size: stats.size,
              downloadUrl: `/api/admin/filebox?action=download&productId=${fileName.replace('.zip', '')}`
            };
          } catch (error) {
            console.error(`파일 정보 읽기 실패: ${fileName}`, error);
            return null;
          }
        })
      );

      return NextResponse.json({
        success: true,
        files: fileList.filter(Boolean),
        message: `${zipFiles.length}개의 파일을 다운로드할 수 있습니다.`
      });
    }

    await ensureDBInitialized();
    await ensureFileboxDir();
    await ensureImageDir();

    const products = await allAsync(
      'SELECT id, name, category FROM products ORDER BY id ASC'
    );

    const files = await fs.readdir(FILEBOX_DIR);
    
    const imageFiles = await fs.readdir(PRODUCTS_IMAGE_DIR).catch(() => []);

    const productsWithFiles = await Promise.all(
      (products as any[]).map(async (product) => {
        const fileName = `${product.id}.zip`;
        const hasFile = files.includes(fileName);
        
        let fileSize = 0;
        if (hasFile) {
          try {
            const filePath = path.join(FILEBOX_DIR, fileName);
            const stats = await fs.stat(filePath);
            fileSize = stats.size;
          } catch {}
        }

        const imageName = `${product.id}.png`;
        const hasImage = (imageFiles as string[]).includes(imageName);

        return {
          id: product.id,
          name: product.name,
          category: product.category,
          hasFile,
          fileName: hasFile ? fileName : undefined,
          fileSize: hasFile ? fileSize : undefined,
          hasImage,
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      products: productsWithFiles 
    });
  } catch (error) {
    console.error('Filebox GET error:', error);
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDBInitialized();
    await ensureFileboxDir();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;

    if (!file || !productId) {
      return NextResponse.json({ 
        error: '파일과 제품 ID가 필요합니다' 
      }, { status: 400 });
    }

    if (!file.name.endsWith('.zip')) {
      return NextResponse.json({ 
        error: 'ZIP 파일만 업로드 가능합니다' 
      }, { status: 400 });
    }

    const products = await allAsync(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    );

    if (!products || products.length === 0) {
      return NextResponse.json({ 
        error: '존재하지 않는 제품입니다' 
      }, { status: 404 });
    }

    const fileName = `${productId}.zip`;
    const filePath = path.join(FILEBOX_DIR, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      message: '파일이 업로드되었습니다',
      fileName 
    });
  } catch (error) {
    console.error('Filebox POST error:', error);
    return NextResponse.json({ 
      error: '파일 업로드 중 오류가 발생했습니다' 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureFileboxDir();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ 
        error: '제품 ID가 필요합니다' 
      }, { status: 400 });
    }

    const fileName = `${productId}.zip`;
    const filePath = path.join(FILEBOX_DIR, fileName);

    try {
      await fs.unlink(filePath);
      return NextResponse.json({ 
        success: true, 
        message: '파일이 삭제되었습니다' 
      });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return NextResponse.json({ 
          error: '파일이 존재하지 않습니다' 
        }, { status: 404 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Filebox DELETE error:', error);
    return NextResponse.json({ 
      error: '파일 삭제 중 오류가 발생했습니다' 
    }, { status: 500 });
  }
}

