import asyncio
import logging
from enum import IntEnum
from functools import wraps

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.constants import ParseMode
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ConversationHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

import database as db
from config import BOT_TOKEN, CHANNEL_ID, is_admin

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


class S(IntEnum):
    HOME_TEAM = 0
    AWAY_TEAM = 1
    PRIZE     = 2
    WINNERS   = 3
    DEADLINE  = 4
    CONTACT   = 5
    CONFIRM   = 6


CHOICE_LABELS = {
    "home": "🏠 홈 승",
    "draw": "⚖️ 무승부",
    "away": "✈️ 원정 승",
}


# ── 관리자 전용 데코레이터 ───────────────────────────────────────────────────────

def admin_only(func):
    @wraps(func)
    async def wrapper(update: Update, context: ContextTypes.DEFAULT_TYPE):
        user = update.effective_user
        if not user or not is_admin(user.id):
            await update.effective_message.reply_text("⛔ 관리자 전용 명령어입니다.")
            return ConversationHandler.END
        if update.effective_chat.type != "private":
            await update.effective_message.reply_text("⛔ 개인 채팅에서만 사용 가능합니다.")
            return ConversationHandler.END
        return await func(update, context)
    return wrapper


# ── 메시지 빌더 ─────────────────────────────────────────────────────────────────

def _card_text(d: dict) -> str:
    contact = f"\n⭐ 당첨자 문의 : <b>@{d['contact']}</b>" if d.get("contact") else ""
    return (
        f"🏠 <b>홈</b> : <b>{d['home']}</b>\n"
        f"<i>vs</i>\n"
        f"✈️ <b>원정</b> : <b>{d['away']}</b>\n\n"
        f"<blockquote>"
        f"🔥 <b>결과 적중자 랜덤 {d['winners']}명 선발</b> 🔥\n"
        f"🚀 포인트 <b>{d['prize']}</b> 지급 !\n"
        f"✅ 베팅은 <i>마감 전까지</i> 가능 !\n"
        f"⏰ 마감 : <b>{d['deadline']}</b>\n"
        f"🔵 경기 종료 후 <b>당첨자 채널에 공지</b> !"
        f"</blockquote>"
        f"{contact}\n\n"
        f"👇 아래 버튼으로 베팅에 참여하세요."
    )


