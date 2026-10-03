import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useIsAdmin } from "@/lib/use-admin";

async function load<T>(p: PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const { data, error } = await p;
  if (error) throw new Error("load failed");
  return data ?? [];
}

const queries = {
  profile: async (id: string) => (await supabase.from("profiles").select("full_name, company").eq("id", id).maybeSingle()).data,
  projects: () => load<Tables<"projects">>(supabase.from("projects").select("*").order("created_at", { ascending: false })),
  approvals: () => load<Tables<"approvals">>(supabase.from("approvals").select("*").order("created_at", { ascending: false })),
  invoices: () => load<Tables<"invoices">>(supabase.from("invoices").select("*").order("created_at", { ascending: false })),
  reports: () => load<Tables<"reports">>(supabase.from("reports").select("*").order("created_at", { ascending: false })),
  tasks: () => load<Tables<"tasks">>(supabase.from("tasks").select("*").order("created_at", { ascending: false })),
  campaigns: () => load<Tables<"campaigns">>(supabase.from("campaigns").select("*").order("created_at", { ascending: false })),
  files: () => load<Tables<"files">>(supabase.from("files").select("*").order("created_at", { ascending: false })),
  tickets: () => load<Tables<"tickets">>(supabase.from("tickets").select("*").order("created_at", { ascending: false })),
  messages: () => load<Tables<"messages">>(supabase.from("messages").select("*").order("created_at", { ascending: true })),
};

const field = "w-full border border-input bg-background p-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40";

function NewTicket({ uid }: { uid: string }) {
  const qc = useQueryClient();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const m = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("tickets").insert({ client_id: uid, subject: subject.trim(), body: body.trim() || null }); if (error) throw new Error("insert failed"); },
    onSuccess: () => { setSubject(""); setBody(""); return qc.invalidateQueries({ queryKey: ["portal", "tickets"] }); },
  });
  const submit = (e: FormEvent) => { e.preventDefault(); if (subject.trim()) m.mutate(); };
  return (
    <form onSubmit={submit} className="mt-4 space-y-2 border-t border-border pt-4">
      <label htmlFor="t-subject" className="sr-only">Subject</label>
      <input id="t-subject" value={subject} maxLength={200} onChange={(e) => setSubject(e.target.value)} placeholder="New request — subject" className={field} />
      <label htmlFor="t-body" className="sr-only">Details</label>
      <textarea id="t-body" rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Details (optional)" className={field} />
      <button type="submit" disabled={m.isPending || !subject.trim()} className="rounded-full bg-primary px-5 py-2 text-xs font-bold uppercase text-primary-foreground disabled:opacity-60">{m.isPending ? "Sending…" : "Open request"}</button>
      {m.isError && <p role="alert" className="text-xs text-destructive">Couldn't send your request. Please try again.</p>}
    </form>
  );
}

function Chat({ uid, rows }: { uid: string; rows: Tables<"messages">[] }) {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const m = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("messages").insert({ client_id: uid, sender_id: uid, body: body.trim() }); if (error) throw new Error("insert failed"); },
    onSuccess: () => { setBody(""); return qc.invalidateQueries({ queryKey: ["portal", "messages"] }); },
  });
  return (
    <div>
      {rows.length > 0 && <ul className="max-h-72 space-y-2 overflow-y-auto">{rows.map((r) => <li key={r.id} className={`max-w-[88%] border p-2 text-sm ${r.sender_id === uid ? "ml-auto border-primary/40 bg-primary/10" : "border-border"}`}><span className="eyebrow block text-muted-foreground">{r.sender_id === uid ? "You" : "Lahza team"}</span><p className="whitespace-pre-wrap break-words">{r.body}</p></li>)}</ul>}
      <form onSubmit={(e) => { e.preventDefault(); if (body.trim()) m.mutate(); }} className="mt-3 flex gap-2">
        <label htmlFor="msg" className="sr-only">Message</label>
        <textarea id="msg" rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message to the team…" className={field} />
        <button type="submit" disabled={m.isPending || !body.trim()} className="self-end rounded-full bg-primary px-5 py-2 text-xs font-bold uppercase text-primary-foreground disabled:opacity-60">Send</button>
      </form>
      {m.isError && <p role="alert" className="mt-1 text-xs text-destructive">Couldn't send your message. Please try again.</p>}
    </div>
  );
}

