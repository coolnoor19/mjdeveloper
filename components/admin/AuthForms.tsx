"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { LogoMark } from "@/components/site/LogoMark";
import { api, ApiError } from "./api";
import { Button, Field, Spinner } from "./ui";

function AuthCard({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="bg-blueprint flex min-h-dvh items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-ink/10 bg-card p-7 shadow-[0_40px_80px_-50px_rgb(20_19_18/0.45)] md:p-9">
        <LogoMark animate className="h-12 w-auto text-ink" />
        <h1 className="mt-6 text-2xl font-bold">{title}</h1>
        {sub && <p className="mt-1 text-muted">{sub}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function Banner({ text }: { text: string }) {
  return text ? (
    <p role="alert" className="mb-4 rounded-xl border border-brand/30 bg-brand/[0.07] px-4 py-3 text-sm font-medium text-brand-deep">{text}</p>
  ) : null;
}

/** Only allow redirects back into the admin panel. */
function safeNext(): string {
  const n = new URLSearchParams(window.location.search).get("next") ?? "";
  return /^\/admin(\/[\w/-]*)?$/.test(n) ? n : "/admin";
}

export function LoginForm() {
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [setupNeeded, setSetupNeeded] = useState(false);

  useEffect(() => {
    api<{ needed: boolean }>("/api/admin/setup").then((r) => setSetupNeeded(r.needed)).catch(() => {});
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setErr("");
    try {
      await api("/api/admin/login", { method: "POST", json: { username: f.get("username"), password: f.get("password") } });
      window.location.href = safeNext();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : "Could not sign in.");
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Admin sign in" sub="MJ Developer website management">
      {setupNeeded && (
        <p className="mb-4 rounded-xl bg-sun/15 px-4 py-3 text-sm">
          No admin account exists yet. <Link className="font-semibold underline" href="/admin/setup">Create one</Link>.
        </p>
      )}
      <Banner text={err} />
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Username" htmlFor="u"><input id="u" name="username" className="field-input" autoComplete="username" required autoFocus /></Field>
        <Field label="Password" htmlFor="p"><input id="p" name="password" type="password" className="field-input" autoComplete="current-password" required /></Field>
        <Button type="submit" disabled={busy} className="mt-2 w-full">{busy ? <><Spinner /> Signing in…</> : "Sign in"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted"><Link href="/" className="hover:text-ink">← Back to website</Link></p>
    </AuthCard>
  );
}

export function SetupForm() {
  const [state, setState] = useState<"loading" | "open" | "closed" | "unconfigured">("loading");
  const [err, setErr] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ needed: boolean; configured: boolean }>("/api/admin/setup")
      .then((r) => setState(!r.needed ? "closed" : r.configured ? "open" : "unconfigured"))
      .catch(() => setState("open"));
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setErr("");
    setFields({});
    try {
      await api("/api/admin/setup", { method: "POST", json: f });
      // full reload on purpose so no signed-in state survives
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/admin/login";
    } catch (ex) {
      if (ex instanceof ApiError) {
        setErr(ex.message);
        setFields(ex.fields);
      }
      setBusy(false);
    }
  }

  if (state === "loading") return <AuthCard title="Create the admin account"><Spinner /></AuthCard>;
  if (state === "closed")
    return (
      <AuthCard title="Setup is complete" sub="An admin account already exists.">
        <Link href="/admin/login" className="font-semibold underline">Go to sign in</Link>
      </AuthCard>
    );
  if (state === "unconfigured")
    return (
      <AuthCard title="Setup token missing" sub="Set SETUP_TOKEN (12+ characters) in the server environment, restart the app, then reload this page." >
        <span />
      </AuthCard>
    );

  return (
    <AuthCard title="Create the admin account" sub="One-time setup. This page locks itself once an admin exists.">
      <Banner text={err} />
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Setup token" htmlFor="t" error={fields.token} hint="The SETUP_TOKEN value from the server's environment file.">
          <input id="t" name="token" type="password" className="field-input" required autoComplete="off" />
        </Field>
        <Field label="Username" htmlFor="u" error={fields.username}><input id="u" name="username" className="field-input" required autoComplete="username" /></Field>
        <Field label="Password (10+ characters)" htmlFor="p" error={fields.password}><input id="p" name="password" type="password" minLength={10} className="field-input" required autoComplete="new-password" /></Field>
        <Field label="Confirm password" htmlFor="c" error={fields.confirm}><input id="c" name="confirm" type="password" className="field-input" required autoComplete="new-password" /></Field>
        <Button type="submit" disabled={busy} className="mt-2 w-full">{busy ? <><Spinner /> Creating…</> : "Create admin"}</Button>
      </form>
    </AuthCard>
  );
}
