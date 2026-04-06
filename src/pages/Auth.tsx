import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const result = await signUp(email, password);
        if (result.status === "duplicate") {
          if (result.message) {
            // Unconfirmed duplicate — verification re-sent
            toast.info("We already have this email on file.", {
              description: result.message,
            });
          } else {
            // Confirmed duplicate — switch to sign-in
            toast.warning("This email is already registered.", {
              description: "Please sign in with your password, or use Forgot Password if you need to reset it.",
              duration: 6000,
            });
            setMode("signin");
          }
          return;
        }

        if (result.status === "rate_limited") {
          toast.error("We couldn't send another verification email yet.", {
            description: result.message || "Please wait a minute before trying again.",
          });
          return;
        }

        if (result.status === "disabled") {
          toast.error("Account creation is currently unavailable.", {
            description: result.message || "Please try again later.",
          });
          return;
        }

        if (result.status !== "success") {
          throw result.error ?? new Error(result.message || "Something went wrong");
        }

        toast.success("Account created — verification email requested.", {
          description: "Check your inbox (and spam/junk folder). If nothing arrives within a few minutes, the email system may still be setting up.",
        });
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/start");
      }
    } catch (err: any) {
      if (err?.code === "email_not_confirmed") {
        toast.error("Please verify your email before signing in.", {
          description: "Use the verification link from your inbox, or sign up again later to request a new one.",
        });
        return;
      }

      if (err?.code === "invalid_credentials") {
        toast.error("Incorrect email or password.");
        return;
      }

      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
            BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <h1 className="font-heading text-2xl md:text-3xl text-foreground mb-2">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to access your remodel projects across devices."
                : "Save your remodel progress and access it anywhere."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "signin" ? (
              <>
                Don't have an account?{" "}
                <button onClick={() => setMode("signup")} className="text-primary hover:underline font-medium">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => setMode("signin")} className="text-primary hover:underline font-medium">
                  Sign in
                </button>
              </>
            )}
          </p>
        </motion.div>
      </main>
    </div>
  );
}