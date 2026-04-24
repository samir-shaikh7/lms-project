import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { login, signup } from "@/services/api";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Lumière Academy" },
      { name: "description", content: "Login or sign up to access your Lumière Academy courses." },
    ],
  }),
  component: LoginPage,
});

type Errors = Partial<Record<"fullName" | "email" | "password" | "phone", string>>;

function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: setAuthToken, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAuthenticated, navigate]);


  function validate(): Errors {
    const e: Errors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Min 6 characters";
    if (mode === "signup") {
      if (!fullName.trim()) e.fullName = "Full name is required";
      if (!phone.trim()) e.phone = "Phone is required";
      else if (!/^[+\d\s()-]{7,20}$/.test(phone)) e.phone = "Enter a valid phone";
    }
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await login(email, password);
        setAuthToken(res.token);
        toast.success("Welcome back!");
      } else {
        const res = await signup({ fullName: fullName.trim(), email: email.trim(), password, phone: phone.trim() });
        setAuthToken(res.token);
        toast.success("Account created", { description: "Complete your profile to get started." });
      }
      navigate({ to: mode === "signup" ? "/profile" : "/dashboard", replace: true });
    } catch (err: any) {
      toast.error(err.message || (mode === "login" ? "Login failed. Check your credentials." : "Signup failed. Try again."));
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition-all focus:ring-2";
  const inputOk = "border-input focus:border-accent focus:ring-accent/20";
  const inputErr = "border-destructive focus:border-destructive focus:ring-destructive/20";

  return (
    <Layout>
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full gap-12 lg:grid-cols-2">
          <div className="hidden flex-col justify-center lg:flex">
            <span className="text-xs font-semibold tracking-[0.25em] text-accent uppercase">
              Welcome
            </span>
            <h1 className="mt-3 font-display text-5xl leading-tight">
              Step into your <span className="italic text-accent">beauty studio</span>
            </h1>
            <p className="mt-5 max-w-md text-muted-foreground">
              Access your enrolled courses, track progress, and continue mastering your craft.
            </p>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
              <div className="flex gap-2 rounded-full bg-secondary p-1">
                {(["login", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      setErrors({});
                    }}
                    className={`flex-1 rounded-full py-2 text-sm font-medium capitalize transition-all ${mode === m ? "bg-foreground text-background" : "text-muted-foreground"
                      }`}
                  >
                    {m === "login" ? "Login" : "Sign Up"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                {mode === "signup" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium tracking-wide uppercase">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ava Laurent"
                      maxLength={80}
                      className={`${inputBase} ${errors.fullName ? inputErr : inputOk}`}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-medium tracking-wide uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@beauty.com"
                    maxLength={120}
                    className={`${inputBase} ${errors.email ? inputErr : inputOk}`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium tracking-wide uppercase">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    maxLength={64}
                    className={`${inputBase} ${errors.password ? inputErr : inputOk}`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-destructive">{errors.password}</p>
                  )}
                </div>

                {mode === "signup" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium tracking-wide uppercase">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555 010 0100"
                      maxLength={20}
                      className={`${inputBase} ${errors.phone ? inputErr : inputOk}`}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-foreground py-3 text-sm font-semibold text-background transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Please wait…" : mode === "login" ? "Login" : "Create Account"}
                </button>
              </form>

              {mode === "login" && (
                <div className="mt-4 text-right">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <p className="mt-6 text-center text-xs text-muted-foreground">
                {mode === "signup" ? (
                  <>
                    You can add City, State, and Country in your{" "}
                    <Link to="/profile" className="underline">
                      profile
                    </Link>{" "}
                    after signup.
                  </>
                ) : (
                  <>
                    By continuing you agree to our{" "}
                    <Link to="/" className="underline">
                      Terms
                    </Link>
                    .
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
