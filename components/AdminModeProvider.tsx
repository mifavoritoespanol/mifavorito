"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

type AdminMode = { isAdmin: boolean; accessToken: string | null };
const AdminModeContext = createContext<AdminMode>({ isAdmin: false, accessToken: null });

export function useAdminMode() {
  return useContext(AdminModeContext);
}

export default function AdminModeProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authorizedToken, setAuthorizedToken] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (alive) setAccessToken(data.session?.access_token ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccessToken(session?.access_token ?? null);
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    let alive = true;
    void fetch("/api/admin/check", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }).then(async (response) => {
      const result = await response.json();
      if (alive) setAuthorizedToken(response.ok && result.isAdmin === true ? accessToken : null);
    }).catch(() => {
      if (alive) setAuthorizedToken(null);
    });
    return () => { alive = false; };
  }, [accessToken]);

  const isAdmin = Boolean(accessToken && authorizedToken === accessToken);
  const value = useMemo(() => ({ isAdmin, accessToken }), [isAdmin, accessToken]);
  return <AdminModeContext.Provider value={value}>{children}</AdminModeContext.Provider>;
}
