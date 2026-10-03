import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Plus } from "lucide-react";
import { SectionHead } from "./shell";
import assiutLogo from "@/assets/assiut-logo.jpg";
import { useContent } from "@/lib/content";
import { iconFor } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function ServicesGrid({ compact = false }: { compact?: boolean }) {
  const { services } = useContent();
  const [open, setOpen] = useState<number | null>(null);
  return <div className={cn("grid gap-4 sm:grid-cols-2", compact ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
    {services.map((service, index) => { const Icon = iconFor(service.icon); const expanded = open === index; return (
      <button key={service.title} type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : index)} className={cn("group min-h-64 border bg-card/70 p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-primary/50", expanded && "border-primary/60")}>
        <div className="flex items-start justify-between"><span className="grid size-11 place-items-center border border-border bg-secondary"><Icon className="size-5 text-primary" /></span><Plus className={cn("size-4 text-muted-foreground transition-transform", expanded && "rotate-45 text-primary")} /></div>
        <h3 className="mt-8 font-display text-lg font-black uppercase">{service.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{service.text}</p>
        <div className={cn("grid transition-all", expanded ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}><p className="min-h-0 overflow-hidden border-t border-border pt-4 text-sm leading-6 text-foreground/80">{service.detail}</p></div>
      </button>); })}
  </div>;
}

export function PricingGrid() {
  const { pricing } = useContent();
  const { plans } = pricing;
  return <div className={cn("grid gap-5", plans.length === 1 ? "lg:grid-cols-1" : plans.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3")}>{plans.map((plan) => (
    <article key={plan.name} className={cn("relative flex flex-col border bg-card/70 p-7", plan.popular && "border-primary/60")}>
      {plan.popular && <span className="absolute right-5 top-5 bg-primary px-3 py-1 text-[10px] font-bold uppercase text-primary-foreground">Most popular</span>}
      <h3 className="font-display text-2xl font-black uppercase">{plan.name}</h3><p className="mt-3 min-h-12 text-sm text-muted-foreground">{plan.audience}</p>
      <div className="mt-7 flex items-end gap-2"><span className="font-display text-5xl font-black">{plan.price}</span><span className="pb-2 text-xs text-muted-foreground">{pricing.currency} / {pricing.period}</span></div>
      <ul className="mt-7 flex-1 space-y-3 border-t border-border pt-6">{plan.features.map((feature) => <li key={feature} className="flex gap-3 text-sm"><span className="mt-2 size-1.5 shrink-0 bg-primary" />{feature}</li>)}</ul>
      <Link to="/contact" search={{ interest: `${plan.name} package` }} className={cn("mt-8 py-3 text-center text-xs font-bold uppercase", plan.popular ? "bg-primary text-primary-foreground" : "border border-border hover:border-primary")}>Get started</Link>
    </article>
  ))}</div>;
}

export function SetupNote() { const { pricing } = useContent(); return pricing.setupNote ? <p className="mt-6 text-center text-sm text-muted-foreground">{pricing.setupNote}</p> : null; }

export function CaseStudyTeaser() {
 const { pages } = useContent();
 return <section className="border-y border-border bg-surface/60"><div className="mx-auto max-w-7xl px-6 py-24"><SectionHead eyebrow="Selected work" title="Assiut Real Estate" text="A connected automation system built around the real estate team's daily operations." />
 <Link to="/case-studies/assiut-real-estate" className="group mt-12 grid overflow-hidden border border-border bg-card/70 hover:border-primary/50 lg:grid-cols-[.8fr_1.2fr]"><div className="grid min-h-80 place-items-center bg-case-study p-10"><img src={assiutLogo} alt="Assiut Real Estate" className="max-h-60 w-auto border border-border" /></div><div className="flex flex-col justify-between p-8 lg:p-12"><div className="flex flex-wrap gap-2">{pages.caseTags.map(item => <span key={item} className="border border-border px-3 py-1 text-[11px] text-muted-foreground">{item}</span>)}</div><h3 className="text-display mt-10 text-4xl">A connected AI ecosystem</h3><p className="mt-4 max-w-xl text-muted-foreground">{pages.caseSummary}</p><span className="mt-10 inline-flex items-center gap-2 text-xs font-bold uppercase text-primary">Read case study <ArrowUpRight className="size-4" /></span></div></Link></div></section>;
}
