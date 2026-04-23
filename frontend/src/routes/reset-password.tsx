import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { resetPassword } from "@/services/api";
import { KeyRound } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — IBT Beauty Academy" },
      { name: "description", content: "Choose a new password for your account." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: ResetPasswordPage,
});

type Errors = Partial<Record<"password" | "confirm", string>>;

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  // PART 1: TOKEN VALIDATION
  useEffect(() => {
    if (!token) {
      toast.error("Invalid or expired link");
      navigate({ to: "/login", replace: true });
    }
  }, [token, navigate]);

  function validate(): Errors {
    const e: Errors = {};
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Min 6 characters";
    if (!confirm) e.confirm = "Please confirm your password";
    else if (confirm !== password) e.confirm = "Passwords do not match";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    
    setLoading(true);
    try {
      await resetPassword(token, password);
      
      // PART 3: UX IMPROVEMENT (Delay)
      toast.success("Password updated successfully", { 
        description: "Redirecting to login..." 
      });
      
      setTimeout(() => {
        // PART 2: CLEAN NAVIGATION (Replace)
        navigate({ to: "/login", replace: true });
      }, 800);

    } catch (err) {
      // PART 4: ERROR HANDLING
      toast.error("Reset failed. Please request a new link.");
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition-all focus:ring-2";
  const ok = "border-input focus:border-accent focus:ring-accent/20";
  const errClass = "border-destructive focus:border-destructive focus:ring-destructive/20";

  return (
    <Layout>
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12">
        <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <KeyRound className="h-5 w-5 text-accent" />
          </div>
          <h1 className="mt-5 font-display text-3xl">Set a new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a strong password you don't use anywhere else.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium tracking-wide uppercase">
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                maxLength={64}
                className={`${inputBase} ${errors.password ? errClass : ok}`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium tracking-wide uppercase">
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                maxLength={64}
                className={`${inputBase} ${errors.confirm ? errClass : ok}`}
              />
              {errors.confirm && (
                <p className="mt-1 text-xs text-destructive">{errors.confirm}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full rounded-full bg-foreground py-3 text-sm font-semibold text-background transition-all hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/login" className="underline">
              Back to login
            </Link>
          </p>
        </div>
      </section>
    </Layout>
  );
}
