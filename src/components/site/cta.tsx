import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export function CtaBand({ title = "Tell us what you'd like to automate.", text = "Share a few details and we'll come back with a clear next step.", interest }: { title?: string; text?: string; interest?: string }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="flex flex-col items-start justify-between gap-6 rounded-[28px] border border-primary/25 bg-card/70 p-8 sm:p-12 md:flex-row md:items-center">
        <div>
          <h2 className="text-display text-[clamp(1.6rem,3.2vw,2.6rem)]">{title}</h2>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground">{text}</p>
        </div>
        <Link to="/contact" {...(interest ? { search: { interest } } : {})} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-transform hover:-translate-y-0.5">
          Contact Lahza <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
