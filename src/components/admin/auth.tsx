import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createFirstAdmin, getSetupStatus } from "@/lib/admin.functions";
import { btnPrimary, errMsg, inputCls, TextField } from "./ui";

function Shell({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md border border-border bg-card/70 p-8">
      <h2 className="font-display text-2xl font-black uppercase">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      {children}
    </div>
  );
}

export function AdminLogin() {
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
    } catch { setError("Sign-in is not available right now. Please try again later."); } finally { setBusy(false); }
  }
  return (
    <Shell title="Admin sign in" text="Restricted to Lahza administrators.">
      <form onSubmit={onSubmit} noValidate aria-busy={busy} className="mt-6 space-y-4">
        <div><label htmlFor="a-email" className="text-sm font-semibold">Email</label><input id="a-email" name="email" type="email" autoComplete="email" required className={`${inputCls} mt-2`} /></div>
        <div><label htmlFor="a-pass" className="text-sm font-semibold">Password</label><input id="a-pass" name="password" type="password" autoComplete="current-password" required className={`${inputCls} mt-2`} /></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full py-3`}>{busy && <Loader2 className="size-4 animate-spin" aria-hidden />}{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </Shell>
  );
}

/** Shown only while the project has no administrator yet. */
export function AdminSetup({ keyRequired }: { keyRequired: boolean }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ fullName: "", email: "", password: "", setupKey: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (f.password.length < 8) return setError("Password must be at least 8 characters.");
    setBusy(true); setError(null);
    try {
      await createFirstAdmin({ data: { email: f.email, password: f.password, fullName: f.fullName, ...(f.setupKey ? { setupKey: f.setupKey } : {}) } });
      const { error: err } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
      if (err) setError("Account created. Please sign in.");
      await qc.invalidateQueries({ queryKey: ["admin-setup"] });
    } catch (x) { setError(errMsg(x)); } finally { setBusy(false); }
  }
  return (
    <Shell title="Create the owner account" text="No administrator exists yet. This one-time step creates the first admin; after it, this screen disappears.">
      <form onSubmit={onSubmit} aria-busy={busy} className="mt-6 space-y-4">
        <TextField label="Full name" value={f.fullName} onChange={set("fullName")} />
        <TextField label="Email" type="email" value={f.email} onChange={set("email")} required />
        <TextField label="Password" type="password" value={f.password} onChange={set("password")} hint="At least 8 characters." required />
        {keyRequired && <TextField label="Setup key" type="password" value={f.setupKey} onChange={set("setupKey")} hint="The ADMIN_SETUP_KEY configured on the server." required />}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full py-3`}>{busy && <Loader2 className="size-4 animate-spin" aria-hidden />}{busy ? "Creating…" : "Create admin account"}</button>
      </form>
    </Shell>
  );
}

/** Decides between first-run setup and normal sign-in. */
export function SignedOutGate() {
  const q = useQuery({ queryKey: ["admin-setup"], queryFn: () => getSetupStatus(), retry: false, staleTime: 0 });
  if (q.isLoading) return <div role="status" className="flex items-center justify-center gap-2 py-16 text-muted-foreground"><Loader2 className="size-5 animate-spin" aria-hidden />Loading…</div>;
  if (q.data?.needsSetup) return <AdminSetup keyRequired={q.data.keyRequired} />;
  return <AdminLogin />;
}
