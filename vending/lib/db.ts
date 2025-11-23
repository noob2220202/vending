import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.db');

const db = new sqlite3.Database(dbPath);

export const runAsync = (sql: string, params: any[] = []): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const getAsync = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const allAsync = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

let dbInitialized = false;

export async function ensureDBInitialized() {
  if (!dbInitialized) {
    await initDB();
    dbInitialized = true;
  }
}

export async function initDB() {
  await runAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      money INTEGER NOT NULL DEFAULT 0,
      used_money INTEGER NOT NULL DEFAULT 0,
      role TEXT NOT NULL DEFAULT '비구매자',
      lastip TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      isp TEXT NOT NULL,
      birth TEXT NOT NULL,
      email TEXT NOT NULL
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      plan TEXT NOT NULL,
      specification TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT '1'
    )
  `);
  
  await runAsync(`
    CREATE TABLE IF NOT EXISTS visits (
      ip TEXT PRIMARY KEY,
      time DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  await runAsync(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS emergency_announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      end_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS buylogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      plan_day TEXT NOT NULL,
      amount INTEGER NOT NULL,
      price INTEGER NOT NULL,
      code TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS chargelogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT '완료',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

}

export default db;

