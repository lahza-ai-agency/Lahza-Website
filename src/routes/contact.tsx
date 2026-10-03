import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Mail, MessageCircle, Phone } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/shell";
import { useBrand, useContent } from "@/lib/content";
import { contactSchema, submitContactRequest, serviceOptions, type ContactInput } from "@/lib/contact";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contact")({
  validateSearch: (s: Record<string, unknown>): { interest?: string } => (typeof s["interest"] === "string" ? { interest: s["interest"] } : {}),
  head: () => pageHead({ title: "Contact — Lahza", description: "Tell Lahza what you'd like to automate. Send a message, email or WhatsApp and we'll come back with a clear next step.", path: "/contact" }),
  component: ContactPage,
});

const field = "mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 aria-[invalid=true]:border-destructive";

function ContactPage() {
  const BRAND = useBrand();
  const content = useContent();
  const options = serviceOptions(content);
  const { interest } = Route.useSearch();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", company: "", interest: interest ?? "", message: "" },
  });

  const onSubmit = async (values: ContactInput) => {
    setServerError(null);
    const res = await submitContactRequest(values);
    if (res.ok) { setSent(true); reset(); } else setServerError(res.error);
  };

  const Err = ({ id, msg }: { id: string; msg?: string | undefined }) => (msg ? <p id={id} role="alert" className="mt-1.5 text-xs text-destructive">{msg}</p> : null);

  return (
    <SiteShell>
      <PageHero eyebrow="Contact" title={<>Let's talk about <span className="text-primary">your business.</span></>} text="Tell us what you'd like to automate. You can also reach us directly by email, phone or WhatsApp." />
      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 lg:grid-cols-[1.4fr_1fr]">
        <div className="border border-border bg-card/70 p-6 sm:p-10">
          {sent ? (
            <div role="status" className="py-10 text-center">
              <CheckCircle2 className="mx-auto size-12 text-primary" aria-hidden />
              <h2 className="text-display mt-5 text-3xl">Message sent</h2>
              <p className="mx-auto mt-3 max-w-sm text-muted-foreground">Thank you. We'll get back to you soon.</p>
              <button type="button" onClick={() => setSent(false)} className="mt-6 rounded-full border border-border px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:border-primary/60">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5 sm:grid-cols-2" aria-busy={isSubmitting}>
              <div>
                <label htmlFor="name" className="text-sm font-semibold">Name <span aria-hidden className="text-primary">*</span></label>
                <input id="name" type="text" autoComplete="name" required aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} className={field} {...register("name")} />
                <Err id="name-err" msg={errors.name?.message} />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-semibold">Email <span aria-hidden className="text-primary">*</span></label>
                <input id="email" type="email" autoComplete="email" inputMode="email" required aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-err" : undefined} className={field} {...register("email")} />
                <Err id="email-err" msg={errors.email?.message} />
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-semibold">Phone</label>
                <input id="phone" type="tel" autoComplete="tel" inputMode="tel" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-err" : undefined} className={field} {...register("phone")} />
                <Err id="phone-err" msg={errors.phone?.message} />
              </div>
              <div>
                <label htmlFor="company" className="text-sm font-semibold">Company</label>
                <input id="company" type="text" autoComplete="organization" className={field} {...register("company")} />
                <Err id="company-err" msg={errors.company?.message} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="interest" className="text-sm font-semibold">Service needed</label>
                <select id="interest" className={field} {...register("interest")}>
                  <option value="">Select a service (optional)</option>
                  {interest && !options.includes(interest) && <option value={interest}>{interest}</option>}
                  {options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="message" className="text-sm font-semibold">Message <span aria-hidden className="text-primary">*</span></label>
                <textarea id="message" rows={6} required aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-err" : undefined} className={cn(field, "resize-y")} {...register("message")} />
                <Err id="message-err" msg={errors.message?.message} />
              </div>
              {serverError && <p role="alert" className="border border-destructive/50 bg-destructive/10 p-4 text-sm sm:col-span-2">{serverError}</p>}
              <div className="sm:col-span-2">
                <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition disabled:opacity-60 sm:w-auto">
                  {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden />}{isSubmitting ? "Sending…" : "Send message"}
                </button>
              </div>
            </form>
          )}
        </div>
        <aside className="space-y-4">
          {[[Mail, "Email", BRAND.email, BRAND.emailHref], [Phone, "Phone", BRAND.phone, BRAND.phoneHref], [MessageCircle, "WhatsApp", "Message us on WhatsApp", BRAND.whatsappHref]].map(([I, l, t, h]) => {
            const Icon = I as typeof Mail;
            return (
              <a key={l as string} href={h as string} {...((h as string).startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})} className="flex items-center gap-4 border border-border bg-card/70 p-5 transition hover:border-primary/50">
                <Icon className="size-5 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0"><span className="eyebrow block text-muted-foreground">{l as string}</span><span className="block break-words text-sm">{t as string}</span></span>
              </a>
            );
          })}
          <p className="text-sm text-muted-foreground">{BRAND.location}</p>
        </aside>
      </section>
    </SiteShell>
  );
}
