import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, MessageCircle, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { btnDanger, Card, Empty, errMsg, ErrorBox, fmtDate, inputCls, Spinner } from "./ui";
import { cn } from "@/lib/utils";

type Row = Tables<"contact_requests">;
const STATUSES = ["new", "contacted", "closed"] as const;
const KEY = ["admin", "inquiries"];
const waLink = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;

export function Inquiries() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | (typeof STATUSES)[number]>("all");
  const [search, setSearch] = useState("");
  const q = useQuery({ queryKey: KEY, queryFn: async () => { const { data, error } = await supabase.from("contact_requests").select("*").order("created_at", { ascending: false }); if (error) throw new Error(error.message); return data ?? []; } });
  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: { status?: string; notes?: string | null } }) => { const { error } = await supabase.from("contact_requests").update(patch).eq("id", id); if (error) throw new Error(error.message); },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (e) => toast.error(errMsg(e)),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("contact_requests").delete().eq("id", id); if (error) throw new Error(error.message); },
    onSuccess: () => { toast.success("Inquiry deleted"); return qc.invalidateQueries({ queryKey: KEY }); },
    onError: (e) => toast.error(errMsg(e)),
  });
  const rows = useMemo(() => (q.data ?? []).filter((r) => (filter === "all" || r.status === filter) && (!search.trim() || `${r.name} ${r.email} ${r.company ?? ""} ${r.message}`.toLowerCase().includes(search.trim().toLowerCase()))), [q.data, filter, search]);
  const count = (s: string) => (q.data ?? []).filter((r) => r.status === s).length;

  return (
    <Card title="Inquiries">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)} className={cn("rounded-full border px-4 py-1.5 text-xs font-semibold capitalize", filter === s ? "border-primary/60 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>{s}{s !== "all" && ` (${count(s)})`}</button>
        ))}
        <input aria-label="Search inquiries" placeholder="Search name, email, message…" value={search} onChange={(e) => setSearch(e.target.value)} className={cn(inputCls, "ml-auto max-w-xs")} />
      </div>
      {q.isLoading ? <Spinner /> : q.isError ? <ErrorBox error={q.error} retry={q.refetch} /> : !rows.length ? <Empty>No inquiries match.</Empty> : (
        <ul className="space-y-4">
          {rows.map((r) => <Item key={r.id} r={r} onStatus={(status) => update.mutate({ id: r.id, patch: { status } })} onNotes={(notes) => update.mutate({ id: r.id, patch: { notes: notes.trim() || null } })} onDelete={() => { if (window.confirm(`Delete the inquiry from ${r.name}? This can't be undone.`)) remove.mutate(r.id); }} />)}
        </ul>
      )}
    </Card>
  );
}

function Item({ r, onStatus, onNotes, onDelete }: { r: Row; onStatus: (s: string) => void; onNotes: (n: string) => void; onDelete: () => void }) {
  const [notes, setNotes] = useState(r.notes ?? "");
  return (
    <li className={cn("border p-4 sm:p-5", r.status === "new" ? "border-primary/40" : "border-border")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold">{r.name}{r.company && <span className="font-normal text-muted-foreground"> · {r.company}</span>}</h3>
          <p className="text-xs text-muted-foreground">{fmtDate(r.created_at)}{r.interest && ` · ${r.interest}`}</p>
        </div>
        <label className="flex items-center gap-2 text-xs"><span className="sr-only">Status</span>
          <select value={r.status} onChange={(e) => onStatus(e.target.value)} className={cn(inputCls, "w-auto capitalize")}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        </label>
      </div>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm text-foreground/85">{r.message}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 hover:border-primary/60"><Mail className="size-3.5 text-primary" />{r.email}</a>
        {r.phone && <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 hover:border-primary/60"><Phone className="size-3.5 text-primary" />{r.phone}</a>}
        {r.phone && <a href={waLink(r.phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 hover:border-primary/60"><MessageCircle className="size-3.5 text-primary" />WhatsApp</a>}
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Internal notes
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== (r.notes ?? "") && onNotes(notes)} placeholder="Saved when you click away" className={cn(inputCls, "mt-1.5 resize-y normal-case tracking-normal")} />
        </label>
        <button type="button" onClick={onDelete} className={btnDanger}><Trash2 className="size-3.5" />Delete</button>
      </div>
    </li>
  );
}
