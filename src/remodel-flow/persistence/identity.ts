import { supabase } from "@/integrations/supabase/client";

export interface Identity {
  userId: string | null;
  isAnonymous: boolean;
}

/**
 * Read-only identity check. Returns the current Supabase user id if a session
 * exists, otherwise { userId: null } without mutating auth state.
 *
 * Anonymous sign-in is intentionally NOT attempted here:
 * - Anonymous auth is disabled for this project, so the call returns 422 and
 *   pollutes the network log on every unauthenticated page load.
 * - Worse, calling signInAnonymously() during a hard navigation can race the
 *   initial getSession() rehydrate and clear the in-memory authenticated
 *   session, which previously broke /summary for signed-in users.
 *
 * TODO: a separate canonical-domain redirect (www <-> apex) should be handled
 * outside this module if/when that work is scoped.
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
    return { userId: null, isAnonymous: false };
  } catch (err) {
    console.error("[persistence/identity] unexpected error:", err);
    return { userId: null, isAnonymous: false };
  }
}
