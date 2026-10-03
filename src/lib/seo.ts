// Per-page head metadata. Canonical/og:url are only emitted when VITE_SITE_URL is set,
// so no domain is ever guessed.
const SITE_URL = (import.meta.env["VITE_SITE_URL"] as string | undefined)?.replace(/\/$/, "");

export function pageHead({ title, description, path }: { title: string; description: string; path: string }) {
  const url = SITE_URL ? `${SITE_URL}${path}` : undefined;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      ...(url ? [{ property: "og:url", content: url }] : []),
    ],
    links: url ? [{ rel: "canonical", href: url }] : [],
  };
}
