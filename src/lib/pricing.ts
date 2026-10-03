// Single source of truth for packages. Prices/features are the official values
// that already existed in the project; edit here only.
export const PRICING_CURRENCY = "EGP";
export const PRICING_PERIOD = "month";

export type Plan = {
  name: string;
  price: string;
  audience: string;
  features: readonly string[];
  popular?: boolean;
};

export const plans: readonly Plan[] = [
  { name: "Starter", price: "9,900", audience: "For small companies getting started with AI.", features: ["AI Sales Agent", "Website Chatbot", "WhatsApp or Messenger Bot", "Lead Capture", "Appointment Booking", "Basic CRM Integration", "Basic Dashboard"] },
  { name: "Growth", price: "14,900", audience: "For growing companies automating sales and operations.", features: ["Everything in Starter", "Sales Automation", "Follow-up Automation", "Marketing Automation", "Facebook Auto Posting", "Email Automation", "Advanced Reports"], popular: true },
  { name: "Pro", price: "21,900", audience: "A complete AI-powered automation system for scaling businesses.", features: ["Everything in Growth", "AI Knowledge Assistant", "Business Automation", "Custom Integrations", "Advanced Dashboards", "Priority Support", "Custom AI Solutions"] },
];

// No setup fee is defined in the project; this text is shown instead of a number.
export const SETUP_NOTE = "Setup scope and any one-time costs are confirmed with you after a short consultation.";

export const CUSTOM_PLAN = {
  title: "Need something custom?",
  text: "Pick exactly what you need and we'll scope and price a tailored automation system around your business.",
} as const;
