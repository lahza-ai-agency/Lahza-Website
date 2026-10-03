import { useEffect, useState } from "react";
import { LogoMark } from "./logo";

/** 2.4s first visit, 0.9s returning visitor this session, click to skip. */
export function Intro() {
  const [state, setState] = useState<"show" | "fast" | "done">("show");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("lahza-intro") || localStorage.getItem("lahza-intro");
    if (reduced) return setState("done");
    const fast = !!seen;
    if (fast) setState("fast");
    localStorage.setItem("lahza-intro", "1");
    sessionStorage.setItem("lahza-intro", "1");
    const t = setTimeout(() => setState("done"), fast ? 900 : 2400);
    return () => clearTimeout(t);
  }, []);

  if (state === "done") return null;
  const dur = state === "fast" ? 0.9 : 2.4;

  return (
    <div
      onClick={() => setState("done")}
      className="fixed inset-0 z-[100] grid cursor-pointer place-items-center bg-background"
      style={{ animation: `fade-out .5s ease ${dur - 0.5}s forwards` }}
      aria-hidden
    >
      <div className="relative flex flex-col items-center gap-6 overflow-hidden px-10 py-6">
        <LogoMark animated className="size-20 animate-reveal" />
        <span
          className="font-display text-5xl font-black lowercase tracking-tight animate-reveal"
          style={{ animationDelay: ".2s" }}
        >
          lahza
        </span>
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-foreground/15 to-transparent"
          style={{ animation: `sweep 1.1s ease ${state === "fast" ? 0.1 : 0.7}s both` }}
        />
        <svg width="160" height="2" className="overflow-visible">
          <line
            x1="0" y1="1" x2="160" y2="1"
            className="stroke-primary" strokeWidth="2" strokeDasharray="200"
            style={{ animation: `draw .8s ease ${state === "fast" ? 0.2 : 1.1}s both` }}
          />
        </svg>
      </div>
    </div>
  );
}
