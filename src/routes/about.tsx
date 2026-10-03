import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SectionHead, SiteShell } from "@/components/site/shell";
import { CtaBand } from "@/components/site/cta";
import { useBrand, useContent } from "@/lib/content";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => pageHead({ title: "About — Lahza", description: "Lahza builds AI automation, chatbots, agents and smart web systems that help businesses save time and scale. Learn how we work.", path: "/about" }),
  component: AboutPage,
});

function AboutPage() {
  const BRAND = useBrand();
  const { pages } = useContent();
  return (
    <SiteShell>
      <PageHero eyebrow="About Lahza" title={<>Intelligent systems for <span className="text-primary">real businesses.</span></>} text={BRAND.description} />
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-2">
        <div>
          <SectionHead eyebrow="What we do" title="AI, automation and web technology" />
          <p className="mt-6 text-muted-foreground">{pages.aboutWhatWeDo}</p>
        </div>
        <div>
          <SectionHead eyebrow="Why businesses automate" title="Less manual work, faster response" />
          <p className="mt-6 text-muted-foreground">{pages.aboutWhyAutomate}</p>
        </div>
      </section>
      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <SectionHead eyebrow="Our approach" title="How we work" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {pages.principles.map(({ title: t, text: d }, i) => (
              <div key={t + i} className="border border-border bg-card/70 p-6">
                <div className="eyebrow text-primary">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="mt-3 font-display text-lg font-black uppercase">{t}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaBand title="Let's look at your workflow." text="Tell us what takes up your team's time and we'll show where automation can help." />
    </SiteShell>
  );
}
