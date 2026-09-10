"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BrandBlock,
  ChartBackground,
  Field,
  PurpleButton,
  TextInput,
  UrlCaption,
} from "@/components/demo/chrome";
import { setSession } from "@/lib/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setMessage("Please fill required fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setMessage(
      "System should send verify email link before account is finally created",
    );
    setSession({
      email: form.email,
      name: `${form.firstName} ${form.lastName}`.trim() || form.username,
      createdAt: new Date().toISOString(),
    });
    window.setTimeout(() => router.push("/signin"), 1200);
  }

  return (
    <ChartBackground>
      <div className="mx-auto min-h-screen max-w-5xl px-6 py-8">
        <div className="flex items-start justify-between gap-4">
          <UrlCaption path="/signup" />
          <PurpleButton
            type="button"
            className="shrink-0 bg-slate-500 hover:bg-slate-600"
            href="/signin"
          >
            Back to Sign In
          </PurpleButton>
        </div>
        <div className="mt-6">
          <BrandBlock compact />
        </div>

        <h2 className="mt-8 text-xl font-bold text-[var(--brand-purple)] underline">
          Create New Account
        </h2>
        <div className="mt-2 h-px w-full bg-sky-500/70" />

        <form onSubmit={onSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="First Name">
            <TextInput
              value={form.firstName}
              onChange={(e) =>
                setForm((f) => ({ ...f, firstName: e.target.value }))
              }
            />
          </Field>
          <Field label="Last Name">
            <TextInput
              value={form.lastName}
              onChange={(e) =>
                setForm((f) => ({ ...f, lastName: e.target.value }))
              }
            />
          </Field>
          <Field label="Company Name">
            <TextInput
              value={form.companyName}
              onChange={(e) =>
                setForm((f) => ({ ...f, companyName: e.target.value }))
              }
            />
          </Field>
          <Field label="E-mail Address">
            <TextInput
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </Field>
          <Field label="Username">
            <TextInput
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
            />
          </Field>
          <div className="hidden md:block" />
          <Field label="Password">
            <TextInput
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
            />
          </Field>
          <Field label="Password">
            <TextInput
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((f) => ({ ...f, confirmPassword: e.target.value }))
              }
            />
          </Field>

          <div className="md:col-span-2 flex flex-col items-end gap-3 pt-4">
            {message ? (
              <p className="max-w-sm text-right text-sm text-red-600">
                {message}
              </p>
            ) : (
              <p className="max-w-sm text-right text-sm text-red-600">
                System should send verify email link before account is finally
                created
              </p>
            )}
            <PurpleButton type="submit">Create</PurpleButton>
          </div>
        </form>
      </div>
    </ChartBackground>
  );
}
