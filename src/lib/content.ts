import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { BRAND } from "./brand";
import { CUSTOM_PLAN, plans as DEFAULT_PLANS, PRICING_CURRENCY, PRICING_PERIOD, SETUP_NOTE } from "./pricing";
import { SERVICE_EXTRA } from "./services-extra";

/* ------------------------------------------------------------------ *
 * Editable site content. Defaults live in code; anything an admin saves
 * from /admin is stored in public.site_content and merged over them, so
 * the site always renders even if the table is empty or unreachable.
 * ------------------------------------------------------------------ */

export type Pair = { title: string; text: string };
export type BrandContent = { tagline: string; positioning: string; description: string; phone: string; whatsapp: string; email: string; location: string };
export type PlanItem = { name: string; price: string; audience: string; features: string[]; popular: boolean };
export type PricingContent = { currency: string; period: string; setupNote: string; customTitle: string; customText: string; plans: PlanItem[] };
export type ServiceItem = { icon: string; title: string; text: string; detail: string; intro: string; benefits: string[]; useCases: string[] };
export type PagesContent = {
  heroHeadline: string; heroHighlight: string; reasons: Pair[]; steps: Pair[];
  aboutWhatWeDo: string; aboutWhyAutomate: string; principles: Pair[];
  caseSummary: string; caseProblem: string; caseTags: string[]; caseWorkflow: Pair[]; caseBenefits: string[];
};
export type SiteContent = { brand: BrandContent; pricing: PricingContent; services: ServiceItem[]; pages: PagesContent };
export type ContentKey = keyof SiteContent;
export const CONTENT_KEYS: readonly ContentKey[] = ["brand", "pricing", "services", "pages"];

const digits = (s: string) => s.replace(/\D/g, "");

const svc = (icon: string, title: string, text: string, detail: string): ServiceItem => {
  const x = SERVICE_EXTRA[title];
  return { icon, title, text, detail, intro: x?.intro ?? detail, benefits: [...(x?.benefits ?? [])], useCases: [...(x?.useCases ?? [])] };
};

