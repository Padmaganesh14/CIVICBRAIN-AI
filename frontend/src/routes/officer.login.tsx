import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/auth-layout";
import { GlassButton } from "@/components/glass";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, signInWithToken, type AuthUser } from "@/lib/session";

const title = "Officer Login | GrievancePilot AI";
const description =
  "Secure sign-in for authorised Tamil Nadu department officers to review and resolve citizen grievances.";

export const Route = createFileRoute("/officer/login")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: OfficerLogin,
});

function OfficerLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/officer/login", {
        method: "POST",
        body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const u = json.data.user;
        const user: AuthUser = {
          id: u.id || u._id,
          username: u.username,
          name: u.name,
          role: "officer",
          department: u.department,
        };
        signInWithToken(json.data.token, user);
        toast.success(`Welcome, ${user.name} — ${user.department ?? "Officer"}`);
        void navigate({ to: "/officer" });
      } else {
        if (res.status === 503) {
          setError("Server database is not available. Please try again shortly.");
        } else if (res.status === 401) {
          setError("Invalid username or password.");
        } else {
          setError(json.message || "Login failed. Please try again.");
        }
      }
    } catch {
      setError("Unable to connect to the server. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Officer Login"
      subtitle="Authorised department officers only. Sign in with your government credentials."
    >
      {/* Restricted Access Notice */}
      <div className="mb-5 flex items-center gap-3 rounded-2xl bg-primary/8 px-4 py-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
          <Lock className="size-4.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">Restricted Access</p>
          <p className="text-xs text-muted-foreground">
            Officer accounts are pre-authorized by the system administrator. Public registration is not available.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="officer-username">Government Email / Username</Label>
          <Input
            id="officer-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="e.g. ganesh or ganesh@municipality.gov"
            required
            disabled={loading}
            className="mt-1.5 h-12 rounded-2xl bg-background/70"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="officer-password">Password</Label>
            <button
              type="button"
              onClick={() => toast.info("Forgot password? Please contact your department IT administrator.")}
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative mt-1.5">
            <Input
              id="officer-password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
              className="h-12 rounded-2xl bg-background/70 pr-11"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-muted-foreground select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 rounded border-border text-primary focus:ring-primary"
            />
            Remember me
          </label>
        </div>

        <GlassButton type="submit" size="lg" className="w-full rounded-2xl" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
          {loading ? "Signing in…" : "Sign in to Dashboard"}
        </GlassButton>
      </form>

      <div className="mt-7 flex items-center gap-3 rounded-2xl bg-secondary/12 px-4 py-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary/25 text-secondary-foreground animate-pulse-ring">
          <ShieldCheck className="size-4.5" aria-hidden="true" />
        </span>
        <p className="min-w-0 text-xs font-medium text-secondary-foreground">
          This is a government portal. Unauthorized access is a punishable offence under IT Act 2000.
        </p>
      </div>

      <p className="mt-4 text-center text-xs">
        <Link to="/login" className="font-medium text-primary hover:underline">
          ← Citizen Login / Register
        </Link>
      </p>
    </AuthLayout>
  );
}
