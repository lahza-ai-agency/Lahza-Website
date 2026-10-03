import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SectionHead, SiteShell } from "@/components/site/shell";
import { CtaBand } from "@/components/site/cta";
import assiutLogo from "@/assets/assiut-logo.jpg";
import { useContent } from "@/lib/content";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/case-studies/assiut-real-estate")({
  head: () => pageHead({ title: "Assiut Real Estate Case Study — Lahza", description: "How Lahza connected a chatbot, AI agent, listings database and Facebook publishing into one automated system for Assiut Real Estate.", path: "/case-studies/assiut-real-estate" }),
  component: CaseStudy,
});

function CaseStudy() {
  const { pages } = useContent();
  const { caseTags: tags, caseWorkflow: workflow, caseBenefits: benefits } = pages;
  return (
    <SiteShell>
      <PageHero eyebrow="Case study" title={<>Assiut <span className="text-primary">Real Estate</span></>} text={pages.caseSummary} />
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="grid overflow-hidden border border-border bg-card/70 lg:grid-cols-[.8fr_1.2fr]">
          <div className="grid min-h-72 place-items-center bg-case-study p-10"><img src={assiutLogo} alt="Assiut Real Estate logo" className="max-h-56 w-auto border border-border" /></div>
          <div className="p-8 lg:p-12">
            <div className="flex flex-wrap gap-2">{tags.map((t) => <span key={t} className="border border-border px-3 py-1 text-[11px] text-muted-foreground">{t}</span>)}</div>
            <h2 className="eyebrow mt-8 text-primary">The problem</h2>
            <p className="mt-3 text-muted-foreground">{pages.caseProblem}</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <SectionHead eyebrow="The workflow" title="From listing to published post" />
        <ol className="mt-10 space-y-4">
          {workflow.map(({ title: t, text: d }, i) => (
            <li key={t + i} className="flex gap-5 border border-border bg-card/70 p-5">
              <span className="font-display text-2xl font-black text-primary">{String(i + 1).padStart(2, "0")}</span>
              <div><h3 className="font-display text-lg font-black uppercase">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{d}</p></div>
            </li>
          ))}
        </ol>
      </section>
      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <SectionHead eyebrow="Results" title="What the system gives the team" text="We don't publish numbers we can't verify, so these are qualitative benefits." />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">{benefits.map((b) => <li key={b} className="border border-border bg-card/70 p-4 text-sm">{b}</li>)}</ul>
        </div>
      </section>
      <CtaBand title="Want a system like this for your business?" text="We'll look at your workflow and suggest what to connect first." interest="AI Automation" />
    </SiteShell>
  );
}
