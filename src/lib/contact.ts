import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { SiteContent } from "@/lib/content";

export const SERVICE_OPTIONS = [
  "AI Automation", "AI Chatbots", "AI Agents", "Facebook Groups Auto-Poster", "Lead Qualification",
  "Business Platforms & CRM", "Smart Websites", "Process Optimization",
  "Starter package", "Growth package", "Pro package", "Not sure yet",
] as const;

/** Dropdown options built from the services and packages currently set in the admin dashboard. */
export const serviceOptions = (c: SiteContent): string[] => [...c.services.map((s) => s.title), ...c.pricing.plans.map((p) => `${p.name} package`), "Not sure yet"];

// Limits mirror the RLS policy on public.contact_requests (name<=120, email<=255, message<=4000).
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120, "Name is too long"),
  email: z.string().trim().min(1, "Please enter your email").max(255, "Email is too long").email("Enter a valid email address"),
  phone: z.string().trim().max(40, "Phone number is too long").regex(/^[+\d\s()-]*$/, "Use digits, spaces, + ( ) - only").optional().or(z.literal("")),
  company: z.string().trim().max(120, "Company name is too long").optional().or(z.literal("")),
  interest: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(4000, "Message is too long (4000 max)"),
});
export type ContactInput = z.infer<typeof contactSchema>;

export type ContactResult = { ok: true } | { ok: false; error: string };

/** Data layer for the contact form. UI never touches Supabase directly. */
export async function submitContactRequest(input: ContactInput): Promise<ContactResult> {
  try {
    const { error } = await supabase.from("contact_requests").insert({
      name: input.name,
      email: input.email,
      message: input.message,
      phone: input.phone || null,
      company: input.company || null,
      interest: input.interest || null,
    });
    if (error) {
      console.error("[contact] insert failed", error.code);
      return { ok: false, error: "We couldn't send your message right now. Please try again, or reach us by email or WhatsApp." };
    }
    return { ok: true };
  } catch (e) {
    console.error("[contact] unavailable", e);
    return { ok: false, error: "The contact service is not available right now. Please email or WhatsApp us instead." };
  }
}
