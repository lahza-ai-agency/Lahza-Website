import { describe, expect, it } from "vitest";
import { brandLinks, DEFAULT_CONTENT, mergeContent } from "@/lib/content";
import { serviceOptions } from "@/lib/contact";

describe("site content merge", () => {
  it("returns the built-in defaults when nothing is stored", () => {
    expect(mergeContent([])).toEqual(DEFAULT_CONTENT);
  });
  it("applies saved values over the defaults", () => {
    const c = mergeContent([{ key: "brand", value: { email: "hello@example.com", whatsapp: "+20 100 000 0000" } }]);
    expect(c.brand.email).toBe("hello@example.com");
    expect(c.brand.whatsapp).toBe("201000000000");
    expect(c.brand.tagline).toBe(DEFAULT_CONTENT.brand.tagline);
  });
  it("ignores malformed rows instead of crashing", () => {
    const c = mergeContent([{ key: "services", value: "nope" }, { key: "pricing", value: 42 }, { key: "pages", value: null }]);
    expect(c).toEqual(DEFAULT_CONTENT);
  });
  it("lets an admin remove every package", () => {
    expect(mergeContent([{ key: "pricing", value: { plans: [] } }]).pricing.plans).toEqual([]);
  });
  it("derives links from the saved details", () => {
    const b = brandLinks({ ...DEFAULT_CONTENT.brand, phone: "+20 150 759 1817", whatsapp: "201507591817", email: "a@b.co" });
    expect(b.phoneHref).toBe("tel:+201507591817");
    expect(b.whatsappHref).toBe("https://wa.me/201507591817");
    expect(b.emailHref).toBe("mailto:a@b.co");
  });
  it("builds contact-form options from services and packages", () => {
    const o = serviceOptions(DEFAULT_CONTENT);
    expect(o).toContain("AI Chatbots");
    expect(o).toContain("Growth package");
    expect(o.at(-1)).toBe("Not sure yet");
  });
});
