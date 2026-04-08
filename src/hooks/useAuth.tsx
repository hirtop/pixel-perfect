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
    let isMounted = true;
    let initialSessionResolved = false;

    const applySession = (nextSession: Session | null, shouldResolveLoading: boolean) => {
      if (!isMounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (shouldResolveLoading) {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession, initialSessionResolved);
    });

    void supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      initialSessionResolved = true;
      applySession(initialSession, true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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

    // Duplicate detection: user existed before this signup call
    // Supabase returns identities:[] for any repeated signup (obfuscated response).
    // We cannot distinguish verified vs unverified due to enumeration protection.
    if (user && !data.session && identitiesLength === 0) {
      return {
        status: "duplicate",
        error: null,
        user,
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
