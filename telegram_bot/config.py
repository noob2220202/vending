import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN: str = os.environ.get("TELEGRAM_BOT_TOKEN", "your_bot_token_here")
CHANNEL_ID: str = os.environ.get("TELEGRAM_CHANNEL_ID", "@your_channel")
DB_PATH: str = os.environ.get("DB_PATH", "betting.db")

_raw = os.environ.get("ADMIN_IDS", "")
ADMIN_IDS: set[int] = {int(x.strip()) for x in _raw.split(",") if x.strip()}


def is_admin(user_id: int) -> bool:
    return user_id in ADMIN_IDS
