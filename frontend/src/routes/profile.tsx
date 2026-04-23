import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { getProfile, updateProfile, type UserProfile } from "@/services/api";
import { Check } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Lumière Academy" },
      { name: "description", content: "Manage your personal details and location." },
    ],
  }),
  loader: () => getProfile(),
  errorComponent: ({ error }) => (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Couldn't load your profile</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </Layout>
  ),
  component: ProfilePage,
});

type Errors = Partial<Record<"fullName" | "email" | "phone", string>>;

const DEFAULT_PROFILE: UserProfile = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  country: "",
};

function ProfilePage() {
  const initial = Route.useLoaderData();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  const [profile, setProfile] = useState<UserProfile>(initial || DEFAULT_PROFILE);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync state if initial data arrives later or changes
  useEffect(() => {
    if (initial) {
      setProfile(initial);
    }
  }, [initial]);

  if (!isAuthenticated) return null;

  function set<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!profile.fullName?.trim()) e.fullName = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email || "")) e.email = "Enter a valid email";
    if (!/^[+\d\s()-]{7,20}$/.test(profile.phone || "")) e.phone = "Enter a valid phone";
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSaving(true);
    try {
      await updateProfile(profile);
      setSaved(true);
      toast.success("Profile updated");
    } catch {
      toast.error("Couldn't save profile. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputBase =
    "w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition-all focus:ring-2";
  const inputOk = "border-input focus:border-accent focus:ring-accent/20";
  const inputErr = "border-destructive focus:border-destructive focus:ring-destructive/20";

  const Field = ({
    label,
    value,
    onChange,
    error,
    type = "text",
    placeholder,
    maxLength = 80,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    type?: string;
    placeholder?: string;
    maxLength?: number;
  }) => (
    <div>
      <label className="mb-1.5 block text-xs font-medium tracking-wide uppercase">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`${inputBase} ${error ? inputErr : inputOk}`}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );

  return (
    <Layout>
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold tracking-[0.25em] text-accent uppercase">
            Account
          </span>
          <h1 className="mt-3 font-display text-4xl">My Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Update your personal information and location.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-8 rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]"
        >
          <div>
            <h2 className="font-display text-2xl">Personal details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                label="Full Name"
                value={profile.fullName}
                onChange={(v) => set("fullName", v)}
                error={errors.fullName}
                placeholder="Ava Laurent"
              />
              <Field
                label="Email"
                type="email"
                value={profile.email}
                onChange={(v) => set("email", v)}
                error={errors.email}
                placeholder="you@beauty.com"
                maxLength={120}
              />
              <Field
                label="Phone Number"
                type="tel"
                value={profile.phone}
                onChange={(v) => set("phone", v)}
                error={errors.phone}
                placeholder="+1 555 010 0100"
                maxLength={20}
              />
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <h2 className="font-display text-2xl">Location</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Help us tailor recommendations and shipping options.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Field
                label="City"
                value={profile.city ?? ""}
                onChange={(v) => set("city", v)}
                placeholder="Paris"
              />
              <Field
                label="State"
                value={profile.state ?? ""}
                onChange={(v) => set("state", v)}
                placeholder="Île-de-France"
              />
              <Field
                label="Country"
                value={profile.country ?? ""}
                onChange={(v) => set("country", v)}
                placeholder="France"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border pt-6">
            {saved ? (
              <span className="inline-flex items-center gap-2 text-sm text-accent">
                <Check className="h-4 w-4" /> Profile saved
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Changes are saved to your account.
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-foreground px-8 py-3 text-sm font-semibold text-background transition-all hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </Layout>
  );
}
