"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BrandMark,
  ChartBackground,
  Field,
  Panel,
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
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <BrandMark onDark />
          <PurpleButton
            type="button"
            variant="ghost"
            href="/signin"
          >
            Back to Sign In
          </PurpleButton>
        </div>
        <UrlCaption path="/signup" onDark />

        <Panel className="mt-4">
          <h2 className="text-2xl font-bold text-navy">
            Create New Account
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Innoster Real Options · Powered by InnStrat
          </p>
          <div className="mt-4 h-px w-full bg-content-border" />

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

            <div className="md:col-span-2 flex flex-col items-end gap-3 pt-2">
              <p className="max-w-md text-right text-sm text-amber-700">
                {message ||
                  "System should send verify email link before account is finally created"}
              </p>
              <PurpleButton type="submit" className="min-w-32">
                Create
              </PurpleButton>
            </div>
          </form>
        </Panel>
      </div>
    </ChartBackground>
  );
}
