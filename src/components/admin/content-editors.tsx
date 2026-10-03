import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_CONTENT, resetContent, saveContent, useContent, type BrandContent, type ContentKey, type PagesContent, type PlanItem, type PricingContent, type ServiceItem, type SiteContent } from "@/lib/content";
import { SERVICE_ICON_NAMES } from "@/lib/icons";
import { btnDanger, btnGhost, btnPrimary, Card, errMsg, Field, inputCls, move, PairList, RowTools, StringList, TextField } from "./ui";
import { cn } from "@/lib/utils";

const SUBS = [["brand", "Brand & contact"], ["pricing", "Pricing"], ["services", "Services"], ["pages", "Page text"]] as const;
export type ContentSub = (typeof SUBS)[number][0];
export const isSub = (s: unknown): s is ContentSub => SUBS.some(([k]) => k === s);

export function ContentManager({ sub }: { sub: ContentSub }) {
  return (
    <div className="space-y-5">
      <nav aria-label="Content sections" className="flex flex-wrap gap-2">
        {SUBS.map(([k, l]) => <Link key={k} to="/admin" search={{ tab: "content", sub: k }} className={cn("rounded-full border px-4 py-1.5 text-xs font-semibold", sub === k ? "border-primary/60 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>{l}</Link>)}
      </nav>
      {/* key remounts the editor (fresh draft) whenever the section changes */}
      {sub === "brand" && <BrandEditor key="brand" />}
      {sub === "pricing" && <PricingEditor key="pricing" />}
      {sub === "services" && <ServicesEditor key="services" />}
      {sub === "pages" && <PagesEditor key="pages" />}
    </div>
  );
}

/** Shared draft/save/reset logic for one content key. */
function useDraft<K extends ContentKey>(key: K, clean: (d: SiteContent[K]) => SiteContent[K]) {
  const qc = useQueryClient();
  const current = useContent()[key];
  const [draft, setDraft] = useState<SiteContent[K]>(() => structuredClone(current));
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try { const c = clean(draft); await saveContent(key, c); setDraft(structuredClone(c)); await qc.invalidateQueries({ queryKey: ["site-content"] }); toast.success("Saved — the website is updated"); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const reset = async () => {
    if (!window.confirm("Discard all saved changes for this section and go back to the original text?")) return;
    setBusy(true);
    try { await resetContent(key); setDraft(structuredClone(DEFAULT_CONTENT[key])); await qc.invalidateQueries({ queryKey: ["site-content"] }); toast.success("Restored the original content"); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return { draft, setDraft, busy, save, reset };
}

const SaveBar = ({ busy, save, reset, extra }: { busy: boolean; save: () => void; reset: () => void; extra?: ReactNode }) => (
  <div className="sticky bottom-3 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 border border-border bg-background/95 p-3 backdrop-blur">
    <div className="text-xs text-muted-foreground">{extra ?? "Changes go live on the website as soon as you save."}</div>
    <div className="flex gap-2"><button type="button" disabled={busy} onClick={reset} className={btnDanger}>Restore original</button><button type="button" disabled={busy} onClick={save} className={btnPrimary}>{busy ? "Saving…" : "Save changes"}</button></div>
  </div>
);

const cleanStrs = (a: string[]) => a.map((x) => x.trim()).filter(Boolean);
const cleanPairs = (a: { title: string; text: string }[]) => a.map((p) => ({ title: p.title.trim(), text: p.text.trim() })).filter((p) => p.title || p.text);

/* ---------------- Brand ---------------- */
function BrandEditor() {
  const { draft, setDraft, busy, save, reset } = useDraft("brand", (b): BrandContent => {
    if (!/^\S+@\S+\.\S+$/.test(b.email.trim())) throw new Error("Enter a valid email address.");
    if (b.whatsapp.replace(/\D/g, "").length < 8) throw new Error("WhatsApp number must include the country code (digits only).");
    if (b.phone.replace(/\D/g, "").length < 8) throw new Error("Enter a valid phone number.");
    return { ...b, tagline: b.tagline.trim(), positioning: b.positioning.trim(), description: b.description.trim(), phone: b.phone.trim(), whatsapp: b.whatsapp.replace(/\D/g, ""), email: b.email.trim(), location: b.location.trim() };
  });
  const set = (k: keyof BrandContent) => (v: string) => setDraft((d) => ({ ...d, [k]: v }));
  return (
    <Card title="Brand & contact details">
      <p className="mb-5 text-sm text-muted-foreground">Used in the header area, footer, contact page, homepage hero and the About page.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Tagline" value={draft.tagline} onChange={set("tagline")} className="sm:col-span-2" />
        <TextField label="Positioning line" value={draft.positioning} onChange={set("positioning")} hint="Small badge on the homepage hero." />
        <TextField label="Location" value={draft.location} onChange={set("location")} />
        <TextField label="Description" area rows={4} value={draft.description} onChange={set("description")} className="sm:col-span-2" hint="Shown in the hero, footer and About page." />
        <TextField label="Email" type="email" value={draft.email} onChange={set("email")} />
        <TextField label="Phone (display)" value={draft.phone} onChange={set("phone")} hint="e.g. +20 150 759 1817 — also used for the call link." />
        <TextField label="WhatsApp number" value={draft.whatsapp} onChange={set("whatsapp")} hint="Digits only with country code, e.g. 201507591817." />
      </div>
      <SaveBar busy={busy} save={save} reset={reset} />
    </Card>
  );
}

/* ---------------- Pricing ---------------- */
function PricingEditor() {
  const { draft, setDraft, busy, save, reset } = useDraft("pricing", (p): PricingContent => {
    const plans = p.plans.map((x) => ({ ...x, name: x.name.trim(), price: x.price.trim(), audience: x.audience.trim(), features: cleanStrs(x.features) })).filter((x) => x.name);
    if (plans.some((x) => !x.price)) throw new Error("Every package needs a price.");
    return { ...p, currency: p.currency.trim(), period: p.period.trim(), setupNote: p.setupNote.trim(), customTitle: p.customTitle.trim(), customText: p.customText.trim(), plans };
  });
  const setP = (i: number, patch: Partial<PlanItem>) => setDraft((d) => ({ ...d, plans: d.plans.map((p, k) => (k === i ? { ...p, ...patch } : p)) }));
  return (
    <div className="space-y-5">
      <Card title="Pricing settings">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Currency" value={draft.currency} onChange={(v) => setDraft((d) => ({ ...d, currency: v }))} />
          <TextField label="Billing period" value={draft.period} onChange={(v) => setDraft((d) => ({ ...d, period: v }))} hint="Shown as “EGP / month”." />
          <TextField label="Note under the packages" area value={draft.setupNote} onChange={(v) => setDraft((d) => ({ ...d, setupNote: v }))} className="sm:col-span-2" hint="Leave empty to hide it." />
          <TextField label="Custom plan — title" value={draft.customTitle} onChange={(v) => setDraft((d) => ({ ...d, customTitle: v }))} />
          <TextField label="Custom plan — text" area value={draft.customText} onChange={(v) => setDraft((d) => ({ ...d, customText: v }))} />
        </div>
      </Card>
      {draft.plans.map((p, i) => (
        <Card key={i} title={p.name || `Package ${i + 1}`} actions={<RowTools i={i} n={draft.plans.length} onMove={(d) => setDraft((x) => ({ ...x, plans: move(x.plans, i, d) }))} onRemove={() => window.confirm("Remove this package?") && setDraft((x) => ({ ...x, plans: x.plans.filter((_, k) => k !== i) }))} />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Name" value={p.name} onChange={(v) => setP(i, { name: v })} />
            <TextField label={`Price (${draft.currency} / ${draft.period})`} value={p.price} onChange={(v) => setP(i, { price: v })} hint="Text, e.g. 9,900" />
            <TextField label="Who it's for" area value={p.audience} onChange={(v) => setP(i, { audience: v })} className="sm:col-span-2" />
            <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={p.popular} onChange={(e) => setP(i, { popular: e.target.checked })} className="size-4 accent-[var(--primary)]" />Mark as “Most popular”</label>
            <div className="sm:col-span-2"><StringList label="Features" value={p.features} onChange={(v) => setP(i, { features: v })} addLabel="Add feature" /></div>
          </div>
        </Card>
      ))}
      <button type="button" onClick={() => setDraft((d) => ({ ...d, plans: [...d.plans, { name: "", price: "", audience: "", features: [], popular: false }] }))} className={btnGhost}><Plus className="size-3.5" />Add package</button>
      <SaveBar busy={busy} save={save} reset={reset} />
    </div>
  );
}

/* ---------------- Services ---------------- */
function ServicesEditor() {
  const { draft, setDraft, busy, save, reset } = useDraft("services", (list): ServiceItem[] => {
    const out = list.map((s) => ({ ...s, title: s.title.trim(), text: s.text.trim(), detail: s.detail.trim(), intro: s.intro.trim(), benefits: cleanStrs(s.benefits), useCases: cleanStrs(s.useCases) })).filter((s) => s.title);
    if (new Set(out.map((s) => s.title.toLowerCase())).size !== out.length) throw new Error("Service titles must be unique.");
    return out;
  });
  const setS = (i: number, patch: Partial<ServiceItem>) => setDraft((d) => d.map((s, k) => (k === i ? { ...s, ...patch } : s)));
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">These appear on the homepage, the Services page, the footer and the contact form's “Service needed” list.</p>
      {draft.map((s, i) => (
        <Card key={i} title={s.title || `Service ${i + 1}`} actions={<RowTools i={i} n={draft.length} onMove={(d) => setDraft((x) => move(x, i, d))} onRemove={() => window.confirm("Remove this service?") && setDraft((x) => x.filter((_, k) => k !== i))} />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Title" value={s.title} onChange={(v) => setS(i, { title: v })} />
            <Field label="Icon">{(id) => <select id={id} value={s.icon} onChange={(e) => setS(i, { icon: e.target.value })} className={inputCls}>{SERVICE_ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}</select>}</Field>
            <TextField label="Short description" area value={s.text} onChange={(v) => setS(i, { text: v })} className="sm:col-span-2" hint="Shown on the card." />
            <TextField label="Card detail (when expanded)" area value={s.detail} onChange={(v) => setS(i, { detail: v })} className="sm:col-span-2" />
            <TextField label="Services page — introduction" area rows={4} value={s.intro} onChange={(v) => setS(i, { intro: v })} className="sm:col-span-2" />
            <StringList label="Benefits" value={s.benefits} onChange={(v) => setS(i, { benefits: v })} />
            <StringList label="Example use cases" value={s.useCases} onChange={(v) => setS(i, { useCases: v })} />
          </div>
        </Card>
      ))}
      <button type="button" onClick={() => setDraft((d) => [...d, { icon: "Sparkles", title: "", text: "", detail: "", intro: "", benefits: [], useCases: [] }])} className={btnGhost}><Plus className="size-3.5" />Add service</button>
      <SaveBar busy={busy} save={save} reset={reset} />
    </div>
  );
}

/* ---------------- Page text ---------------- */
function PagesEditor() {
  const { draft, setDraft, busy, save, reset } = useDraft("pages", (p): PagesContent => ({
    ...p, heroHeadline: p.heroHeadline.trim(), heroHighlight: p.heroHighlight.trim(), aboutWhatWeDo: p.aboutWhatWeDo.trim(), aboutWhyAutomate: p.aboutWhyAutomate.trim(), caseSummary: p.caseSummary.trim(), caseProblem: p.caseProblem.trim(),
    reasons: cleanPairs(p.reasons), steps: cleanPairs(p.steps), principles: cleanPairs(p.principles), caseWorkflow: cleanPairs(p.caseWorkflow), caseTags: cleanStrs(p.caseTags), caseBenefits: cleanStrs(p.caseBenefits),
  }));
  const set = <K extends keyof PagesContent>(k: K) => (v: PagesContent[K]) => setDraft((d) => ({ ...d, [k]: v }));
  return (
    <div className="space-y-5">
      <Card title="Homepage">
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2"><TextField label="Hero headline" value={draft.heroHeadline} onChange={set("heroHeadline")} /><TextField label="Hero headline — highlighted part" value={draft.heroHighlight} onChange={set("heroHighlight")} /></div>
          <PairList label="“Why Lahza” cards" value={draft.reasons} onChange={set("reasons")} />
          <PairList label="“How Lahza works” steps" value={draft.steps} onChange={set("steps")} addLabel="Add step" />
        </div>
      </Card>
      <Card title="About page">
        <div className="grid gap-4">
          <TextField label="What we do" area rows={4} value={draft.aboutWhatWeDo} onChange={set("aboutWhatWeDo")} />
          <TextField label="Why businesses automate" area rows={4} value={draft.aboutWhyAutomate} onChange={set("aboutWhyAutomate")} />
          <PairList label="How we work" value={draft.principles} onChange={set("principles")} />
        </div>
      </Card>
      <Card title="Case study — Assiut Real Estate">
        <div className="grid gap-4">
          <TextField label="Summary" area value={draft.caseSummary} onChange={set("caseSummary")} />
          <TextField label="The problem" area rows={4} value={draft.caseProblem} onChange={set("caseProblem")} />
          <StringList label="Tags" value={draft.caseTags} onChange={set("caseTags")} addLabel="Add tag" />
          <PairList label="Workflow steps" value={draft.caseWorkflow} onChange={set("caseWorkflow")} addLabel="Add step" />
          <StringList label="Results / benefits" value={draft.caseBenefits} onChange={set("caseBenefits")} addLabel="Add benefit" />
        </div>
      </Card>
      <SaveBar busy={busy} save={save} reset={reset} />
    </div>
  );
}
