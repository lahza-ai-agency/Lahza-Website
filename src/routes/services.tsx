import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/shell";
import { CtaBand } from "@/components/site/cta";
import { useContent } from "@/lib/content";
import { iconFor } from "@/lib/icons";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/services")({
  head: () => pageHead({ title: "Services — Lahza", description: "AI automation, chatbots, AI agents, lead qualification, business platforms, smart websites and process optimization built around how your business works.", path: "/services" }),
  component: ServicesPage,
});

function ServicesPage() {
  const { services } = useContent();
  return (
    <SiteShell>
      <PageHero eyebrow="Services" title={<>AI and automation, <span className="text-primary">built around you.</span></>} text="Each service can stand alone or connect to the others, so your chats, data and workflows work as one system." />
      <nav aria-label="Services" className="mx-auto flex max-w-7xl flex-wrap gap-2 px-6 pb-6">
        {services.map((s) => <a key={s.title} href={`#${slug(s.title)}`} className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary/60 hover:text-foreground">{s.title}</a>)}
      </nav>
      <div className="mx-auto max-w-7xl space-y-6 px-6 pb-8">
        {services.map((s) => {
          const Icon = iconFor(s.icon);
          return (
            <section key={s.title} id={slug(s.title)} className="scroll-mt-28 border border-border bg-card/70 p-6 sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
                <div>
                  <span className="grid size-12 place-items-center border border-border bg-secondary"><Icon className="size-6 text-primary" aria-hidden /></span>
                  <h2 className="text-display mt-6 text-3xl">{s.title}</h2>
                  <p className="mt-3 text-muted-foreground">{s.text}</p>
                  <Link to="/contact" search={{ interest: s.title }} className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">Ask about this service <ArrowUpRight className="size-4" aria-hidden /></Link>
                </div>
                <div className="space-y-6">
                  <p className="leading-7 text-foreground/85">{s.intro || s.detail}</p>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <List title="Benefits" items={s.benefits} />
                    <List title="Example use cases" items={s.useCases} />
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
      <CtaBand />
    </SiteShell>
  );
}

const slug = (t: string) => t.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function List({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div>
      <h3 className="eyebrow text-foreground">{title}</h3>
      <ul className="mt-3 space-y-2">{items.map((i) => <li key={i} className="flex gap-2 text-sm text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />{i}</li>)}</ul>
    </div>
  );
}
