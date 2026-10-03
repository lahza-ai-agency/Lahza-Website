import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { NAV } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    const on = () => {
      const y = window.scrollY;
      setScrolled(y > 16);
      setHidden(y > 400 && y > last.current);
      last.current = y;
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 border-b transition-all duration-500", scrolled ? "border-border bg-background/70 backdrop-blur-xl" : "border-transparent", hidden && !open && "-translate-y-full")}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" aria-label="Lahza home" onClick={() => setOpen(false)}><Logo /></Link>
        <nav className="hidden items-center gap-7 text-[12px] font-semibold uppercase tracking-[0.15em] text-muted-foreground lg:flex">
          {NAV.map(([l, h]) => (
            <Link key={l} to={h} activeProps={{ className: "text-foreground" }} className="group relative py-1 transition-colors hover:text-foreground">
              {l}
              <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/portal" className="hidden rounded-full border border-primary/40 px-5 py-2 text-[12px] font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary/10 sm:block">Client Portal</Link>
          <Link to="/contact" className="hidden rounded-full bg-primary px-5 py-2 text-[12px] font-bold uppercase tracking-wider text-primary-foreground transition-transform hover:-translate-y-0.5 md:block">Get started</Link>
          <button type="button" onClick={() => setOpen(!open)} className="rounded-full border border-border p-2 focus-visible:outline-2 focus-visible:outline-primary lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-nav">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      <div id="mobile-nav" inert={!open} className={cn("grid overflow-hidden transition-all duration-500 lg:hidden", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="min-h-0">
          <nav className="flex flex-col gap-1 border-t border-border bg-background/95 px-6 py-6 backdrop-blur-xl">
            {[...NAV, ["Client Portal", "/portal"] as const].map(([l, h]) => (
              <Link key={l} to={h} onClick={() => setOpen(false)} className="text-display py-2 text-3xl hover:text-primary">{l}</Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
