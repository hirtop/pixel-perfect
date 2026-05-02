import { supabase } from "@/integrations/supabase/client";

export interface Identity {
  userId: string | null;
  isAnonymous: boolean;
}

/**
 * Ensure the user has a Supabase session.
 * If none exists, attempt anonymous sign-in (when enabled in the project).
 * Returns { userId } or { userId: null } if identity could not be established.
 */
export async function ensureIdentity(): Promise<Identity> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      return {
        userId: session.user.id,
        isAnonymous: Boolean((session.user as { is_anonymous?: boolean }).is_anonymous),
      };
    }

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.warn("[persistence/identity] anonymous sign-in failed:", error.message);
      return { userId: null, isAnonymous: false };
    }
    return {
      userId: data.user?.id ?? null,
      isAnonymous: true,
    };
  } catch (err) {
    console.error("[persistence/identity] unexpected error:", err);
    return { userId: null, isAnonymous: false };
  }
}
