import { Bot, BrainCircuit, Database, Facebook, Filter, Globe, LayoutGrid, MessageSquare, Rocket, ShieldCheck, Sparkles, Workflow, type LucideIcon } from "lucide-react";

// Icons an admin can pick for a service. The key is what gets stored in the database.
export const SERVICE_ICONS: Record<string, LucideIcon> = {
  Bot, MessageSquare, BrainCircuit, Facebook, Filter, LayoutGrid, Globe, Workflow, Sparkles, Database, Rocket, ShieldCheck,
};
export const SERVICE_ICON_NAMES = Object.keys(SERVICE_ICONS);
export const iconFor = (name: string): LucideIcon => SERVICE_ICONS[name] ?? Bot;
