import { createFileRoute } from "@tanstack/react-router";
import { NotFound } from "@/components/site/not-found";

export const Route = createFileRoute("/404")({
  head: () => ({ meta: [{ title: "Page not found — Lahza" }, { name: "robots", content: "noindex" }] }),
  component: NotFound,
});
