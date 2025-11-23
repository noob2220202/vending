import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { ensureDBInitialized, getAsync } from '@/lib/db';
import { getUserIdFromCookies } from '@/lib/jwt';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productParam = searchParams.get('product') || searchParams.get('productId');
        if (!productParam) {
            return NextResponse.json({ error: 'product or productId is required' }, { status: 400 });
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(productParam)) {
            return NextResponse.json({ error: 'invalid product id' }, { status: 400 });
        }

        const userId = getUserIdFromCookies();
        if (!userId) {
            return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
        }

        const numericId = Number(productParam);
        const productIdForCheck = Number.isFinite(numericId) ? numericId : -1;
        const hasPurchased = await getAsync(
            'SELECT 1 AS ok FROM buylogs WHERE user_id = ? AND (product_id = ? OR product_name = ?) LIMIT 1',
            [userId, productIdForCheck, productParam]
        );
        if (!hasPurchased) {
            return NextResponse.json({ error: '해당 상품을 구매한 사용자만 다운로드 가능합니다' }, { status: 403 });
        }

        const filePath = path.join(process.cwd(), 'public', 'filebox', `${productParam}.zip`);

        try {
            const stat = await fs.stat(filePath);
            if (!stat.isFile()) throw new Error('not file');
        } catch {
            return NextResponse.json({ error: 'file not found' }, { status: 404 });
        }

        const fileBuffer = await fs.readFile(filePath);
        const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
        return new NextResponse(arrayBuffer as ArrayBuffer, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${productParam}.zip"`,
                'Content-Length': String(fileBuffer.byteLength)
            }
        });
    } catch (e) {
        console.error('filebox GET error:', e);
        return NextResponse.json({ error: 'internal server error' }, { status: 500 });
    }
}