import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, Empty, ErrorBox, fmtDate, Spinner } from "./ui";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const count = async (table: string, f?: (q: any) => any): Promise<number> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = (supabase as any).from(table).select("*", { count: "exact", head: true });
  if (f) q = f(q);
  const { count: c, error } = await q;
  if (error) throw new Error(error.message);
  return c ?? 0;
};

type Tab = "inquiries" | "clients" | "data";
const STATS: { label: string; tab: Tab; run: () => Promise<number> }[] = [
  { label: "New inquiries", tab: "inquiries", run: () => count("contact_requests", (q) => q.eq("status", "new")) },
  { label: "Clients", tab: "clients", run: () => count("user_roles", (q) => q.eq("role", "client")) },
  { label: "Active projects", tab: "data", run: () => count("projects", (q) => q.eq("status", "active")) },
  { label: "Pending approvals", tab: "data", run: () => count("approvals", (q) => q.eq("status", "pending")) },
  { label: "Unpaid invoices", tab: "data", run: () => count("invoices", (q) => q.in("status", ["unpaid", "overdue"])) },
  { label: "Open tickets", tab: "data", run: () => count("tickets", (q) => q.neq("status", "closed")) },
];

export function Overview() {
  const stats = useQuery({ queryKey: ["admin", "stats"], queryFn: () => Promise.all(STATS.map((s) => s.run())) });
  const latest = useQuery({ queryKey: ["admin", "latest"], queryFn: async () => { const { data, error } = await supabase.from("contact_requests").select("id, name, email, interest, status, created_at").order("created_at", { ascending: false }).limit(5); if (error) throw new Error(error.message); return data ?? []; } });
  return (
    <div className="space-y-5">
      {stats.isLoading ? <Spinner /> : stats.isError ? <ErrorBox error={stats.error} retry={stats.refetch} /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STATS.map((s, i) => (
            <Link key={s.label} to="/admin" search={{ tab: s.tab }} className="group border border-border bg-card/70 p-5 transition hover:border-primary/50">
              <div className="eyebrow text-muted-foreground">{s.label}</div>
              <div className="mt-3 flex items-end justify-between"><span className="font-display text-4xl font-black">{stats.data?.[i] ?? 0}</span><ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary" aria-hidden /></div>
            </Link>
          ))}
        </div>
      )}
      <Card title="Latest inquiries" actions={<Link to="/admin" search={{ tab: "inquiries" }} className="text-xs font-bold uppercase tracking-wider text-primary">View all</Link>}>
        {latest.isLoading ? <Spinner /> : latest.isError ? <ErrorBox error={latest.error} retry={latest.refetch} /> : !latest.data?.length ? <Empty>No inquiries yet. Messages sent from the contact page will show up here.</Empty> : (
          <ul className="divide-y divide-border text-sm">{latest.data.map((r) => <li key={r.id} className="flex flex-wrap justify-between gap-2 py-3"><span><span className="font-semibold">{r.name}</span> <span className="text-muted-foreground">· {r.email}{r.interest && ` · ${r.interest}`}</span></span><span className="text-xs text-muted-foreground">{r.status} · {fmtDate(r.created_at)}</span></li>)}</ul>
        )}
      </Card>
    </div>
  );
}
