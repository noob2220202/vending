import sqlite3

def init_chargelist_db():
    conn = sqlite3.connect("chargelist.db")
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chargelist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time INTEGER NOT NULL,
            amount INTEGER NOT NULL,
            name TEXT NOT NULL,
            device TEXT NOT NULL DEFAULT 'aos',
            comfirmed INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(time, amount, name)
        )
    """)
    
    conn.commit()
    conn.close()
    print("chargelist.db 초기화 완료!")

if __name__ == "__main__":
    init_chargelist_db()

