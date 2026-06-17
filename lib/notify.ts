import { config } from "./config";

/**
 * Send an admin notification to Telegram. No-ops (logs) when the bot token or
 * chat id is not configured, so it is safe to call in any environment.
 */
export async function notifyAdmin(text: string): Promise<void> {
  const { adminNotifyBotToken, adminNotifyChatId } = config.telegram;
  if (!adminNotifyBotToken || !adminNotifyChatId) {
    console.log("[notifyAdmin]", text);
    return;
  }
  try {
    await fetch(
      `https://api.telegram.org/bot${adminNotifyBotToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: adminNotifyChatId,
          text,
          parse_mode: "HTML",
        }),
      }
    );
  } catch (err) {
    console.error("[notifyAdmin] failed", err);
  }
}
