import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** True when the signed-in user has the `admin` role (own role rows are readable via RLS). */
export function useIsAdmin(userId: string | undefined) {
  return useQuery({
    queryKey: ["is-admin", userId],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId as string).eq("role", "admin").maybeSingle();
      if (error) throw new Error("role check failed");
      return !!data;
    },
  });
}
