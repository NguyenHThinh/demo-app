"use client";

import Link from "next/link";
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

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("ola.adio@innstrat.com");
  const [password, setPassword] = useState("**********");
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter email/username and password.");
      return;
    }
    setSession({
      email: email.trim(),
      createdAt: new Date().toISOString(),
    });
    router.push("/home");
  }

  return (
    <ChartBackground>
      <div className="mx-auto min-h-screen max-w-5xl px-6 py-8">
        <div className="flex items-start justify-between gap-4">
          <UrlCaption path="/signin" />
          <PurpleButton href="/about">About</PurpleButton>
        </div>

        <div className="mt-6">
          <BrandBlock compact />
        </div>

        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="w-full max-w-md">
            <h2 className="text-xl font-bold text-[var(--brand-purple)] underline">
              Sign In
            </h2>
            <div className="mt-2 h-px w-full bg-sky-500/70" />

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              <Field label="Email / Username">
                <TextInput
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field label="Password">
                <TextInput
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <div className="flex flex-wrap items-center gap-4">
                <PurpleButton type="submit">Login</PurpleButton>
                <button
                  type="button"
                  className="text-sm text-[var(--brand-purple)]"
                  onClick={() =>
                    alert("Forgotten username or password? (Demo only)")
                  }
                >
                  Forgotten username or password?
                </button>
              </div>
            </form>
          </div>

          <div className="pt-2 text-[var(--brand-purple)] md:pt-0">
            <p className="font-semibold">New User?</p>
            <Link href="/signup" className="underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </ChartBackground>
  );
}
