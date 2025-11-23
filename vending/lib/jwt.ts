import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export interface JwtPayload {
  sub: string; 
  iat?: number;
  exp?: number;
}

export function signUserToken(userId: string, expiresIn: string = '7d'): string {
  return jwt.sign({ sub: userId } as JwtPayload, JWT_SECRET, { expiresIn });
}

export function verifyUserToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function getUserIdFromCookies(): string | null {
  try {
    const store = cookies();
    const token = store.get('token')?.value;
    if (!token) return null;
    const payload = verifyUserToken(token);
    return payload?.sub ?? null;
  } catch {
    return null;
  }
}

export interface AdminJwtPayload {
  role: 'admin';
  sub?: string;
  iat?: number;
  exp?: number;
}

export function signAdminToken(expiresIn: string = '7d'): string {
  const payload: AdminJwtPayload = { role: 'admin', sub: 'admin' };
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyAdminToken(token: string): AdminJwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminJwtPayload;
    if (decoded?.role === 'admin') return decoded;
    return null;
  } catch {
    return null;
  }
}

export function getIsAdminFromCookies(): boolean {
  try {
    const store = cookies();
    const token = store.get('admin_token')?.value;
    if (!token) return false;
    return !!verifyAdminToken(token);
  } catch {
    return false;
  }
}


