import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminCreateUser, adminDeleteUser, adminListUsers, adminSetRole, adminUpdateUser } from "@/lib/admin.functions";
import { btnDanger, btnGhost, btnPrimary, Card, Empty, errMsg, ErrorBox, fmtDate, Field, inputCls, Modal, Spinner, TextField } from "./ui";
import { cn } from "@/lib/utils";

export type AdminUser = Awaited<ReturnType<typeof adminListUsers>>[number];
export const USERS_KEY = ["admin", "users"];
export const useUsers = () => useQuery({ queryKey: USERS_KEY, queryFn: () => adminListUsers() });

const genPassword = () => { const a = new Uint32Array(4); crypto.getRandomValues(a); return Array.from(a, (n) => n.toString(36)).join("").slice(0, 14) + "A9"; };

export function Clients({ selfId }: { selfId: string }) {
  const qc = useQueryClient();
  const q = useUsers();
  const [editing, setEditing] = useState<AdminUser | "new" | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: USERS_KEY });
  const role = useMutation({ mutationFn: (v: { id: string; role: "admin" | "client" }) => adminSetRole({ data: v }), onSuccess: () => { toast.success("Role updated"); return refresh(); }, onError: (e) => toast.error(errMsg(e)) });
  const del = useMutation({ mutationFn: (id: string) => adminDeleteUser({ data: { id } }), onSuccess: () => { toast.success("User deleted"); return refresh(); }, onError: (e) => toast.error(errMsg(e)) });

  return (
    <Card title="Clients & users" actions={<button type="button" onClick={() => setEditing("new")} className={btnPrimary}><Plus className="size-3.5" />New user</button>}>
      <p className="mb-5 text-sm text-muted-foreground">Create login accounts for your clients here — no need to touch the database. Clients sign in at <Link to="/portal" className="text-primary underline">/portal</Link>.</p>
      {q.isLoading ? <Spinner /> : q.isError ? <ErrorBox error={q.error} retry={q.refetch} /> : !q.data?.length ? <Empty>No users yet.</Empty> : (
        <ul className="divide-y divide-border border border-border">
          {q.data.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{u.fullName || u.email}</span><span className={cn("border px-2 py-0.5 text-[10px] font-bold uppercase", u.role === "admin" ? "border-primary/50 text-primary" : "border-border text-muted-foreground")}>{u.role}</span>{u.id === selfId && <span className="text-xs text-muted-foreground">(you)</span>}</div>
                <p className="break-all text-xs text-muted-foreground">{u.email}{u.company && ` · ${u.company}`} · last sign-in {fmtDate(u.lastSignInAt)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {u.role === "client" && <Link to="/admin" search={{ tab: "data", client: u.id }} className={btnGhost}>Manage data</Link>}
                <button type="button" onClick={() => setEditing(u)} className={btnGhost}><Pencil className="size-3.5" />Edit</button>
                <button type="button" disabled={role.isPending} onClick={() => { const next = u.role === "admin" ? "client" : "admin"; if (window.confirm(`Make ${u.email} ${next === "admin" ? "an administrator (full access)" : "a regular client"}?`)) role.mutate({ id: u.id, role: next }); }} className={btnGhost}><KeyRound className="size-3.5" />{u.role === "admin" ? "Make client" : "Make admin"}</button>
                {u.id !== selfId && <button type="button" disabled={del.isPending} onClick={() => { if (window.confirm(`Delete ${u.email} and ALL of their portal data (projects, invoices, files…)? This can't be undone.`)) del.mutate(u.id); }} className={btnDanger}><Trash2 className="size-3.5" />Delete</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
      {editing && <UserForm user={editing === "new" ? null : editing} onClose={() => setEditing(null)} onDone={() => { setEditing(null); void refresh(); }} />}
    </Card>
  );
}

function UserForm({ user, onClose, onDone }: { user: AdminUser | null; onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({ email: user?.email ?? "", fullName: user?.fullName ?? "", company: user?.company ?? "", password: user ? "" : genPassword(), role: (user?.role ?? "client") as "admin" | "client" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const set = (k: "email" | "fullName" | "company" | "password") => (v: string) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user && f.password.length < 8) return setError("Password must be at least 8 characters.");
    if (user && f.password && f.password.length < 8) return setError("Password must be at least 8 characters.");
    setBusy(true); setError(null);
    try {
      if (user) {
        await adminUpdateUser({ data: { id: user.id, fullName: f.fullName, company: f.company, ...(f.email !== user.email ? { email: f.email } : {}), ...(f.password ? { password: f.password } : {}) } });
        toast.success("User updated"); onDone();
      } else {
        await adminCreateUser({ data: { email: f.email, password: f.password, fullName: f.fullName, company: f.company, role: f.role } });
        setCreated({ email: f.email, password: f.password });
      }
    } catch (x) { setError(errMsg(x)); } finally { setBusy(false); }
  }

  if (created) return (
    <Modal open onClose={onDone} title="User created" description="Share these sign-in details with the client.">
      <div className="space-y-3 text-sm"><p>Send these details to the client securely. The password can't be viewed again later, but you can set a new one from Edit.</p>
        <pre className="overflow-x-auto border border-border bg-background p-3 text-xs">{`Portal: ${typeof window !== "undefined" ? window.location.origin : ""}/portal\nEmail: ${created.email}\nPassword: ${created.password}`}</pre>
        <button type="button" onClick={() => void navigator.clipboard?.writeText(`Portal: ${window.location.origin}/portal\nEmail: ${created.email}\nPassword: ${created.password}`).then(() => toast.success("Copied"))} className={btnGhost}>Copy details</button>
        <button type="button" onClick={onDone} className={`${btnPrimary} ml-2`}>Done</button></div>
    </Modal>
  );

  return (
    <Modal open onClose={onClose} title={user ? "Edit user" : "New user"}>
      <form onSubmit={submit} className="space-y-4" aria-busy={busy}>
        <TextField label="Full name" value={f.fullName} onChange={set("fullName")} />
        <TextField label="Company" value={f.company} onChange={set("company")} />
        <TextField label="Email" type="email" value={f.email} onChange={set("email")} required />
        <div className="flex items-end gap-2">
          <TextField className="flex-1" label={user ? "New password (optional)" : "Password"} type="text" value={f.password} onChange={set("password")} hint={user ? "Leave empty to keep the current password." : "At least 8 characters."} />
          <button type="button" onClick={() => set("password")(genPassword())} className={cn(btnGhost, "mb-[22px]")}>Generate</button>
        </div>
        {!user && <Field label="Role">{(id) => <select id={id} value={f.role} onChange={(e) => setF((s) => ({ ...s, role: e.target.value as "admin" | "client" }))} className={inputCls}><option value="client">Client (portal access only)</option><option value="admin">Administrator (full access)</option></select>}</Field>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className={btnGhost}>Cancel</button><button type="submit" disabled={busy} className={btnPrimary}>{busy ? "Saving…" : "Save"}</button></div>
      </form>
    </Modal>
  );
}
