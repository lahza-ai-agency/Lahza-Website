import { Link } from "@tanstack/react-router";
import { SiteShell } from "./shell";

export function NotFound() {
  return (
    <SiteShell>
      <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 pt-32 pb-16 text-center">
        <div className="eyebrow text-primary">Error 404</div>
        <h1 className="text-display mt-4 text-[clamp(3rem,10vw,6rem)]">Page not found</h1>
        <p className="mt-5 max-w-md text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-full bg-primary px-7 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground">Go home</Link>
          <Link to="/contact" className="rounded-full border border-border px-7 py-3 text-sm font-bold uppercase tracking-wider hover:border-primary/60">Contact us</Link>
        </div>
      </section>
    </SiteShell>
  );
}