function Panel<T>({ title, q, empty, children }: { title: string; q: { isLoading: boolean; isError: boolean; data: T[] | undefined; refetch: () => unknown }; empty: string; children: (rows: T[]) => ReactNode }) {
  return (
    <section className="border border-border bg-card/70 p-6" aria-labelledby={`h-${title}`}>
      <h2 id={`h-${title}`} className="font-display text-lg font-black uppercase">{title}</h2>
      <div className="mt-4">
        {q.isLoading ? <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" aria-hidden />Loading…</div>
          : q.isError ? <p role="alert" className="text-sm text-muted-foreground">We couldn't load this section. <button type="button" onClick={() => q.refetch()} className="text-primary underline">Try again</button></p>
          : !q.data?.length ? <p className="text-sm text-muted-foreground">{empty}</p>
          : children(q.data)}
      </div>
    </section>
  );
}

function Approval({ a }: { a: Tables<"approvals"> }) {
  const qc = useQueryClient();
  const [feedback, setFeedback] = useState("");
  const m = useMutation({
    mutationFn: async (status: "approved" | "changes") => {
      const { error } = await supabase.from("approvals").update({ status, feedback: feedback.trim() || null }).eq("id", a.id);
      if (error) throw new Error("update failed");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portal", "approvals"] }),
  });
  return (
    <li className="border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{a.title}</h3><span className="eyebrow text-primary">{a.status}</span></div>
      {a.details && <p className="mt-1 text-sm text-muted-foreground">{a.details}</p>}
      {a.link && /^https?:\/\//.test(a.link) && <a href={a.link} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-primary underline">Open material</a>}
      {a.status === "pending" && (
        <div className="mt-3 space-y-2">
          <label htmlFor={`fb-${a.id}`} className="sr-only">Feedback</label>
          <textarea id={`fb-${a.id}`} value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={2} placeholder="Optional feedback" className="w-full border border-input bg-background p-2 text-sm" />
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={m.isPending} onClick={() => m.mutate("approved")} className="rounded-full bg-primary px-5 py-2 text-xs font-bold uppercase text-primary-foreground disabled:opacity-60">Approve</button>
            <button type="button" disabled={m.isPending} onClick={() => m.mutate("changes")} className="rounded-full border border-border px-5 py-2 text-xs font-bold uppercase hover:border-primary/60 disabled:opacity-60">Request changes</button>
          </div>
          {m.isError && <p role="alert" className="text-xs text-destructive">Couldn't save your response. Please try again.</p>}
        </div>
      )}
    </li>
  );
}

export function PortalDashboard({ session }: { session: Session }) {
  const uid = session.user.id;
  const profile = useQuery({ queryKey: ["portal", "profile", uid], queryFn: () => queries.profile(uid) });
  const projects = useQuery({ queryKey: ["portal", "projects"], queryFn: queries.projects });
  const approvals = useQuery({ queryKey: ["portal", "approvals"], queryFn: queries.approvals });
  const invoices = useQuery({ queryKey: ["portal", "invoices"], queryFn: queries.invoices });
  const reports = useQuery({ queryKey: ["portal", "reports"], queryFn: queries.reports });
  const tasks = useQuery({ queryKey: ["portal", "tasks"], queryFn: queries.tasks });
  const campaigns = useQuery({ queryKey: ["portal", "campaigns"], queryFn: queries.campaigns });
  const files = useQuery({ queryKey: ["portal", "files"], queryFn: queries.files });
  const tickets = useQuery({ queryKey: ["portal", "tickets"], queryFn: queries.tickets });
  const messages = useQuery({ queryKey: ["portal", "messages"], queryFn: queries.messages, refetchInterval: 20_000 });
  const isAdmin = useIsAdmin(uid);
  const [signingOut, setSigningOut] = useState(false);
  const name = profile.data?.full_name || profile.data?.company || session.user.email;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><div className="eyebrow text-primary">Welcome back</div><p className="mt-1 text-xl font-semibold">{name}</p></div>
        <div className="flex flex-wrap gap-2">
        {isAdmin.data && <Link to="/admin" className="rounded-full bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground">Admin dashboard</Link>}
        <button type="button" disabled={signingOut} onClick={async () => { setSigningOut(true); try { await supabase.auth.signOut(); } finally { setSigningOut(false); } }} className="rounded-full border border-border px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:border-primary/60 disabled:opacity-60">{signingOut ? "Signing out…" : "Log out"}</button>
        </div>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Panel title="Projects" q={projects} empty="No projects yet.">{(rows) => <ul className="space-y-3">{rows.map((p) => <li key={p.id}><div className="flex justify-between gap-2 text-sm"><span className="font-semibold">{p.name}</span><span className="text-muted-foreground">{p.status}</span></div><div className="mt-2 h-1.5 bg-secondary" role="progressbar" aria-label={`${p.name} progress`} aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100}><div className="h-full bg-primary" style={{ width: `${p.progress}%` }} /></div></li>)}</ul>}</Panel>
        <Panel title="Approvals" q={approvals} empty="Nothing waiting for your approval.">{(rows) => <ul className="space-y-3">{rows.map((a) => <Approval key={a.id} a={a} />)}</ul>}</Panel>
        <Panel title="Invoices" q={invoices} empty="No invoices yet.">{(rows) => <ul className="divide-y divide-border text-sm">{rows.map((i) => <li key={i.id} className="flex justify-between gap-2 py-2"><span>{i.number}</span><span className="text-muted-foreground">{i.amount} {i.currency} · {i.status}</span></li>)}</ul>}</Panel>
        <Panel title="Reports" q={reports} empty="No reports yet.">{(rows) => <ul className="divide-y divide-border text-sm">{rows.map((r) => <li key={r.id} className="py-2"><span className="font-semibold">{r.title}</span>{r.period && <span className="text-muted-foreground"> · {r.period}</span>}{r.summary && <p className="text-muted-foreground">{r.summary}</p>}{r.link && /^https?:\/\//.test(r.link) && <a href={r.link} target="_blank" rel="noreferrer" className="text-primary underline">Open</a>}</li>)}</ul>}</Panel>
        <Panel title="Tasks" q={tasks} empty="No tasks yet.">{(rows) => <ul className="divide-y divide-border text-sm">{rows.map((t) => <li key={t.id} className="flex justify-between gap-2 py-2"><span>{t.title}</span><span className="text-muted-foreground">{t.status}{t.due_date && ` · ${t.due_date}`}</span></li>)}</ul>}</Panel>
        <Panel title="Campaigns" q={campaigns} empty="No campaigns yet.">{(rows) => <ul className="divide-y divide-border text-sm">{rows.map((c) => <li key={c.id} className="flex justify-between gap-2 py-2"><span className="font-semibold">{c.name}{c.channel && <span className="font-normal text-muted-foreground"> · {c.channel}</span>}</span><span className="text-muted-foreground">{c.status}</span></li>)}</ul>}</Panel>
        <Panel title="Files" q={files} empty="No files shared yet.">{(rows) => <ul className="divide-y divide-border text-sm">{rows.map((f) => <li key={f.id} className="py-2">{/^https?:\/\//.test(f.url) ? <a href={f.url} target="_blank" rel="noreferrer" className="text-primary underline">{f.name}</a> : f.name}</li>)}</ul>}</Panel>
        <Panel title="Support" q={tickets} empty="No support requests yet.">{(rows) => <ul className="space-y-3 text-sm">{rows.map((t) => <li key={t.id} className="border border-border p-3"><div className="flex justify-between gap-2"><span className="font-semibold">{t.subject}</span><span className="eyebrow text-primary">{t.status}</span></div>{t.body && <p className="mt-1 text-muted-foreground">{t.body}</p>}{t.reply && <p className="mt-2 border-l-2 border-primary pl-3">{t.reply}</p>}</li>)}</ul>}</Panel>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="border border-border bg-card/70 p-6" aria-labelledby="h-new-request"><h2 id="h-new-request" className="font-display text-lg font-black uppercase">New support request</h2><NewTicket uid={uid} /></section>
        <section className="border border-border bg-card/70 p-6" aria-labelledby="h-messages"><h2 id="h-messages" className="font-display text-lg font-black uppercase">Messages</h2><div className="mt-4">{messages.isLoading ? <p role="status" className="text-sm text-muted-foreground">Loading…</p> : messages.isError ? <p role="alert" className="text-sm text-muted-foreground">We couldn't load your messages.</p> : <Chat uid={uid} rows={messages.data ?? []} />}</div></section>
      </div>
    </div>
  );
}
