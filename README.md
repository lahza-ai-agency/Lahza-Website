# Lahza website

AI automation, chatbots, AI agents and smart web systems. Built with TanStack Start (file-based routes), React 19, Tailwind 4, shadcn/ui and Supabase (Lovable Cloud).

## Routes
`/` · `/services` · `/pricing` · `/case-studies/assiut-real-estate` · `/about` · `/contact` · `/portal` (login required) · `/404` · `/sitemap.xml`

## Admin dashboard (`/admin`)
Everything is controlled from the website itself — no Supabase table editor needed:
- **Overview** – counters and latest inquiries.
- **Inquiries** – contact-form messages: status (new/contacted/closed), internal notes, reply links, delete.
- **Clients & users** – create/edit/delete login accounts, reset passwords, promote/demote admins.
- **Client data** – per client: projects, tasks, approvals, campaigns, reports, files, invoices, support tickets and a message thread. All of it appears in the client's `/portal`.
- **Website content** – brand & contact details, pricing packages, services, and the homepage / about / case-study text. Saved changes go live immediately (stored in `public.site_content`).
- **My account** – change your password.

First run: open `/admin`. While no administrator exists it shows a one-time "Create the owner account" form (optionally protected by `ADMIN_SETUP_KEY`). Afterwards it shows the normal sign-in.
Defaults for all editable content live in code (`src/lib/content.ts`, `brand.ts`, `pricing.ts`, `services-extra.ts`); "Restore original" in the dashboard returns a section to them.

## Where to edit things (code-level defaults)
| What | File |
|---|---|
| Default company/contact details, nav | `src/lib/brand.ts` |
| Default packages | `src/lib/pricing.ts` |
| Default services / page copy | `src/lib/content.ts` |
| Page titles & descriptions | each route's `head:` via `src/lib/seo.ts` |

## Setup
1. Rename the dot-less files from the zip: `env`→`.env`, `gitignore`→`.gitignore`, `prettierrc`→`.prettierrc`, `prettierignore`→`.prettierignore`. See `.env.example` for every variable.
2. `npm install` (an `.npmrc` sets `legacy-peer-deps=true`; npm 10 otherwise crashes on this dependency tree)
3. `npm run dev` · `npm test` · `npm run build`

## Database: Supabase is the only data layer
The app talks to Postgres through `@supabase/supabase-js` (see `src/integrations/supabase/`). **Drizzle is not used by application code**: `drizzle/schema.ts` is intentionally blank and `drizzle/migrations/*.sql` are plain SQL migrations applied by Lovable. They are kept so Lovable's migration sync keeps working; do not add a second ORM.

Tables (all with RLS): `contact_requests` (public insert only; admins read), `profiles`, `user_roles` (`app_role`: admin/client), `projects`, `tasks`, `approvals`, `campaigns`, `reports`, `files`, `invoices`, `messages`, `tickets` (clients read their own rows; admins manage all).

## Client portal
Real Supabase email/password auth. There is **no public sign-up form**. In Supabase → Authentication → disable "Allow new users to sign up" (recommended). Accounts and all portal data are created by an admin from `/admin`. **The first user ever created becomes `admin`** (trigger `handle_new_user`) — the `/admin` first-run screen does this for you.

## Deploying the admin dashboard
1. Apply the new migration `drizzle/migrations/0002_admin_cms.sql` (Lovable applies it automatically; otherwise run it once in the Supabase SQL editor).
2. Make sure the **server** has `SUPABASE_SERVICE_ROLE_KEY` (needed to create/delete login accounts). Lovable Cloud provides it; elsewhere set it as a secret env var — never prefix it with `VITE_`.
3. Optional: set `ADMIN_SETUP_KEY` before the first visit to `/admin` so only you can create the owner account.
4. Visit `/admin`.
