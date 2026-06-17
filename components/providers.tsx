"use client";

import * as React from "react";
import type { SessionUser } from "@/lib/types";

interface SessionContextValue {
  user: SessionUser | null;
  setUser: (u: SessionUser | null) => void;
  refresh: () => Promise<void>;
}

const SessionContext = React.createContext<SessionContextValue | null>(null);

export function Providers({
  initialUser,
  children,
}: {
  initialUser: SessionUser | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = React.useState<SessionUser | null>(initialUser);

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user ?? null);
      } else {
        setUser(null);
      }
    } catch {
      // network hiccup: keep current state
    }
  }, []);

  return (
    <SessionContext.Provider value={{ user, setUser, refresh }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within <Providers>");
  return ctx;
}
