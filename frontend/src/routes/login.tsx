import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, UserPlus, LogIn, Loader2, Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/auth-layout";
import { GlassButton } from "@/components/glass";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, signInWithToken, type AuthUser } from "@/lib/session";

const title = "Citizen Login | GrievancePilot AI";
const description =
  "Sign in or create a citizen account for Tamil Nadu Smart Grievance Redressal System to file and track grievances.";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: CitizenAuth,
});

type Tab = "login" | "register";

function CitizenAuth() {
  const [tab, setTab] = useState<Tab>("login");

  return (
    <AuthLayout
      title={tab === "login" ? "Citizen Login" : "Create Citizen Account"}
      subtitle={
        tab === "login"
          ? "Sign in with your username and password to access the grievance portal."
          : "Register a new citizen account to file and track your grievances."
      }
    >
      {/* Tab switcher */}
      <div className="mb-6 flex rounded-2xl bg-background/55 p-1">
        <button
          type="button"
          id="tab-login"
          onClick={() => setTab("login")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
            tab === "login"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LogIn className="size-4" aria-hidden="true" />
          Login
        </button>
        <button
          type="button"
          id="tab-register"
          onClick={() => setTab("register")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
            tab === "register"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserPlus className="size-4" aria-hidden="true" />
          Sign Up
        </button>
      </div>

      {tab === "login" ? <LoginForm onSwitchTab={() => setTab("register")} /> : <RegisterForm onSwitchTab={() => setTab("login")} />}

      <div className="mt-7 flex items-center gap-3 rounded-2xl bg-secondary/12 px-4 py-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary/25 text-secondary-foreground animate-pulse-ring">
          <ShieldCheck className="size-4.5" aria-hidden="true" />
        </span>
        <p className="min-w-0 text-xs font-medium text-secondary-foreground">
          Your data is encrypted and securely stored. We comply with Government of India IT Act 2000.
        </p>
      </div>

      <p className="mt-4 text-center text-xs">
        <Link to="/officer/login" className="font-medium text-primary hover:underline">
          Officer Login →
        </Link>
      </p>
    </AuthLayout>
  );
}

// ─── Citizen Login Form ───────────────────────────────────────────────────────

function LoginForm({ onSwitchTab }: { onSwitchTab: () => void }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      const res = await apiFetch("/api/auth/citizen/login", {
        method: "POST",
        body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const u = json.data.user;
        const user: AuthUser = {
          id: u.id,
          username: u.username,
          name: u.name,
          role: "citizen",
          phone: u.phone,
        };
        signInWithToken(json.data.token, user);
        toast.success(`Welcome back, ${user.name}!`);
        void navigate({ to: "/citizen" });
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
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </div>
      )}
      <div>
        <Label htmlFor="login-username">Username</Label>
        <Input
          id="login-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          placeholder="your_username"
          required
          disabled={loading}
          className="mt-1.5 h-12 rounded-2xl bg-background/70"
        />
      </div>
      <div>
        <Label htmlFor="login-password">Password</Label>
        <div className="relative mt-1.5">
          <Input
            id="login-password"
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
      <GlassButton type="submit" size="lg" className="w-full rounded-2xl" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        {loading ? "Signing in…" : "Login"}
      </GlassButton>
      <p className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSwitchTab} className="font-semibold text-primary hover:underline">
          Create one
        </button>
      </p>
    </form>
  );
}

// ─── Citizen Register Form ────────────────────────────────────────────────────

function RegisterForm({ onSwitchTab }: { onSwitchTab: () => void }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !username.trim() || !password) {
      setError("Full name, username, and password are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/citizen/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          password,
          // role is intentionally NOT sent — backend hardcodes "citizen"
        }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success("Account created! Please log in with your new credentials.");
        onSwitchTab(); // switch to login tab
      } else {
        if (res.status === 503) {
          setError("Server database is not available. Please try again shortly.");
        } else if (res.status === 400 && json.message?.includes("already exists")) {
          setError("This username is already taken. Please choose another.");
        } else {
          setError(json.message || "Registration failed. Please try again.");
        }
      }
    } catch {
      setError("Unable to connect to the server. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </div>
      )}
      <div>
        <Label htmlFor="reg-name">Full Name</Label>
        <Input
          id="reg-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          placeholder="e.g. Meena Ravichandran"
          required
          disabled={loading}
          className="mt-1.5 h-12 rounded-2xl bg-background/70"
        />
      </div>
      <div>
        <Label htmlFor="reg-username">Username</Label>
        <Input
          id="reg-username"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
          autoComplete="username"
          placeholder="e.g. meena_r"
          required
          disabled={loading}
          className="mt-1.5 h-12 rounded-2xl bg-background/70"
        />
        <p className="mt-1 text-[11px] text-muted-foreground">Lowercase letters, numbers, underscores only.</p>
      </div>
      <div>
        <Label htmlFor="reg-phone">Phone Number <span className="text-muted-foreground">(optional)</span></Label>
        <Input
          id="reg-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          placeholder="e.g. 9876543210"
          disabled={loading}
          className="mt-1.5 h-12 rounded-2xl bg-background/70"
        />
      </div>
      <div>
        <Label htmlFor="reg-password">Password</Label>
        <div className="relative mt-1.5">
          <Input
            id="reg-password"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Min. 6 characters"
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
      <div>
        <Label htmlFor="reg-confirm">Confirm Password</Label>
        <Input
          id="reg-confirm"
          type={showPw ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="Re-enter password"
          required
          disabled={loading}
          className="mt-1.5 h-12 rounded-2xl bg-background/70"
        />
      </div>
      <GlassButton type="submit" size="lg" className="w-full rounded-2xl" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
        {loading ? "Creating Account…" : "Create Account"}
      </GlassButton>
      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <button type="button" onClick={onSwitchTab} className="font-semibold text-primary hover:underline">
          Log in
        </button>
      </p>
    </form>
  );
}
