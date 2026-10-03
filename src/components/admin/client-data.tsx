import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Pencil, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { btnDanger, btnGhost, btnPrimary, Card, Empty, errMsg, ErrorBox, Field, fmtDate, inputCls, Modal, Spinner } from "./ui";
import { useUsers } from "./clients";
import { cn } from "@/lib/utils";

/* Loose typing on purpose: one generic CRUD UI drives nine different tables. RLS still enforces access. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tbl = (t: string): any => (supabase as unknown as { from: (t: string) => unknown }).from(t);
type Row = Record<string, unknown> & { id: string };

type FieldDef = { key: string; label: string; type: "text" | "textarea" | "number" | "date" | "url" | "select" | "project"; options?: string[]; required?: boolean; def?: string | number };
type Res = { id: string; label: string; fields: FieldDef[]; title: string; meta: string[]; empty: string };

const S = (key: string, options: string[], label = "Status"): FieldDef => ({ key, label, type: "select", options, def: options[0] as string });
export const RESOURCES: Res[] = [
  { id: "projects", label: "Projects", title: "name", meta: ["status", "progress", "due_date"], empty: "No projects for this client yet.", fields: [{ key: "name", label: "Name", type: "text", required: true }, { key: "description", label: "Description", type: "textarea" }, S("status", ["active", "paused", "completed"]), { key: "progress", label: "Progress (0-100)", type: "number", def: 0 }, { key: "due_date", label: "Due date", type: "date" }] },
  { id: "tasks", label: "Tasks", title: "title", meta: ["status", "due_date"], empty: "No tasks yet.", fields: [{ key: "title", label: "Title", type: "text", required: true }, { key: "project_id", label: "Project", type: "project" }, S("status", ["todo", "in_progress", "done"]), { key: "due_date", label: "Due date", type: "date" }] },
  { id: "approvals", label: "Approvals", title: "title", meta: ["status"], empty: "Nothing waiting for approval.", fields: [{ key: "title", label: "Title", type: "text", required: true }, { key: "details", label: "Details", type: "textarea" }, { key: "link", label: "Link to material (https://…)", type: "url" }, S("status", ["pending", "approved", "changes"]), { key: "feedback", label: "Client feedback", type: "textarea" }] },
  { id: "campaigns", label: "Campaigns", title: "name", meta: ["channel", "status", "budget", "start_date"], empty: "No campaigns yet.", fields: [{ key: "name", label: "Name", type: "text", required: true }, { key: "channel", label: "Channel", type: "text" }, S("status", ["planned", "active", "paused", "completed"]), { key: "budget", label: "Budget", type: "number" }, { key: "start_date", label: "Start date", type: "date" }] },
  { id: "reports", label: "Reports", title: "title", meta: ["period"], empty: "No reports yet.", fields: [{ key: "title", label: "Title", type: "text", required: true }, { key: "period", label: "Period", type: "text" }, { key: "summary", label: "Summary", type: "textarea" }, { key: "link", label: "Link (https://…)", type: "url" }] },
  { id: "files", label: "Files", title: "name", meta: ["url"], empty: "No files shared yet.", fields: [{ key: "name", label: "Name", type: "text", required: true }, { key: "url", label: "URL (https://…)", type: "url", required: true }] },
  { id: "invoices", label: "Invoices", title: "number", meta: ["amount", "currency", "status", "due_date"], empty: "No invoices yet.", fields: [{ key: "number", label: "Invoice number", type: "text", required: true }, { key: "amount", label: "Amount", type: "number", def: 0 }, { key: "currency", label: "Currency", type: "text", def: "EGP" }, S("status", ["unpaid", "paid", "overdue", "cancelled"]), { key: "due_date", label: "Due date", type: "date" }] },
  { id: "tickets", label: "Support", title: "subject", meta: ["status"], empty: "No support tickets.", fields: [{ key: "subject", label: "Subject", type: "text", required: true }, { key: "body", label: "Client message", type: "textarea" }, S("status", ["open", "in_progress", "closed"]), { key: "reply", label: "Your reply (visible to the client)", type: "textarea" }] },
];
const TABS = [...RESOURCES.map((r) => ({ id: r.id, label: r.label })), { id: "messages", label: "Messages" }];

export function ClientData({ clientId, resource, setSearch }: { clientId: string | undefined; resource: string; setSearch: (s: { client?: string; res?: string }) => void }) {
  const users = useUsers();
  const clients = (users.data ?? []).filter((u) => u.role === "client");
  const client = clients.find((c) => c.id === clientId);
  return (
    <div className="space-y-5">
      <Card title="Client data">
        {users.isLoading ? <Spinner /> : users.isError ? <ErrorBox error={users.error} retry={users.refetch} /> : !clients.length ? <Empty>No clients yet. <Link to="/admin" search={{ tab: "clients" }} className="text-primary underline">Create the first client</Link> to start adding projects, invoices and more.</Empty> : (
          <Field label="Client">{(id) => <select id={id} value={clientId ?? ""} onChange={(e) => setSearch({ ...(e.target.value ? { client: e.target.value } : {}), res: resource })} className={cn(inputCls, "max-w-md")}><option value="">Select a client…</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.fullName || c.email}{c.company && ` — ${c.company}`}</option>)}</select>}</Field>
        )}
      </Card>
      {client && (
        <>
          <div role="tablist" aria-label="Data type" className="flex flex-wrap gap-2">
            {TABS.map((t) => <button key={t.id} role="tab" aria-selected={resource === t.id} type="button" onClick={() => setSearch({ client: client.id, res: t.id })} className={cn("rounded-full border px-4 py-1.5 text-xs font-semibold", resource === t.id ? "border-primary/60 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>{t.label}</button>)}
          </div>
          {resource === "messages" ? <Messages key={client.id} clientId={client.id} /> : <Manager key={`${client.id}-${resource}`} clientId={client.id} res={RESOURCES.find((r) => r.id === resource) ?? (RESOURCES[0] as Res)} />}
        </>
      )}
    </div>
  );
}

const fmtCell = (k: string, v: unknown) => (k.endsWith("date") ? fmtDate(v as string) : k === "progress" ? `${v}%` : String(v));

function Manager({ clientId, res }: { clientId: string; res: Res }) {
  const qc = useQueryClient();
  const key = ["admin", "data", res.id, clientId];
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const q = useQuery({ queryKey: key, queryFn: async (): Promise<Row[]> => { const { data, error } = await tbl(res.id).select("*").eq("client_id", clientId).order("created_at", { ascending: false }); if (error) throw new Error(error.message); return data ?? []; } });
  const del = useMutation({ mutationFn: async (id: string) => { const { error } = await tbl(res.id).delete().eq("id", id); if (error) throw new Error(error.message); }, onSuccess: () => { toast.success("Deleted"); return qc.invalidateQueries({ queryKey: key }); }, onError: (e) => toast.error(errMsg(e)) });
  return (
    <Card title={res.label} actions={<button type="button" onClick={() => setEditing("new")} className={btnPrimary}><Plus className="size-3.5" />Add</button>}>
      {q.isLoading ? <Spinner /> : q.isError ? <ErrorBox error={q.error} retry={q.refetch} /> : !q.data?.length ? <Empty>{res.empty}</Empty> : (
        <ul className="divide-y divide-border border border-border">
          {q.data.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0"><div className="break-words font-semibold">{String(r[res.title] ?? "")}</div><p className="break-all text-xs text-muted-foreground">{res.meta.filter((m) => r[m] !== null && r[m] !== undefined && r[m] !== "").map((m) => fmtCell(m, r[m])).join(" · ")}</p></div>
              <div className="flex gap-2"><button type="button" onClick={() => setEditing(r)} className={btnGhost}><Pencil className="size-3.5" />Edit</button><button type="button" disabled={del.isPending} onClick={() => window.confirm("Delete this item?") && del.mutate(r.id)} className={btnDanger}><Trash2 className="size-3.5" />Delete</button></div>
            </li>
          ))}
        </ul>
      )}
      {editing && <RowForm res={res} clientId={clientId} row={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void qc.invalidateQueries({ queryKey: key }); }} />}
    </Card>
  );
}

function RowForm({ res, clientId, row, onClose, onSaved }: { res: Res; clientId: string; row: Row | null; onClose: () => void; onSaved: () => void }) {
  const init = Object.fromEntries(res.fields.map((f) => [f.key, row ? String(row[f.key] ?? "") : f.def !== undefined ? String(f.def) : ""]));
  const [v, setV] = useState<Record<string, string>>(init);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const projects = useQuery({ queryKey: ["admin", "data", "projects", clientId], enabled: res.fields.some((f) => f.type === "project"), queryFn: async (): Promise<Row[]> => { const { data } = await tbl("projects").select("id, name").eq("client_id", clientId); return data ?? []; } });

  async function submit(e: FormEvent) {
    e.preventDefault();
    const payload: Record<string, unknown> = {};
    for (const f of res.fields) {
      const raw = (v[f.key] ?? "").trim();
      if (f.required && !raw) return setError(`${f.label} is required.`);
      if (f.type === "url" && raw && !/^https?:\/\//i.test(raw)) return setError(`${f.label} must start with http:// or https://`);
      if (f.type === "number") { if (raw === "" && f.def === undefined) payload[f.key] = null; else { const n = Number(raw === "" ? f.def : raw); if (Number.isNaN(n)) return setError(`${f.label} must be a number.`); if (f.key === "progress" && (n < 0 || n > 100)) return setError("Progress must be between 0 and 100."); payload[f.key] = n; } }
      else if (f.type === "select" || f.def !== undefined) payload[f.key] = raw || f.def;
      else payload[f.key] = raw === "" ? null : raw;
    }
    setBusy(true); setError(null);
    try {
      const { error: err } = row ? await tbl(res.id).update(payload).eq("id", row.id) : await tbl(res.id).insert({ ...payload, client_id: clientId });
      if (err) throw new Error(err.message);
      toast.success(row ? "Saved" : "Added"); onSaved();
    } catch (x) { setError(errMsg(x)); } finally { setBusy(false); }
  }

  return (
    <Modal open onClose={onClose} title={`${row ? "Edit" : "Add"} — ${res.label}`}>
      <form onSubmit={submit} className="space-y-4" aria-busy={busy}>
        {res.fields.map((f) => (
          <Field key={f.key} label={f.label + (f.required ? " *" : "")}>
            {(id) => f.type === "textarea" ? <textarea id={id} rows={3} value={v[f.key] ?? ""} onChange={(e) => setV((s) => ({ ...s, [f.key]: e.target.value }))} className={cn(inputCls, "resize-y")} />
              : f.type === "select" ? <select id={id} value={v[f.key] ?? ""} onChange={(e) => setV((s) => ({ ...s, [f.key]: e.target.value }))} className={inputCls}>{f.options?.map((o) => <option key={o} value={o}>{o}</option>)}</select>
              : f.type === "project" ? <select id={id} value={v[f.key] ?? ""} onChange={(e) => setV((s) => ({ ...s, [f.key]: e.target.value }))} className={inputCls}><option value="">— none —</option>{(projects.data ?? []).map((p) => <option key={p.id} value={p.id}>{String(p["name"])}</option>)}</select>
              : <input id={id} type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "url" ? "url" : "text"} step={f.type === "number" ? "any" : undefined} value={v[f.key] ?? ""} onChange={(e) => setV((s) => ({ ...s, [f.key]: e.target.value }))} className={inputCls} />}
          </Field>
        ))}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className={btnGhost}>Cancel</button><button type="submit" disabled={busy} className={btnPrimary}>{busy ? "Saving…" : "Save"}</button></div>
      </form>
    </Modal>
  );
}

function Messages({ clientId }: { clientId: string }) {
  const qc = useQueryClient();
  const key = ["admin", "data", "messages", clientId];
  const [body, setBody] = useState("");
  const q = useQuery({ queryKey: key, refetchInterval: 15_000, queryFn: async (): Promise<Row[]> => { const { data, error } = await tbl("messages").select("*").eq("client_id", clientId).order("created_at", { ascending: true }); if (error) throw new Error(error.message); return data ?? []; } });
  const send = useMutation({ mutationFn: async () => { const { error } = await tbl("messages").insert({ client_id: clientId, body: body.trim() }); if (error) throw new Error(error.message); }, onSuccess: () => { setBody(""); return qc.invalidateQueries({ queryKey: key }); }, onError: (e) => toast.error(errMsg(e)) });
  const del = useMutation({ mutationFn: async (id: string) => { const { error } = await tbl("messages").delete().eq("id", id); if (error) throw new Error(error.message); }, onSuccess: () => qc.invalidateQueries({ queryKey: key }), onError: (e) => toast.error(errMsg(e)) });
  return (
    <Card title="Messages">
      {q.isLoading ? <Spinner /> : q.isError ? <ErrorBox error={q.error} retry={q.refetch} /> : !q.data?.length ? <Empty>No messages yet.</Empty> : (
        <ul className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          {q.data.map((m) => { const mine = m["sender_id"] !== clientId; return (
            <li key={m.id} className={cn("max-w-[85%] border p-3 text-sm", mine ? "ml-auto border-primary/40 bg-primary/10" : "border-border")}>
              <div className="mb-1 flex items-center justify-between gap-4 text-[11px] text-muted-foreground"><span>{mine ? "Team" : "Client"} · {fmtDate(String(m["created_at"]))}</span><button type="button" aria-label="Delete message" onClick={() => window.confirm("Delete this message?") && del.mutate(m.id)} className="hover:text-destructive"><Trash2 className="size-3" /></button></div>
              <p className="whitespace-pre-wrap break-words">{String(m["body"])}</p>
            </li>); })}
        </ul>
      )}
      <form onSubmit={(e) => { e.preventDefault(); if (body.trim()) send.mutate(); }} className="mt-4 flex gap-2">
        <label className="sr-only" htmlFor="admin-msg">Message</label>
        <textarea id="admin-msg" rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message to this client…" className={cn(inputCls, "resize-y")} />
        <button type="submit" disabled={send.isPending || !body.trim()} className={cn(btnPrimary, "self-end")}><Send className="size-3.5" />Send</button>
      </form>
    </Card>
  );
}