export const DEFAULT_CONTENT: SiteContent = {
  brand: {
    tagline: BRAND.tagline, positioning: BRAND.positioning, description: BRAND.description,
    phone: BRAND.phone, whatsapp: digits(BRAND.whatsappHref), email: BRAND.email, location: BRAND.location,
  },
  pricing: {
    currency: PRICING_CURRENCY, period: PRICING_PERIOD, setupNote: SETUP_NOTE, customTitle: CUSTOM_PLAN.title, customText: CUSTOM_PLAN.text,
    plans: DEFAULT_PLANS.map((p) => ({ name: p.name, price: p.price, audience: p.audience, features: [...p.features], popular: !!p.popular })),
  },
  services: [
    svc("Bot", "AI Automation", "Automate repetitive operations with intelligent workflows.", "Data entry, follow-ups, internal operations and reporting — so your team can focus on higher-value work."),
    svc("MessageSquare", "AI Chatbots", "WhatsApp, Messenger and website bots that work around the clock.", "Answer questions, collect customer details, qualify requests and book appointments."),
    svc("BrainCircuit", "AI Agents", "Agents connected to your business data that act, not just chat.", "Support agents, internal knowledge assistants and systems that create useful output from your real data."),
    svc("Facebook", "Facebook Groups Auto-Poster", "Publish prepared content across Facebook groups automatically.", "Captions generated, images selected and posts published on schedule without manual posting."),
    svc("Filter", "Lead Qualification", "Qualify and organize inquiries automatically before your team responds.", "Lead collection, AI scoring, enrichment and pipeline automation."),
    svc("LayoutGrid", "Business Platforms & CRM", "Custom operations tools built around your workflow.", "CRMs, dashboards, client portals and billing connected to your projects."),
    svc("Globe", "Smart Websites", "Modern websites and web apps connected to automation.", "Custom websites and web apps wired into chatbots, CRM systems and workflows."),
    svc("Workflow", "Process Optimization", "Turn manual work into scalable automated systems.", "We map how you work today and rebuild the slow parts as connected automations and integrations."),
  ],
  pages: {
    heroHeadline: "Intelligent systems that", heroHighlight: "move your business.",
    reasons: [
      { title: "Built around your workflow", text: "We adapt to how you already work instead of forcing a generic tool on you." },
      { title: "Connected, not isolated", text: "Chats, data, websites and publishing share the same information." },
      { title: "Honest scope", text: "We describe what a system does and doesn't do. No inflated promises." },
    ],
    steps: [
      { title: "Discover", text: "We learn how your business works today and where time is lost." },
      { title: "Map", text: "We document the workflow and pick the processes worth automating first." },
      { title: "Design", text: "We plan the chatbots, agents and integrations around your tools." },
      { title: "Build", text: "We build and connect the system to your data and channels." },
      { title: "Launch", text: "We test it with real cases and go live with your team." },
      { title: "Improve", text: "We review how it runs and extend it step by step." },
    ],
    aboutWhatWeDo: "Lahza designs and builds AI chatbots, AI agents, lead qualification, business automation, custom platforms and smart websites. Our work centers on one idea: your team's time is best spent on work that needs a person.",
    aboutWhyAutomate: "Repetitive tasks such as answering the same questions, copying data between tools and chasing follow-ups add up. Automating them means customers hear back sooner, information stays consistent and your team has room for higher-value work.",
    principles: [
      { title: "Start from your workflow", text: "We learn how your business already works before proposing anything, and build around it rather than replacing it." },
      { title: "Automate the repetitive", text: "AI and automation handle the routine steps. People keep the decisions, relationships and exceptions." },
      { title: "Connect the pieces", text: "Chats, websites, databases and publishing tools are wired together so information moves without re-typing." },
      { title: "Grow in steps", text: "Start with the process that costs the most effort, prove it works, then extend to the next one." },
    ],
    caseSummary: "A connected AI ecosystem where chat, data, publishing, automated responses and appointments work together as one system.",
    caseProblem: "A real estate business has to promote many listings, answer the same questions again and again, and keep track of customer inquiries and viewings. Doing that by hand across Facebook, chats and spreadsheets is slow and easy to get inconsistent.",
    caseTags: ["AI Chatbot", "AI Agent", "Database", "Facebook Automation", "Content Generation", "Appointment Booking"],
    caseWorkflow: [
      { title: "Listings in a database", text: "Property listings and their details are kept in one structured database instead of scattered messages and files." },
      { title: "AI-generated captions", text: "From each listing's data, AI drafts a caption for the post, so no one writes the same description by hand." },
      { title: "Image selection", text: "The matching images for the listing are picked and attached to the post." },
      { title: "Scheduled Facebook publishing", text: "Prepared posts are published to Facebook groups on a schedule, without manual posting." },
      { title: "Chat and appointments", text: "A chatbot and AI agent answer inquiries, collect customer details and handle appointment requests using the same data." },
    ],
    caseBenefits: ["Less repetitive posting and caption writing", "One source of truth for listings across chat and publishing", "Faster, more consistent replies to inquiries", "Customer details and appointment requests captured in an organized way"],
  },
};

/* ---------------- tolerant parsing of whatever is stored ---------------- */
type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, d: string) => (typeof v === "string" ? v : d);
const strs = (v: unknown, d: readonly string[]) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [...d]);
const pairs = (v: unknown, d: readonly Pair[]): Pair[] => (Array.isArray(v) ? v.filter(isObj).map((x) => ({ title: str(x["title"], ""), text: str(x["text"], "") })) : d.map((p) => ({ ...p })));