def _keyboard(bet_id: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([[
        InlineKeyboardButton(label, callback_data=f"vote:{bet_id}:{choice}")
        for choice, label in CHOICE_LABELS.items()
    ]])


def _close_text(bet: dict, counts: dict) -> str:
    return (
        f"🚫 <b>베팅이 마감되었습니다.</b>\n\n"
        f"<blockquote>"
        f"📊 현재 참가 현황\n"
        f"🏠 홈 : <b>{counts['home']}명</b>\n"
        f"⚖️ 무승부 : <b>{counts['draw']}명</b>\n"
        f"✈️ 원정 : <b>{counts['away']}명</b>"
        f"</blockquote>\n\n"
        f"합계 : <b>{counts['total']}명</b>"
    )


def _winner_text(bet: dict, result: str, winners: list, all_correct: list) -> str:
    label = CHOICE_LABELS[result]
    contact = f"\n당첨자 문의 : <b>@{bet['contact_username']}</b>" if bet["contact_username"] else ""

    header = (
        f"🎊 <b>당첨자 발표 !</b>\n"
        f"<i>({bet['home_team']}) VS ({bet['away_team']})</i>\n\n"
    )

    if not all_correct:
        body = (
            f"<blockquote>"
            f"경기 결과: <b>{label} !!</b>\n\n"
            f"😔 아쉽게도 적중자가 없습니다.\n"
            f"다음 기회를 노려보세요!"
            f"</blockquote>"
        )
    else:
        winner_lines = []
        for i, w in enumerate(winners, 1):
            uname = f"@{w['username']}" if w["username"] else f"<b>{w['first_name']}</b>"
            winner_lines.append(f"{i}. {uname} : <b>{bet['prize_amount']}</b>")

        body = (
            f"<blockquote>"
            f"경기 결과: <b>{label} !!</b>\n"
            f"당첨자 : <b>{len(winners)}명</b>\n\n"
            + "\n".join(winner_lines)
            + f"</blockquote>"
        )

    return header + body + contact


# ── /newbet 대화 핸들러 ─────────────────────────────────────────────────────────

@admin_only
async def newbet_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data["draft"] = {}
    await update.message.reply_text(
        "📝 <b>새 베팅 만들기</b>\n\n"
        "🏠 홈 팀 이름을 입력하세요:\n"
        "<i>(취소: /cancel)</i>",
        parse_mode=ParseMode.HTML,
    )
    return S.HOME_TEAM


async def got_home(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data["draft"]["home"] = update.message.text.strip()
    await update.message.reply_text("✈️ 원정 팀 이름을 입력하세요:")
    return S.AWAY_TEAM


async def got_away(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data["draft"]["away"] = update.message.text.strip()
    await update.message.reply_text(
        "💰 상금 금액을 입력하세요:\n"
        "<i>(예: 50,000원)</i>",
        parse_mode=ParseMode.HTML,
    )
    return S.PRIZE


async def got_prize(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data["draft"]["prize"] = update.message.text.strip()
    await update.message.reply_text("🎯 당첨자 수를 입력하세요 <i>(숫자)</i>:", parse_mode=ParseMode.HTML)
    return S.WINNERS


async def got_winners(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    text = update.message.text.strip()
    if not text.isdigit() or int(text) < 1:
        await update.message.reply_text("⚠️ 1 이상의 숫자를 입력하세요:")
        return S.WINNERS
    context.user_data["draft"]["winners"] = int(text)
    await update.message.reply_text(
        "⏰ 마감 시간을 입력하세요:\n"
        "<i>(예: 경기 시작 10분 전 / 2026-05-10 19:50)</i>",
        parse_mode=ParseMode.HTML,
    )
    return S.DEADLINE


async def got_deadline(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data["draft"]["deadline"] = update.message.text.strip()
    await update.message.reply_text(
        "⭐ 담당자 @아이디를 입력하세요:\n"
        "<i>(없으면 /skip)</i>",
        parse_mode=ParseMode.HTML,
    )
    return S.CONTACT


async def got_contact(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data["draft"]["contact"] = update.message.text.strip().lstrip("@")
    return await _show_confirm(update, context)


async def skip_contact(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data["draft"]["contact"] = None
    return await _show_confirm(update, context)


async def _show_confirm(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    d = context.user_data["draft"]
    contact_display = f"@{d['contact']}" if d.get("contact") else "없음"
    await update.effective_message.reply_text(
        f"📋 <b>베팅 확인</b>\n\n"
        f"🏠 홈 팀: <b>{d['home']}</b>\n"
        f"✈️ 원정 팀: <b>{d['away']}</b>\n"
        f"💰 상금: <b>{d['prize']}</b>\n"
        f"🎯 당첨자: <b>{d['winners']}명</b>\n"
        f"⏰ 마감: <b>{d['deadline']}</b>\n"
        f"⭐ 담당자: <b>{contact_display}</b>\n\n"
        f"채널에 게시할까요?\n"
        f"<b>예</b> 또는 <b>아니오</b>를 입력하세요.",
        parse_mode=ParseMode.HTML,
    )
    return S.CONFIRM


async def got_confirm(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    text = update.message.text.strip().lower()
    if text in ("예", "ㅇ", "y", "yes", "네", "확인"):
        return await _do_post(update, context)
    if text in ("아니오", "ㄴ", "n", "no", "취소"):
        context.user_data.pop("draft", None)
        await update.message.reply_text("❌ 베팅 생성이 취소되었습니다.")
        return ConversationHandler.END
    await update.message.reply_text("<b>예</b> 또는 <b>아니오</b>를 입력해주세요.", parse_mode=ParseMode.HTML)
    return S.CONFIRM


async def _do_post(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    d = context.user_data["draft"]
    bet_id = await asyncio.to_thread(
        db.create_bet,
        d["home"], d["away"], d["prize"], d["winners"], d["deadline"], d.get("contact"),
    )
    msg = await context.bot.send_message(
        chat_id=CHANNEL_ID,
        text=_card_text(d),
        reply_markup=_keyboard(bet_id),
        parse_mode=ParseMode.HTML,
    )
    await asyncio.to_thread(db.set_bet_message, bet_id, msg.message_id, msg.chat_id)
    await update.message.reply_text(
        f"✅ 베팅 <b>#{bet_id}</b>이 채널에 게시되었습니다!",
        parse_mode=ParseMode.HTML,
    )
    context.user_data.pop("draft", None)
    return ConversationHandler.END


async def newbet_cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data.pop("draft", None)
    await update.effective_message.reply_text("❌ 베팅 생성이 취소되었습니다.")
    return ConversationHandler.END


# ── /close 명령어 ───────────────────────────────────────────────────────────────

@admin_only
async def close_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not context.args:
        await update.message.reply_text("사용법: /close <베팅 ID>")
        return
    try:
        bet_id = int(context.args[0])
    except ValueError:
        await update.message.reply_text("⚠️ 유효한 숫자 ID를 입력하세요.")
        return

    bet = await asyncio.to_thread(db.get_bet, bet_id)
    if not bet:
        await update.message.reply_text(f"⚠️ 베팅 #{bet_id}을 찾을 수 없습니다.")
        return
    if bet["status"] != "open":
        status_kor = {"closed": "이미 마감", "resulted": "이미 종료"}
        await update.message.reply_text(f"⚠️ 베팅 #{bet_id}은 {status_kor.get(bet['status'], bet['status'])}되었습니다.")
        return

    closed = await asyncio.to_thread(db.close_bet, bet_id)
    if not closed:
        await update.message.reply_text("⚠️ 마감 처리에 실패했습니다.")
        return

    counts = await asyncio.to_thread(db.get_entry_counts, bet_id)

    if bet["message_id"] and bet["channel_id"]:
        try:
            await context.bot.edit_message_reply_markup(
                chat_id=bet["channel_id"],
                message_id=bet["message_id"],
                reply_markup=None,
            )
        except Exception as e:
            logger.warning(f"키보드 제거 실패 (bet #{bet_id}): {e}")

    await context.bot.send_message(
        chat_id=CHANNEL_ID,
        text=_close_text(bet, counts),
        parse_mode=ParseMode.HTML,
    )
    await update.message.reply_text(f"✅ 베팅 #{bet_id} 마감 완료!")


# ── /result 명령어 ──────────────────────────────────────────────────────────────

@admin_only
async def result_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if len(context.args) < 2:
        await update.message.reply_text(
            "사용법: /result &lt;베팅 ID&gt; &lt;home|draw|away&gt;\n"
            "예: /result 1 home",
            parse_mode=ParseMode.HTML,
        )
        return
    try:
        bet_id = int(context.args[0])
    except ValueError:
        await update.message.reply_text("⚠️ 유효한 숫자 ID를 입력하세요.")
        return

    result = context.args[1].lower()
    if result not in ("home", "draw", "away"):
        await update.message.reply_text("⚠️ 결과는 <b>home</b>, <b>draw</b>, <b>away</b> 중 하나여야 합니다.", parse_mode=ParseMode.HTML)
        return

    bet = await asyncio.to_thread(db.get_bet, bet_id)
    if not bet:
        await update.message.reply_text(f"⚠️ 베팅 #{bet_id}을 찾을 수 없습니다.")
        return
    if bet["status"] == "open":
        await update.message.reply_text(f"⚠️ 먼저 마감해주세요: /close {bet_id}")
        return
    if bet["status"] == "resulted":
        await update.message.reply_text(f"⚠️ 베팅 #{bet_id}은 이미 결과가 처리되었습니다.")
        return

    ok = await asyncio.to_thread(db.set_result, bet_id, result)
    if not ok:
        await update.message.reply_text("⚠️ 결과 처리에 실패했습니다.")
        return

    winners, all_correct = await asyncio.to_thread(db.draw_winners, bet_id, result, bet["winner_count"])

    await context.bot.send_message(
        chat_id=CHANNEL_ID,
        text=_winner_text(bet, result, winners, all_correct),
        parse_mode=ParseMode.HTML,
    )
    await update.message.reply_text(
        f"✅ 베팅 #{bet_id} 결과 발표 완료!\n"
        f"정답자: {len(all_correct)}명 중 {len(winners)}명 당첨"
    )


# ── /status 명령어 ──────────────────────────────────────────────────────────────

@admin_only
async def status_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not context.args:
        await update.message.reply_text("사용법: /status <베팅 ID>")
        return
    try:
        bet_id = int(context.args[0])
    except ValueError:
        await update.message.reply_text("⚠️ 유효한 숫자 ID를 입력하세요.")
        return

    bet = await asyncio.to_thread(db.get_bet, bet_id)
    if not bet:
        await update.message.reply_text(f"⚠️ 베팅 #{bet_id}을 찾을 수 없습니다.")
        return

    counts = await asyncio.to_thread(db.get_entry_counts, bet_id)
    status_emoji = {"open": "🟢 진행중", "closed": "🔴 마감됨", "resulted": "✅ 종료됨"}
    result_text = ""
    if bet["result"]:
        result_text = f"\n결과: <b>{CHOICE_LABELS.get(bet['result'], bet['result'])}</b>"

    await update.message.reply_text(
        f"📊 <b>베팅 #{bet_id} 현황</b>\n\n"
        f"상태: {status_emoji.get(bet['status'], bet['status'])}\n"
        f"🏠 <b>{bet['home_team']}</b> vs ✈️ <b>{bet['away_team']}</b>\n"
        f"<blockquote>"
        f"🏠 홈 : {counts['home']}명\n"
        f"⚖️ 무승부 : {counts['draw']}명\n"
        f"✈️ 원정 : {counts['away']}명\n"
        f"합계 : {counts['total']}명"
        f"</blockquote>"
        f"{result_text}",
        parse_mode=ParseMode.HTML,
    )


# ── 투표 콜백 ───────────────────────────────────────────────────────────────────

async def vote_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    _, bet_id_str, choice = query.data.split(":")
    bet_id = int(bet_id_str)
    user = query.from_user

    bet = await asyncio.to_thread(db.get_bet, bet_id)
    if not bet or bet["status"] != "open":
        await query.answer("⏰ 이 베팅은 이미 마감되었습니다.", show_alert=True)
        return

    first_name = user.first_name or str(user.id)
    action = await asyncio.to_thread(
        db.upsert_entry,
        bet_id, user.id, user.username, first_name, choice,
    )

    label = CHOICE_LABELS[choice]
    if action == "inserted":
        msg = f"✅ {label}에 베팅했습니다!"
    else:
        msg = f"🔄 베팅이 {label}(으)로 변경되었습니다."

    await query.answer(msg, show_alert=True)


# ── 에러 핸들러 ────────────────────────────────────────────────────────────────

async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    logger.error("Update caused error:", exc_info=context.error)


# ── 진입점 ─────────────────────────────────────────────────────────────────────

def main() -> None:
    db.init_db()

    app = Application.builder().token(BOT_TOKEN).build()

    newbet_conv = ConversationHandler(
        entry_points=[CommandHandler("newbet", newbet_start)],
        states={
            S.HOME_TEAM: [MessageHandler(filters.TEXT & ~filters.COMMAND, got_home)],
            S.AWAY_TEAM: [MessageHandler(filters.TEXT & ~filters.COMMAND, got_away)],
            S.PRIZE:     [MessageHandler(filters.TEXT & ~filters.COMMAND, got_prize)],
            S.WINNERS:   [MessageHandler(filters.TEXT & ~filters.COMMAND, got_winners)],
            S.DEADLINE:  [MessageHandler(filters.TEXT & ~filters.COMMAND, got_deadline)],
            S.CONTACT: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, got_contact),
                CommandHandler("skip", skip_contact),
            ],
            S.CONFIRM: [MessageHandler(filters.TEXT & ~filters.COMMAND, got_confirm)],
        },
        fallbacks=[CommandHandler("cancel", newbet_cancel)],
        conversation_timeout=600,
    )

    app.add_handler(newbet_conv)
    app.add_handler(CommandHandler("close", close_cmd))
    app.add_handler(CommandHandler("result", result_cmd))
    app.add_handler(CommandHandler("status", status_cmd))
    app.add_handler(CallbackQueryHandler(vote_callback, pattern=r"^vote:\d+:(home|draw|away)$"))
    app.add_error_handler(error_handler)

    logger.info("봇 시작...")
    app.run_polling(allowed_updates=["message", "callback_query"])


if __name__ == "__main__":
    main()
