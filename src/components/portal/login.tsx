import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const field = "mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40";

export function PortalLogin() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    if (!email || !password) return setError("Enter your email and password.");
    setBusy(true); setError(null);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError("Incorrect email or password.");
    } catch {
      setError("Sign-in is not available right now. Please try again later.");
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto max-w-md border border-border bg-card/70 p-8" aria-busy={busy}>
      <h2 className="font-display text-2xl font-black uppercase">Client login</h2>
      <p className="mt-2 text-sm text-muted-foreground">This area is for existing Lahza clients. Accounts are created by our team.</p>
      <label htmlFor="email" className="mt-6 block text-sm font-semibold">Email</label>
      <input id="email" name="email" type="email" autoComplete="email" required className={field} />
      <label htmlFor="password" className="mt-4 block text-sm font-semibold">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required className={field} />
      {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      <button type="submit" disabled={busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-60">
        {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}{busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
