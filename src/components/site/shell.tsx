import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Mail, MessageCircle, Phone, MapPin } from "lucide-react";
import { Header } from "./header";
import { Logo } from "./logo";
import { NAV } from "@/lib/brand";
import { useBrand, useContent } from "@/lib/content";
import { cn } from "@/lib/utils";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="grain relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 bg-grid" />
      <div className="pointer-events-none fixed -top-60 left-1/2 h-[700px] w-[1000px] -translate-x-1/2 glow-primary opacity-40 blur-3xl" />
      <Header />
      <main id="main" className="relative">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: ReactNode; text?: string }) {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-36 pb-10">
      <div className="eyebrow text-primary animate-reveal">{eyebrow}</div>
      <h1 className="text-display mt-4 max-w-4xl text-[clamp(2.4rem,6vw,4.8rem)] animate-reveal" style={{ animationDelay: ".1s" }}>{title}</h1>
      {text && <p className="mt-6 max-w-2xl text-lg text-muted-foreground animate-reveal" style={{ animationDelay: ".2s" }}>{text}</p>}
    </section>
  );
}

export function SectionHead({ eyebrow, title, text, center }: { eyebrow: string; title: string; text?: string; center?: boolean }) {
  return (
    <div className={cn(center && "text-center")}>
      <div className="eyebrow text-primary">{eyebrow}</div>
      <h2 className={cn("text-display mt-3 max-w-3xl text-[clamp(2rem,4.2vw,3.4rem)]", center && "mx-auto")}>{title}</h2>
      {text && <p className={cn("mt-4 max-w-xl text-muted-foreground", center && "mx-auto")}>{text}</p>}
    </div>
  );
}

export function Footer() {
  const BRAND = useBrand();
  const { services } = useContent();
  return (
    <footer className="relative border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-border pb-12 md:flex-row md:items-end">
          <h2 className="text-display text-[clamp(2rem,4vw,3.4rem)]">Ready to automate<br />your <span className="text-primary">business?</span></h2>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-transform hover:-translate-y-0.5">Start a conversation <ArrowUpRight className="size-4" /></Link>
        </div>
        <div className="grid gap-10 pt-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">{BRAND.description}</p>
            <div className="eyebrow mt-5 text-primary">{BRAND.positioning}</div>
          </div>
          <div>
            <div className="eyebrow text-foreground">Services</div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {services.map((s) => <li key={s.title}><Link to="/services" className="hover:text-foreground">{s.title}</Link></li>)}
            </ul>
          </div>
          <div>
            <div className="eyebrow text-foreground">Company</div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground">Home</Link></li>
              {NAV.map(([l, h]) => <li key={l}><Link to={h} className="hover:text-foreground">{l}</Link></li>)}
              <li><Link to="/portal" className="text-primary hover:underline">Client Portal</Link></li>
            </ul>
          </div>
          <div>
            <div className="eyebrow text-foreground">Contact</div>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><a href={BRAND.emailHref} className="flex items-center gap-2 hover:text-foreground"><Mail className="size-4 text-primary" />{BRAND.email}</a></li>
              <li><a href={BRAND.phoneHref} className="flex items-center gap-2 hover:text-foreground"><Phone className="size-4 text-primary" />{BRAND.phone}</a></li>
              <li><a href={BRAND.whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-foreground"><MessageCircle className="size-4 text-primary" />WhatsApp</a></li>
              <li className="flex items-center gap-2"><MapPin className="size-4 text-primary" />{BRAND.location}</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Lahza. All rights reserved.</span>
          <span>{BRAND.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
