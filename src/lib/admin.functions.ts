import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

/* ------------------------------------------------------------------ *
 * Server-only admin operations that the browser can't do with RLS alone
 * (creating/deleting login accounts needs the service-role key).
 * Every function re-checks on the server that the caller is an admin.
 * `supabaseAdmin` is imported lazily inside handlers so the service key
 * never reaches the client bundle.
 * ------------------------------------------------------------------ */

const PORTAL_TABLES = ["tasks", "projects", "approvals", "campaigns", "reports", "files", "invoices", "messages", "tickets"] as const;
const email = z.string().trim().toLowerCase().email().max(255);
const password = z.string().min(8, "Password must be at least 8 characters").max(72);
const role = z.enum(["admin", "client"]);

async function assertAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || data !== true) throw new Error("Forbidden: administrators only");
}

async function adminCount() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin");
  if (error) throw new Error("Could not read roles");
  return count ?? 0;
}

async function writeRole(userId: string, r: "admin" | "client") {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
  const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: r });
  if (error) throw new Error("Could not set role");
}

/* ---------------- first-run setup (no login yet) ---------------- */
export const getSetupStatus = createServerFn({ method: "POST" }).handler(async () => {
  return { needsSetup: (await adminCount()) === 0, keyRequired: !!process.env["ADMIN_SETUP_KEY"] };
});

export const createFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email, password, fullName: z.string().trim().max(120).optional(), setupKey: z.string().max(200).optional() }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if ((await adminCount()) > 0) throw new Error("Setup is already complete. Please sign in.");
    const required = process.env["ADMIN_SETUP_KEY"];
    if (required && data.setupKey !== required) throw new Error("Invalid setup key");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email, password: data.password, email_confirm: true, user_metadata: { full_name: data.fullName ?? "" },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Could not create the account");
    // The handle_new_user trigger makes the first account an admin; verify, otherwise undo.
    const { data: r } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", created.user.id).eq("role", "admin").maybeSingle();
    if (!r) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw new Error("Setup was already completed by someone else.");
    }
    return { ok: true as const };
  });

/* ---------------- user management (admin only) ---------------- */
export const adminListUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [users, profiles, roles] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      supabaseAdmin.from("profiles").select("id, full_name, company"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);
    if (users.error) throw new Error(users.error.message);
    const prof = new Map((profiles.data ?? []).map((p) => [p.id, p] as const));
    const rl = new Map((roles.data ?? []).map((r) => [r.user_id, r.role] as const));
    return users.data.users.map((u) => ({
      id: u.id, email: u.email ?? "", fullName: prof.get(u.id)?.full_name ?? "", company: prof.get(u.id)?.company ?? "",
      role: (rl.get(u.id) ?? "client") as "admin" | "client", createdAt: u.created_at, lastSignInAt: u.last_sign_in_at ?? null,
    })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });

export const adminCreateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ email, password, fullName: z.string().trim().max(120), company: z.string().trim().max(120), role }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email, password: data.password, email_confirm: true, user_metadata: { full_name: data.fullName, company: data.company },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Could not create the user");
    if (data.role === "admin") await writeRole(created.user.id, "admin");
    return { id: created.user.id };
  });

export const adminUpdateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), email: email.optional(), password: password.optional(), fullName: z.string().trim().max(120), company: z.string().trim().max(120) }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const attrs: { email?: string; password?: string; user_metadata: Record<string, string> } = { user_metadata: { full_name: data.fullName, company: data.company } };
    if (data.email) attrs.email = data.email;
    if (data.password) attrs.password = data.password;
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.id, attrs);
    if (error) throw new Error(error.message);
    const { error: pErr } = await supabaseAdmin.from("profiles").update({ full_name: data.fullName || null, company: data.company || null, ...(data.email ? { email: data.email } : {}) }).eq("id", data.id);
    if (pErr) throw new Error("Could not update the profile");
    return { ok: true as const };
  });

export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), role }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.role === "client" && (await adminCount()) <= 1) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: isAdm } = await supabaseAdmin.from("user_roles").select("id").eq("user_id", data.id).eq("role", "admin").maybeSingle();
      if (isAdm) throw new Error("You can't remove the last administrator.");
    }
    await writeRole(data.id, data.role);
    return { ok: true as const };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.id === context.userId) throw new Error("You can't delete your own account.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isAdm } = await supabaseAdmin.from("user_roles").select("id").eq("user_id", data.id).eq("role", "admin").maybeSingle();
    if (isAdm && (await adminCount()) <= 1) throw new Error("You can't delete the last administrator.");
    for (const t of PORTAL_TABLES) {
      const { error } = await supabaseAdmin.from(t).delete().eq("client_id", data.id);
      if (error) throw new Error(`Could not remove the client's ${t}`);
    }
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.id);
    await supabaseAdmin.from("profiles").delete().eq("id", data.id);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
