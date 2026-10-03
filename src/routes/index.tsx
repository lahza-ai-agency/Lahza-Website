import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { Intro } from "@/components/site/intro";
import { SiteShell, SectionHead } from "@/components/site/shell";
import { CtaBand } from "@/components/site/cta";
import { CaseStudyTeaser, PricingGrid, ServicesGrid, SetupNote } from "@/components/site/sections";
import { BRAND } from "@/lib/brand";
import { useBrand, useContent } from "@/lib/content";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => pageHead({ title: "Lahza — AI Automation, Chatbots & Smart Business Systems", description: BRAND.description, path: "/" }),
  component: Index,
});

function Index() {
  return (
    <SiteShell>
      <Intro />
      <Hero />
      <section id="services" className="mx-auto max-w-7xl px-6 py-24">
        <SectionHead eyebrow="Services" title="AI and automation, wired together." text="Eight services that work alone or as one connected system." />
        <div className="mt-12"><ServicesGrid compact /></div>
        <Link to="/services" className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">All services in detail <ArrowUpRight className="size-4" aria-hidden /></Link>
      </section>
      <Why />
      <Engine />
      <Process />
      <CaseStudyTeaser />
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
        <SectionHead eyebrow="Pricing" title="AI automation packages" text="Pick the level of automation your business needs." center />
        <div className="mt-14"><PricingGrid /></div>
        <SetupNote />
        <div className="mt-6 text-center"><Link to="/pricing" className="text-xs font-bold uppercase tracking-wider text-primary">Compare packages</Link></div>
      </section>
      <CtaBand />
    </SiteShell>
  );
}

const hubItems = ["AI Chatbots", "AI Agents", "Lead Qualification", "Business Automation"] as const;

