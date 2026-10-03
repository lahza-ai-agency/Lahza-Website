import { useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { btnGhost, btnPrimary, Card, errMsg, TextField } from "./ui";

export function Account({ session }: { session: Session }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return toast.error("Password must be at least 8 characters.");
    if (pw !== pw2) return toast.error("The two passwords don't match.");
    setBusy(true);
    try { const { error } = await supabase.auth.updateUser({ password: pw }); if (error) throw new Error(error.message); toast.success("Password changed"); setPw(""); setPw2(""); }
    catch (x) { toast.error(errMsg(x)); } finally { setBusy(false); }
  }
  return (
    <div className="max-w-xl space-y-5">
      <Card title="Your account"><p className="text-sm text-muted-foreground">Signed in as <span className="text-foreground">{session.user.email}</span></p><button type="button" onClick={() => void supabase.auth.signOut()} className={`${btnGhost} mt-4`}>Sign out</button></Card>
      <Card title="Change password">
        <form onSubmit={submit} className="space-y-4" aria-busy={busy}>
          <TextField label="New password" type="password" value={pw} onChange={setPw} hint="At least 8 characters." />
          <TextField label="Repeat new password" type="password" value={pw2} onChange={setPw2} />
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? "Saving…" : "Update password"}</button>
        </form>
      </Card>
    </div>
  );
}
