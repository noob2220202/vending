"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const NAMES = ["김**", "이**", "박**", "최**", "정**", "강**", "조**", "윤**"];
const ACTIONS = [
  "텔레그램 멤버 500개 구매",
  "조회수 10,000개 구매",
  "리액션 1,000개 구매",
  "2021년 연식채널 구매",
  "프리미엄 부스트 구매",
  "텔레그램 멤버 2,000개 구매",
  "조회수 50,000개 구매",
];

function randomMessage() {
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  return `${name}님이 ${action}했습니다`;
}

export function SocialProofToast() {
  const [msg, setMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    function cycle() {
      setMsg(randomMessage());
      hideTimer = setTimeout(() => setMsg(null), 5000);
      // Next appearance 5–10s after this one hides.
      showTimer = setTimeout(cycle, 5000 + 5000 + Math.random() * 5000);
    }

    showTimer = setTimeout(cycle, 3000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-24 left-4 z-30">
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="glass flex items-center gap-2 rounded-xl px-3 py-2 text-xs shadow-lg"
          >
            <TrendingUp className="h-4 w-4 text-success" />
            <span>{msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
