import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { contactSchema } from "@/lib/contact";
import { NAV } from "@/lib/brand";

const ROUTES = ["/", "/services", "/pricing", "/case-studies/assiut-real-estate", "/about", "/contact", "/portal", "/admin", "/404"];
const VALID = new Set(ROUTES);

afterEach(cleanup);

describe("public routes", () => {
  it.each(ROUTES)("%s renders a heading and only links to valid routes", async (path) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() }, history: createMemoryHistory({ initialEntries: [path] }) });
    await router.load();
    const { container } = render(<RouterProvider router={router} />);
    await waitFor(() => expect(container.querySelector("h1")).not.toBeNull(), { timeout: 4000 });
    container.querySelectorAll<HTMLAnchorElement>("a[href^='/']").forEach((a) => {
      const href = (a.getAttribute("href") ?? "").split(/[?#]/)[0] ?? "";
      expect(VALID.has(href), `${path} → ${href}`).toBe(true);
    });
  });
  it("NAV only targets existing routes", () => NAV.forEach(([, h]) => expect(VALID.has(h)).toBe(true)));
});

describe("contact schema", () => {
  const ok = { name: "A", email: "a@b.co", message: "Hello there, please call." };
  it("accepts a valid request", () => expect(contactSchema.safeParse(ok).success).toBe(true));
  it("rejects bad email and short message", () => {
    expect(contactSchema.safeParse({ ...ok, email: "nope" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...ok, message: "hi" }).success).toBe(false);
  });
});
