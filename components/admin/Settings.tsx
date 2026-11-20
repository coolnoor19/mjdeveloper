"use client";
import { useState, type FormEvent } from "react";
import { api, ApiError } from "./api";
import { useMe } from "./AdminShell";
import { Button, Card, Field, PageHeader, Spinner, useToast } from "./ui";

export function Settings() {
  const { me } = useMe();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setErrors({});
    try {
      await api("/api/admin/password", { method: "POST", json: Object.fromEntries(new FormData(form)) });
      form.reset();
      toast("Password changed. Other devices have been signed out.");
    } catch (ex) {
      if (ex instanceof ApiError) setErrors({ ...ex.fields, _: ex.message });
    }
    setBusy(false);
  }

  return (
    <>
      <PageHeader title="Settings" sub="Your admin account." />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card className="p-6">
          <h2 className="font-semibold">Account</h2>
          <dl className="mt-4 text-sm">
            <dt className="text-muted">Username</dt>
            <dd className="mt-0.5 text-lg font-semibold">{me?.username ?? "…"}</dd>
          </dl>
          <p className="mt-6 text-sm text-muted">
            Sessions last 8 hours. Changing your password signs out every other device.
          </p>
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold">Change password</h2>
          {errors._ && !Object.keys(errors).some((k) => k !== "_") && (
            <p role="alert" className="mt-4 rounded-xl bg-brand/[0.07] px-4 py-3 text-sm font-medium text-brand-deep">{errors._}</p>
          )}
          <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
            <Field label="Current password" htmlFor="cur" error={errors.current}>
              <input id="cur" name="current" type="password" className="field-input" autoComplete="current-password" required />
            </Field>
            <Field label="New password (10+ characters)" htmlFor="new" error={errors.password}>
              <input id="new" name="password" type="password" minLength={10} className="field-input" autoComplete="new-password" required />
            </Field>
            <Field label="Confirm new password" htmlFor="conf" error={errors.confirm}>
              <input id="conf" name="confirm" type="password" className="field-input" autoComplete="new-password" required />
            </Field>
            <Button type="submit" disabled={busy} className="self-start">{busy ? <><Spinner /> Saving…</> : "Change password"}</Button>
          </form>
        </Card>
      </div>
    </>
  );
}
