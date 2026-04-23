import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { requestPasswordReset } from "@/services/api";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — Lumière Academy" },
      { name: "description", content: "Reset your Lumière Academy account password." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    if (!email.trim()) return setError("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email");
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
      toast.success("Reset link sent", {
        description: `If an account exists for ${email}, you'll get an email shortly.`,
      });
    } catch {
      toast.error("Couldn't send reset link. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12">
        <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <Mail className="h-5 w-5 text-accent" />
          </div>
          <h1 className="mt-5 font-display text-3xl">Forgot password?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we'll send you a link to reset your password.
          </p>

          {sent ? (
            <div className="mt-6 rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm">
              Check your inbox for a reset link. Didn't get it?{" "}
              <button
                type="button"
                onClick={() => setSent(false)}
                className="underline underline-offset-2"
              >
                Try another email
              </button>
              .
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium tracking-wide uppercase">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@beauty.com"
                  className={`w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition-all focus:ring-2 ${
                    error
                      ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                      : "border-input focus:border-accent focus:ring-accent/20"
                  }`}
                />
                {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-foreground py-3 text-sm font-semibold text-background transition-all hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}

          <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
            <Link to="/login" className="underline">
              Back to login
            </Link>
            <Link to="/login" className="underline">
              Create account
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
