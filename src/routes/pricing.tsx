import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteShell } from "@/components/site/shell";
import { CtaBand } from "@/components/site/cta";
import { PricingGrid, SetupNote } from "@/components/site/sections";
import { useContent } from "@/lib/content";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/pricing")({
  head: () => pageHead({ title: "Pricing — Lahza", description: "Lahza AI automation packages: Starter, Growth and Pro, plus custom automation systems scoped around your business.", path: "/pricing" }),
  component: PricingPage,
});

function PricingPage() {
  const { pricing } = useContent();
  return (
    <SiteShell>
      <PageHero eyebrow="Pricing" title={<>AI automation <span className="text-primary">packages.</span></>} text="Choose the level of automation your business needs. Each package lists what it includes and who it's for." />
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <PricingGrid />
        <SetupNote />
        <div className="mt-10 border border-dashed border-border bg-card/40 p-6 sm:p-8">
          <h2 className="font-display text-xl font-black uppercase">{pricing.customTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{pricing.customText}</p>
        </div>
      </section>
      <CtaBand title="Not sure which package fits?" text="Tell us about your business and we'll recommend a starting point." interest="Not sure yet" />
    </SiteShell>
  );
}
