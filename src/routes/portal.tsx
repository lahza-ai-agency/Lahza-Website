import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/shell";
import { PortalLogin } from "@/components/portal/login";
import { PortalDashboard } from "@/components/portal/dashboard";
import { useBrand } from "@/lib/content";
import { useSession } from "@/lib/use-session";

export const Route = createFileRoute("/portal")({
  head: () => ({ meta: [{ title: "Client Portal — Lahza" }, { name: "description", content: "Secure area for existing Lahza clients: projects, approvals, invoices and reports." }, { name: "robots", content: "noindex" }] }),
  component: PortalPage,
});

function PortalPage() {
  const BRAND = useBrand();
  const s = useSession();
  return (
    <SiteShell>
      <PageHero eyebrow="Client portal" title={<>Your projects, <span className="text-primary">in one place.</span></>} />
      <section className="mx-auto max-w-7xl px-6 pb-24">
        {s.status === "loading" && <div role="status" className="flex items-center justify-center gap-2 py-16 text-muted-foreground"><Loader2 className="size-5 animate-spin" aria-hidden />Checking your session…</div>}
        {s.status === "unavailable" && <div role="alert" className="mx-auto max-w-md border border-border bg-card/70 p-8 text-center"><h2 className="font-display text-xl font-black uppercase">Portal unavailable</h2><p className="mt-2 text-sm text-muted-foreground">The portal can't connect right now. Please try again later or <a className="text-primary underline" href={BRAND.emailHref}>email us</a>.</p></div>}
        {s.status === "out" && <><PortalLogin /><p className="mt-6 text-center text-sm text-muted-foreground">Not a client yet? <Link to="/contact" className="text-primary underline">Contact us</Link>.</p></>}
        {s.status === "in" && <PortalDashboard session={s.session} />}
      </section>
    </SiteShell>
  );
}
