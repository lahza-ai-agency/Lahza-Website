// Single source of truth for Lahza company + contact details.
export const BRAND = {
  name: "Lahza",
  tagline: "Building Intelligent Systems That Move Businesses Forward",
  positioning: "AI • Automation • Web Technology",
  description:
    "Lahza helps businesses save time and scale faster through AI automation — custom chatbots, AI agents, business automation and smart websites built around how you already work.",
  phone: "+20 150 759 1817",
  phoneHref: "tel:+201507591817",
  whatsappHref: "https://wa.me/201507591817",
  email: "lahza.ai.agency@gmail.com",
  emailHref: "mailto:lahza.ai.agency@gmail.com",
  location: "Remote-first, worldwide",
} as const;

export const NAV = [
  ["Services", "/services"],
  ["Pricing", "/pricing"],
  ["Case Studies", "/case-studies/assiut-real-estate"],
  ["About", "/about"],
  ["Contact", "/contact"],
] as const;

export const SERVICE_NAMES = [
  "AI Automation",
  "AI Chatbots",
  "AI Agents",
  "Facebook Groups Auto-Poster",
  "Lead Qualification",
  "Business Platforms & CRM",
  "Smart Websites",
] as const;
