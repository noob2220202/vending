"use client";

import * as React from "react";

declare global {
  interface Window {
    onTelegramAuth?: (user: Record<string, unknown>) => void;
  }
}

/**
 * Renders the official Telegram Login Widget when NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
 * is configured. The widget calls window.onTelegramAuth with the signed payload,
 * which we forward to the server for HMAC verification.
 */
export function TelegramLoginButton({
  onAuth,
}: {
  onAuth: (payload: Record<string, unknown>) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  React.useEffect(() => {
    window.onTelegramAuth = (user) => onAuth(user);
    return () => {
      delete window.onTelegramAuth;
    };
  }, [onAuth]);

  React.useEffect(() => {
    if (!botUsername || !ref.current) return;
    const el = ref.current;
    el.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    el.appendChild(script);
  }, [botUsername]);

  if (!botUsername) {
    return (
      <button
        type="button"
        disabled
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#229ED9]/40 text-sm font-medium text-white/70"
        title="TELEGRAM_LOGIN_BOT 환경변수 설정이 필요합니다"
      >
        텔레그램으로 로그인 (설정 필요)
      </button>
    );
  }

  return <div ref={ref} className="flex justify-center" />;
}