function parseBrand(v: unknown): BrandContent {
  const d = DEFAULT_CONTENT.brand;
  if (!isObj(v)) return d;
  return { tagline: str(v["tagline"], d.tagline), positioning: str(v["positioning"], d.positioning), description: str(v["description"], d.description), phone: str(v["phone"], d.phone), whatsapp: digits(str(v["whatsapp"], d.whatsapp)), email: str(v["email"], d.email), location: str(v["location"], d.location) };
}
function parsePricing(v: unknown): PricingContent {
  const d = DEFAULT_CONTENT.pricing;
  if (!isObj(v)) return d;
  const plans = Array.isArray(v["plans"]) ? v["plans"].filter(isObj).map((p): PlanItem => ({ name: str(p["name"], ""), price: str(p["price"], ""), audience: str(p["audience"], ""), features: strs(p["features"], []), popular: p["popular"] === true })) : d.plans;
  return { currency: str(v["currency"], d.currency), period: str(v["period"], d.period), setupNote: str(v["setupNote"], d.setupNote), customTitle: str(v["customTitle"], d.customTitle), customText: str(v["customText"], d.customText), plans };
}
function parseServices(v: unknown): ServiceItem[] {
  if (!Array.isArray(v)) return DEFAULT_CONTENT.services;
  return v.filter(isObj).map((s): ServiceItem => ({ icon: str(s["icon"], "Bot"), title: str(s["title"], ""), text: str(s["text"], ""), detail: str(s["detail"], ""), intro: str(s["intro"], ""), benefits: strs(s["benefits"], []), useCases: strs(s["useCases"], []) }));
}
function parsePages(v: unknown): PagesContent {
  const d = DEFAULT_CONTENT.pages;
  if (!isObj(v)) return d;
  return {
    heroHeadline: str(v["heroHeadline"], d.heroHeadline), heroHighlight: str(v["heroHighlight"], d.heroHighlight),
    reasons: pairs(v["reasons"], d.reasons), steps: pairs(v["steps"], d.steps),
    aboutWhatWeDo: str(v["aboutWhatWeDo"], d.aboutWhatWeDo), aboutWhyAutomate: str(v["aboutWhyAutomate"], d.aboutWhyAutomate), principles: pairs(v["principles"], d.principles),
    caseSummary: str(v["caseSummary"], d.caseSummary), caseProblem: str(v["caseProblem"], d.caseProblem), caseTags: strs(v["caseTags"], d.caseTags),
    caseWorkflow: pairs(v["caseWorkflow"], d.caseWorkflow), caseBenefits: strs(v["caseBenefits"], d.caseBenefits),
  };
}

export function mergeContent(rows: readonly { key: string; value: unknown }[]): SiteContent {
  const by = new Map(rows.map((r) => [r.key, r.value] as const));
  return {
    brand: by.has("brand") ? parseBrand(by.get("brand")) : DEFAULT_CONTENT.brand,
    pricing: by.has("pricing") ? parsePricing(by.get("pricing")) : DEFAULT_CONTENT.pricing,
    services: by.has("services") ? parseServices(by.get("services")) : DEFAULT_CONTENT.services,
    pages: by.has("pages") ? parsePages(by.get("pages")) : DEFAULT_CONTENT.pages,
  };
}

export function brandLinks(b: BrandContent) {
  const tel = digits(b.phone);
  return {
    ...b, name: BRAND.name,
    phoneHref: `tel:+${tel}`, emailHref: `mailto:${b.email}`, whatsappHref: `https://wa.me/${digits(b.whatsapp)}`,
  };
}

/* ---------------- data access ---------------- */
async function fetchContent(): Promise<SiteContent> {
  try {
    const { data, error } = await supabase.from("site_content").select("key, value");
    if (error) throw error;
    return mergeContent(data ?? []);
  } catch (e) {
    console.error("[content] using built-in defaults", e);
    return DEFAULT_CONTENT;
  }
}

export const contentQuery = queryOptions({ queryKey: ["site-content"], queryFn: fetchContent, staleTime: 30_000 });

export const useContent = (): SiteContent => useQuery(contentQuery).data ?? DEFAULT_CONTENT;
export const useBrand = () => brandLinks(useContent().brand);

/** Admin only (enforced by RLS). */
export async function saveContent<K extends ContentKey>(key: K, value: SiteContent[K]) {
  const { error } = await supabase.from("site_content").upsert({ key, value: value as unknown as Json, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}
export async function resetContent(key: ContentKey) {
  const { error } = await supabase.from("site_content").delete().eq("key", key);
  if (error) throw new Error(error.message);
}
