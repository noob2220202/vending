import sqlite3
import random
from typing import Optional

from config import DB_PATH


def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    conn = _conn()
    try:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS bets (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                home_team        TEXT    NOT NULL,
                away_team        TEXT    NOT NULL,
                prize_amount     TEXT    NOT NULL,
                winner_count     INTEGER NOT NULL,
                deadline_display TEXT    NOT NULL,
                contact_username TEXT,
                status           TEXT    NOT NULL DEFAULT 'open',
                result           TEXT,
                message_id       INTEGER,
                channel_id       TEXT,
                created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS bet_entries (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                bet_id     INTEGER NOT NULL REFERENCES bets(id),
                user_id    INTEGER NOT NULL,
                username   TEXT,
                first_name TEXT    NOT NULL,
                choice     TEXT    NOT NULL,
                created_at TEXT    NOT NULL DEFAULT (datetime('now')),
                UNIQUE(bet_id, user_id)
            );
        """)
        conn.commit()
    finally:
        conn.close()


def create_bet(
    home_team: str,
    away_team: str,
    prize_amount: str,
    winner_count: int,
    deadline_display: str,
    contact_username: Optional[str] = None,
) -> int:
    conn = _conn()
    try:
        cur = conn.execute(
            "INSERT INTO bets (home_team, away_team, prize_amount, winner_count, deadline_display, contact_username) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (home_team, away_team, prize_amount, winner_count, deadline_display, contact_username),
        )
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()


def set_bet_message(bet_id: int, message_id: int, channel_id) -> None:
    conn = _conn()
    try:
        conn.execute(
            "UPDATE bets SET message_id=?, channel_id=? WHERE id=?",
            (message_id, str(channel_id), bet_id),
        )
        conn.commit()
    finally:
        conn.close()


def get_bet(bet_id: int) -> Optional[dict]:
    conn = _conn()
    try:
        row = conn.execute("SELECT * FROM bets WHERE id=?", (bet_id,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def upsert_entry(
    bet_id: int,
    user_id: int,
    username: Optional[str],
    first_name: str,
    choice: str,
) -> str:
    conn = _conn()
    try:
        existing = conn.execute(
            "SELECT id FROM bet_entries WHERE bet_id=? AND user_id=?",
            (bet_id, user_id),
        ).fetchone()
        conn.execute(
            """INSERT INTO bet_entries (bet_id, user_id, username, first_name, choice)
               VALUES (?, ?, ?, ?, ?)
               ON CONFLICT(bet_id, user_id) DO UPDATE SET
                   choice=excluded.choice,
                   username=excluded.username,
                   first_name=excluded.first_name,
                   created_at=datetime('now')""",
            (bet_id, user_id, username, first_name, choice),
        )
        conn.commit()
        return "updated" if existing else "inserted"
    finally:
        conn.close()


def get_entry_counts(bet_id: int) -> dict:
    conn = _conn()
    try:
        rows = conn.execute(
            "SELECT choice, COUNT(*) as cnt FROM bet_entries WHERE bet_id=? GROUP BY choice",
            (bet_id,),
        ).fetchall()
        counts = {"home": 0, "draw": 0, "away": 0}
        for row in rows:
            if row["choice"] in counts:
                counts[row["choice"]] = row["cnt"]
        counts["total"] = sum(counts.values())
        return counts
    finally:
        conn.close()


def close_bet(bet_id: int) -> bool:
    conn = _conn()
    try:
        cur = conn.execute(
            "UPDATE bets SET status='closed' WHERE id=? AND status='open'",
            (bet_id,),
        )
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()


def set_result(bet_id: int, result: str) -> bool:
    conn = _conn()
    try:
        cur = conn.execute(
            "UPDATE bets SET status='resulted', result=? WHERE id=? AND status='closed'",
            (result, bet_id),
        )
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()


def get_correct_entries(bet_id: int, result: str) -> list[dict]:
    conn = _conn()
    try:
        rows = conn.execute(
            "SELECT * FROM bet_entries WHERE bet_id=? AND choice=?",
            (bet_id, result),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def draw_winners(bet_id: int, result: str, winner_count: int) -> tuple[list[dict], list[dict]]:
    all_correct = get_correct_entries(bet_id, result)
    k = min(winner_count, len(all_correct))
    winners = random.sample(all_correct, k) if k > 0 else []
    return winners, all_correct
