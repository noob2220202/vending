import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { allAsync, runAsync } from '@/lib/db';
import { getIsAdminFromCookies } from '@/lib/jwt';

const FILEBOX_DIR = path.join(process.cwd(), 'public', 'filebox');
const PRODUCTS_IMAGE_DIR = path.join(process.cwd(), 'public', 'products');

export async function GET() {
  if (!getIsAdminFromCookies()) return NextResponse.json({ error: '권한 없음' }, { status: 401 });
  
  const rows = await allAsync('SELECT * FROM products ORDER BY id DESC');
  
  let files: string[] = [];
  let imageFiles: string[] = [];
  
  try {
    files = await fs.readdir(FILEBOX_DIR).catch(() => []);
    imageFiles = await fs.readdir(PRODUCTS_IMAGE_DIR).catch(() => []);
  } catch (e) {
  }

  const productsWithFiles = await Promise.all(
    rows.map(async (p: any) => {
      const fileName = `${p.id}.zip`;
      const imageName = `${p.id}.png`;
      const hasFile = files.includes(fileName);
      const hasImage = imageFiles.includes(imageName);
      
      let fileSize = 0;
      if (hasFile) {
        try {
          const filePath = path.join(FILEBOX_DIR, fileName);
          const stats = await fs.stat(filePath);
          fileSize = stats.size;
        } catch {}
      }

      return {
        ...p,
        plan: p.plan ? JSON.parse(p.plan) : [],
        hasFile,
        hasImage,
        fileSize: hasFile ? fileSize : undefined,
      };
    })
  );
  
  return NextResponse.json({ success: true, data: productsWithFiles });
}

export async function POST(request: Request) {
  if (!getIsAdminFromCookies()) return NextResponse.json({ error: '권한 없음' }, { status: 401 });
  const { name, price, description, category, plan, specification, status } = await request.json();
  await runAsync(
    'INSERT INTO products (name, price, description, category, plan, specification, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, price, description || '', category, JSON.stringify(plan || []), specification || '', status ?? '1']
  );
  return NextResponse.json({ success: true });
}
