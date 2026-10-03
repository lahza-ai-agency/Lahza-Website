import { useId, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Pair } from "@/lib/content";

export const inputCls = "w-full border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60";
export const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60";
export const btnGhost = "inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider transition hover:border-primary/60 disabled:opacity-60";
export const btnDanger = "inline-flex items-center justify-center gap-2 rounded-full border border-destructive/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-destructive transition hover:bg-destructive/10 disabled:opacity-60";
export const errMsg = (e: unknown) => (e instanceof Error && e.message ? e.message : "Something went wrong. Please try again.");
export const fmtDate = (d: string | null | undefined) => (d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—");

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return <div role="status" className="flex items-center gap-2 py-6 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" aria-hidden />{label}</div>;
}
export function ErrorBox({ error, retry }: { error?: unknown; retry?: () => unknown }) {
  return <p role="alert" className="border border-destructive/40 bg-destructive/10 p-4 text-sm">{errMsg(error)} {retry && <button type="button" onClick={() => retry()} className="text-primary underline">Try again</button>}</p>;
}
export const Empty = ({ children }: { children: ReactNode }) => <p className="border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{children}</p>;

export function Card({ title, actions, children, className }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("border border-border bg-card/70 p-5 sm:p-6", className)}>
      {(title || actions) && <div className="mb-4 flex flex-wrap items-center justify-between gap-3">{title && <h2 className="font-display text-lg font-black uppercase">{title}</h2>}{actions}</div>}
      {children}
    </section>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: (id: string) => ReactNode; className?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      {children(id)}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextField({ label, value, onChange, hint, type = "text", area, rows = 3, className, required }: { label: string; value: string; onChange: (v: string) => void; hint?: string; type?: string; area?: boolean; rows?: number; className?: string; required?: boolean }) {
  return (
    <Field label={label} {...(hint ? { hint } : {})} {...(className ? { className } : {})}>
      {(id) => area
        ? <textarea id={id} rows={rows} value={value} required={!!required} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "resize-y")} />
        : <input id={id} type={type} value={value} required={!!required} onChange={(e) => onChange(e.target.value)} className={inputCls} />}
    </Field>
  );
}

export function Modal({ open, onClose, title, description, children }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto border-border bg-card">
        <DialogHeader><DialogTitle className="font-display text-xl font-black uppercase">{title}</DialogTitle><DialogDescription className={description ? undefined : "sr-only"}>{description ?? title}</DialogDescription></DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

const move = <T,>(arr: T[], i: number, d: -1 | 1): T[] => { const j = i + d; if (j < 0 || j >= arr.length) return arr; const c = [...arr]; [c[i], c[j]] = [c[j] as T, c[i] as T]; return c; };
export const RowTools = ({ i, n, onMove, onRemove }: { i: number; n: number; onMove: (d: -1 | 1) => void; onRemove: () => void }) => (
  <div className="flex shrink-0 gap-1">
    <button type="button" disabled={i === 0} onClick={() => onMove(-1)} aria-label="Move up" className="border border-border p-1.5 hover:border-primary/60 disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
    <button type="button" disabled={i === n - 1} onClick={() => onMove(1)} aria-label="Move down" className="border border-border p-1.5 hover:border-primary/60 disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
    <button type="button" onClick={onRemove} aria-label="Remove" className="border border-destructive/50 p-1.5 text-destructive hover:bg-destructive/10"><X className="size-3.5" /></button>
  </div>
);
export { move };

/** Editable list of single-line strings (features, tags, benefits…). */
export function StringList({ label, value, onChange, addLabel = "Add item" }: { label: string; value: string[]; onChange: (v: string[]) => void; addLabel?: string }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <ul className="space-y-2">
        {value.map((v, i) => (
          <li key={i} className="flex gap-2">
            <input aria-label={`${label} ${i + 1}`} value={v} onChange={(e) => onChange(value.map((x, k) => (k === i ? e.target.value : x)))} className={inputCls} />
            <RowTools i={i} n={value.length} onMove={(d) => onChange(move(value, i, d))} onRemove={() => onChange(value.filter((_, k) => k !== i))} />
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => onChange([...value, ""])} className={cn(btnGhost, "mt-2")}><Plus className="size-3.5" />{addLabel}</button>
    </div>
  );
}

/** Editable list of {title, text} blocks. */
export function PairList({ label, value, onChange, addLabel = "Add block" }: { label: string; value: Pair[]; onChange: (v: Pair[]) => void; addLabel?: string }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <ul className="space-y-3">
        {value.map((p, i) => (
          <li key={i} className="flex gap-2 border border-border p-3">
            <div className="grid flex-1 gap-2">
              <input aria-label={`${label} ${i + 1} title`} placeholder="Title" value={p.title} onChange={(e) => onChange(value.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)))} className={inputCls} />
              <textarea aria-label={`${label} ${i + 1} text`} placeholder="Text" rows={2} value={p.text} onChange={(e) => onChange(value.map((x, k) => (k === i ? { ...x, text: e.target.value } : x)))} className={cn(inputCls, "resize-y")} />
            </div>
            <RowTools i={i} n={value.length} onMove={(d) => onChange(move(value, i, d))} onRemove={() => onChange(value.filter((_, k) => k !== i))} />
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => onChange([...value, { title: "", text: "" }])} className={cn(btnGhost, "mt-2")}><Plus className="size-3.5" />{addLabel}</button>
    </div>
  );
}
