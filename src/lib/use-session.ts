import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type SessionState = { status: "loading" } | { status: "unavailable" } | { status: "out" } | { status: "in"; session: Session };

/** Real Supabase auth state. Runs only in the browser; SSR renders the loading state. */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ status: "loading" });
  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      const { data } = supabase.auth.onAuthStateChange((_e, session) => setState(session ? { status: "in", session } : { status: "out" }));
      unsub = () => data.subscription.unsubscribe();
      supabase.auth.getSession().then(({ data: d }) => setState((s) => (s.status === "loading" ? (d.session ? { status: "in", session: d.session } : { status: "out" }) : s))).catch(() => setState({ status: "unavailable" }));
    } catch (e) {
      console.error("[auth] Supabase not configured", e);
      setState({ status: "unavailable" });
    }
    return () => unsub?.();
  }, []);
  return state;
}
