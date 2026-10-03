import { cn } from "@/lib/utils";

export function LogoMark({ className, animated }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={cn("size-8", className)} aria-hidden>
      <g
        className={cn("stroke-primary", animated && "animate-dash")}
        strokeWidth="4"
        strokeDasharray="8 7"
        fill="none"
      >
        <path d="M50 12 L84 46 L50 82 L16 46 Z" />
      </g>
      <circle cx="50" cy="12" r="8" className="fill-node" />
      <circle cx="50" cy="82" r="8" className="fill-node" />
      <circle cx="16" cy="46" r="11" className="fill-primary" />
      <circle cx="84" cy="46" r="14" className="fill-primary" />
      <circle cx="84" cy="46" r="6" className="fill-primary-foreground/40" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="size-7" />
      <span className="font-display text-xl font-black lowercase tracking-tight">lahza</span>
    </span>
  );
}
