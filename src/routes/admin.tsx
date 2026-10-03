import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { ExternalLink, FileText, FolderKanban, Inbox, LayoutDashboard, Loader2, LogOut, UserCog, Users } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Logo } from "@/components/site/logo";
import { SignedOutGate } from "@/components/admin/auth";
import { Overview } from "@/components/admin/overview";
import { Inquiries } from "@/components/admin/inquiries";
import { Clients } from "@/components/admin/clients";
import { ClientData } from "@/components/admin/client-data";
import { ContentManager, isSub } from "@/components/admin/content-editors";
import { Account } from "@/components/admin/account";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/lib/use-admin";
import { useSession } from "@/lib/use-session";
import { cn } from "@/lib/utils";

type AdminSearch = { tab?: string; client?: string; res?: string; sub?: string };

export const Route = createFileRoute("/admin")({
  validateSearch: (s: Record<string, unknown>): AdminSearch => ({
    ...(typeof s["tab"] === "string" ? { tab: s["tab"] } : {}),
    ...(typeof s["client"] === "string" ? { client: s["client"] } : {}),
    ...(typeof s["res"] === "string" ? { res: s["res"] } : {}),
    ...(typeof s["sub"] === "string" ? { sub: s["sub"] } : {}),
  }),
  head: () => ({ meta: [{ title: "Admin — Lahza" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminPage,
});

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "inquiries", label: "Inquiries", icon: Inbox },
  { id: "clients", label: "Clients & users", icon: Users },
  { id: "data", label: "Client data", icon: FolderKanban },
  { id: "content", label: "Website content", icon: FileText },
  { id: "account", label: "My account", icon: UserCog },
] as const;

const Center = ({ children }: { children: React.ReactNode }) => <div className="mx-auto max-w-3xl px-6 py-16">{children}</div>;

function AdminPage() {
  const s = useSession();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster richColors position="bottom-right" />
      <header className="border-b border-border bg-surface/60">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-4"><Link to="/" aria-label="Lahza home"><Logo /></Link><h1 className="font-display text-base font-black uppercase tracking-wide text-primary">Admin dashboard</h1></div>
          <div className="flex items-center gap-2">
            <Link to="/" target="_blank" className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider hover:border-primary/60">View site <ExternalLink className="size-3.5" aria-hidden /></Link>
            {s.status === "in" && <button type="button" onClick={() => void supabase.auth.signOut()} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider hover:border-primary/60"><LogOut className="size-3.5" aria-hidden />Sign out</button>}
          </div>
        </div>
      </header>
      {s.status === "loading" && <Center><div role="status" className="flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="size-5 animate-spin" aria-hidden />Checking your session…</div></Center>}
      {s.status === "unavailable" && <Center><p role="alert" className="border border-border bg-card/70 p-8 text-center text-sm text-muted-foreground">The dashboard can't connect to the backend right now. Check the Supabase environment variables and try again.</p></Center>}
      {s.status === "out" && <Center><SignedOutGate /></Center>}
      {s.status === "in" && <AdminGate session={s.session} />}
    </div>
  );
}

function AdminGate({ session }: { session: Session }) {
  const admin = useIsAdmin(session.user.id);
  if (admin.isLoading) return <Center><div role="status" className="flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="size-5 animate-spin" aria-hidden />Checking permissions…</div></Center>;
  if (admin.isError) return <Center><p role="alert" className="border border-border bg-card/70 p-8 text-center text-sm">Couldn't verify your permissions. <button type="button" onClick={() => void admin.refetch()} className="text-primary underline">Try again</button></p></Center>;
  if (!admin.data) return (
    <Center><div role="alert" className="border border-border bg-card/70 p-8 text-center"><h2 className="font-display text-xl font-black uppercase">No access</h2><p className="mt-2 text-sm text-muted-foreground">{session.user.email} isn't an administrator. If you're a client, use the client portal.</p><div className="mt-5 flex flex-wrap justify-center gap-2"><Link to="/portal" className="rounded-full bg-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground">Go to portal</Link><button type="button" onClick={() => void supabase.auth.signOut()} className="rounded-full border border-border px-5 py-2 text-xs font-bold uppercase tracking-wider">Sign out</button></div></div></Center>
  );
  return <AdminShell session={session} />;
}

function AdminShell({ session }: { session: Session }) {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const tab = TABS.find((t) => t.id === search.tab)?.id ?? "overview";
  const sub = isSub(search.sub) ? search.sub : "brand";
  const current = TABS.find((t) => t.id === tab);
  return (
    <div className="mx-auto grid max-w-[1400px] gap-6 px-5 py-6 lg:grid-cols-[220px_1fr]">
      <nav aria-label="Admin sections" className="flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-6 lg:block lg:space-y-1 lg:self-start lg:overflow-visible">
        {TABS.map(({ id, label, icon: Icon }) => (
          <Link key={id} to="/admin" search={{ tab: id }} aria-current={tab === id ? "page" : undefined} className={cn("flex shrink-0 items-center gap-2.5 border px-4 py-2.5 text-sm font-semibold transition", tab === id ? "border-primary/60 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}><Icon className="size-4" aria-hidden />{label}</Link>
        ))}
      </nav>
      <div className="min-w-0">
        <h2 className="sr-only">{current?.label}</h2>
        {tab === "overview" && <Overview />}
        {tab === "inquiries" && <Inquiries />}
        {tab === "clients" && <Clients selfId={session.user.id} />}
        {tab === "data" && <ClientData clientId={search.client} resource={search.res ?? "projects"} setSearch={(n) => void navigate({ to: "/admin", search: { tab: "data", ...(n.client ? { client: n.client } : {}), ...(n.res ? { res: n.res } : {}) } })} />}
        {tab === "content" && <ContentManager sub={sub} />}
        {tab === "account" && <Account session={session} />}
      </div>
    </div>
  );
}