function Hero() {
  const BRAND = useBrand();
  const { pages } = useContent();
  return (
    <section className="mx-auto max-w-7xl px-6 pt-28 pb-20">
      <div className="relative overflow-hidden rounded-[28px] border border-border bg-card/60">
        <div className="pointer-events-none absolute -right-24 -top-24 size-[560px] rounded-full glow-primary blur-2xl animate-drift" />
        <div className="relative grid items-center gap-12 p-8 sm:p-12 lg:grid-cols-[1.05fr_0.95fr] lg:p-16">
          <div>
            <div className="eyebrow mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-primary animate-reveal" style={{ animationDelay: "2.2s" }}>
              <span className="size-1.5 rounded-full bg-primary animate-pulse-dot" /> {BRAND.positioning}
            </div>
            <h1 className="text-display text-[clamp(2.4rem,6vw,5rem)] animate-reveal" style={{ animationDelay: "2.3s" }}>
              {pages.heroHeadline} <span className="text-primary">{pages.heroHighlight}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground animate-reveal" style={{ animationDelay: "2.45s" }}>{BRAND.description}</p>
            <div className="mt-9 flex flex-wrap gap-3 animate-reveal" style={{ animationDelay: "2.6s" }}>
              <Link to="/contact" className="rounded-full bg-primary px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-transform hover:-translate-y-0.5">Get started</Link>
              <Link to="/services" className="rounded-full border border-border px-7 py-3.5 text-sm font-bold uppercase tracking-wider transition-colors hover:border-primary/60">Our services</Link>
            </div>
          </div>
          <div className="relative animate-reveal" style={{ animationDelay: "2.5s" }}>
            <div className="rotate-[4deg] rounded-2xl glass p-6 transition-transform duration-700 hover:rotate-[1deg]">
              <div className="eyebrow border-b border-border pb-3 text-muted-foreground">What Lahza builds</div>
              <ul className="mt-4 grid grid-cols-2 gap-3">
                {hubItems.map((k, i) => (
                  <li key={k} className={cn("rounded-xl p-4 text-sm font-semibold", i === 0 ? "bg-primary/15 text-primary" : "bg-foreground/5")}>{k}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">Plus CRM platforms, smart websites, process optimization and Facebook automation.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Why() {
  const { pages } = useContent();
  return (
    <section id="why" className="border-y border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <SectionHead eyebrow="Why Lahza" title="Automation that fits your business." />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {pages.reasons.map(({ title: t, text: d }, i) => (
            <div key={t + i} className="border border-border bg-card/70 p-6"><Check className="size-5 text-primary" aria-hidden /><h3 className="mt-4 font-display text-lg font-black uppercase">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- GROWTH ENGINE ---------------- */
const nodes = ["Chatbots", "AI Agents", "Automation", "Leads", "CRM", "Websites", "Facebook", "Optimization"];

function Engine() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % nodes.length), 2200);
    return () => clearInterval(t);
  }, []);
  const R = 165;
  return (
    <section id="capabilities" className="relative border-y border-border bg-surface/40">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHead eyebrow="AI & automation capabilities" title="One hub. Eight capabilities. Zero silos." />
          <p className="mt-6 max-w-md text-muted-foreground">Chats, leads, websites and internal tools often live as separate islands. We connect them so information flows without re-typing and your team only steps in when judgment is needed.</p>
          <ul className="mt-8 grid grid-cols-2 gap-2">
            {nodes.map((n, i) => (
              <li key={n}>
                <button type="button" onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} className={cn("w-full rounded-lg border px-4 py-2.5 text-left text-sm font-semibold uppercase tracking-wide transition-all", active === i ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>{n}</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[520px]">
          <svg viewBox="-260 -260 520 520" aria-hidden="true" className="absolute inset-0 size-full overflow-visible">
            <circle r={R} fill="none" className="stroke-border" strokeDasharray="2 6" />
            <circle r={R * 0.55} fill="none" className="stroke-border" />
            {nodes.map((n, i) => {
              const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
              const x = Math.cos(a) * R, y = Math.sin(a) * R;
              const on = active === i;
              return (
                <g key={n}>
                  <line x1="0" y1="0" x2={x} y2={y} strokeWidth={on ? 2 : 1} strokeDasharray="6 6" className={cn("transition-all duration-500", on ? "stroke-primary animate-dash" : "stroke-foreground/15")} />
                  <circle cx={x} cy={y} r={on ? 9 : 6} className={cn("transition-all duration-500", on ? "fill-primary" : "fill-node")} />
                  <text x={x * 1.18} y={y * 1.18 + 4} textAnchor="middle" className={cn("text-[13px] font-semibold uppercase tracking-wider transition-colors", on ? "fill-primary" : "fill-muted-foreground")}>{n}</text>
                </g>
              );
            })}
          </svg>
          <div className="absolute left-1/2 top-1/2 grid size-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-primary/40 bg-background shadow-[0_0_80px_-10px] shadow-primary/40">
            <div className="text-center">
              <div className="eyebrow text-primary">Lahza</div>
              <div className="font-display text-xl font-black uppercase">Hub</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- PROCESS ---------------- */
function Process() {
  const { steps: stepList } = useContent().pages;
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const v = (window.innerHeight * 0.6 - r.top) / r.height;
      setP(Math.max(0, Math.min(1, v)));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <section id="how-it-works" className="mx-auto max-w-5xl px-6 py-24">
      <SectionHead eyebrow="How Lahza works" title="Six steps. One continuous loop." center />
      <div ref={ref} className="relative mt-16">
        <div className="absolute left-5 top-0 h-full w-px bg-border md:left-1/2" />
        <div className="absolute left-5 top-0 w-px bg-primary shadow-[0_0_12px] shadow-primary md:left-1/2" style={{ height: `${p * 100}%` }} />
        <ol className="space-y-10">
          {stepList.map(({ title: t, text: d }, i) => {
            const on = p >= (i + 0.3) / stepList.length;
            return (
              <li key={t + i} className={cn("relative grid items-center gap-4 pl-14 md:grid-cols-2 md:gap-16 md:pl-0", i % 2 && "md:[&>div:first-of-type]:order-2")}>
                <div className={cn("transition-all duration-700 md:text-right", i % 2 && "md:text-left", on ? "opacity-100" : "translate-y-4 opacity-30")}>
                  <div className="eyebrow text-primary">{String(i + 1).padStart(2, "0")}</div>
                  <h3 className="text-display mt-2 text-3xl">{t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{d}</p>
                </div>
                <div />
                <span className={cn("absolute left-5 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-500 md:left-1/2", on ? "border-primary bg-primary shadow-[0_0_16px] shadow-primary" : "border-node bg-background")} />
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

