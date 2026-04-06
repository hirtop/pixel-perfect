import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface SignUpResult {
  status: "success" | "duplicate" | "rate_limited" | "disabled" | "error";
  error: Error | null;
  user: User | null;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string): Promise<SignUpResult> => {
    const preSignupTime = new Date().toISOString();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });

    if (error) {
      const authError = error as Error & { code?: string; status?: number };

      if (authError.code === "over_email_send_rate_limit" || authError.status === 429) {
        return {
          status: "rate_limited",
          error: authError,
          user: null,
          message: authError.message,
        };
      }

      if (/signups not allowed/i.test(authError.message)) {
        return {
          status: "disabled",
          error: authError,
          user: null,
          message: authError.message,
        };
      }

      return {
        status: "error",
        error: authError,
        user: null,
        message: authError.message,
      };
    }

    const user = data.user as User | null;
    const identitiesLength = Array.isArray(user?.identities) ? user.identities.length : null;

    // Confirmed-email duplicate: Supabase returns a fake user with zero identities
    if (user && !data.session && identitiesLength === 0) {
      return {
        status: "duplicate",
        error: null,
        user,
      };
    }

    // Unconfirmed-email duplicate: user already existed before this request.
    // Supabase re-sends a confirmation but returns identities.length === 1,
    // so we compare created_at against a timestamp taken before the call.
    if (user && !data.session && user.created_at && user.created_at < preSignupTime) {
      return {
        status: "duplicate",
        error: null,
        user,
        message: "This email was already registered but not yet verified. We re-sent the verification link — please check your inbox (and spam folder).",
      };
    }

    return {
      status: "success",
      error: null,
      user,
    };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
