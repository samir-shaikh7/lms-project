import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { resetPassword } from "@/services/api";
import { KeyRound } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Lumière Academy" },
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
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success("Password updated", { description: "You can now log in with your new password." });
      navigate({ to: "/login" });
    } catch {
      toast.error("Couldn't reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition-all focus:ring-2";
  const ok = "border-input focus:border-accent focus:ring-accent/20";
  const err = "border-destructive focus:border-destructive focus:ring-destructive/20";

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
                className={`${inputBase} ${errors.password ? err : ok}`}
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
                className={`${inputBase} ${errors.confirm ? err : ok}`}
              />
              {errors.confirm && (
                <p className="mt-1 text-xs text-destructive">{errors.confirm}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
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
