"use client";

import Link from "next/link";
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
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <BrandMark onDark />
          <PurpleButton href="/about" variant="ghost">
            About
          </PurpleButton>
        </div>
        <UrlCaption path="/signin" onDark />

        <Panel className="mt-4">
          <h2 className="text-2xl font-bold text-navy">Sign In</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Financial Modelling – Real Options Valuation
          </p>
          <div className="mt-4 h-px w-full bg-content-border" />

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
            <PurpleButton type="submit" className="w-full">
              Login
            </PurpleButton>
            <button
              type="button"
              className="w-full text-center text-sm text-brand hover:underline"
              onClick={() =>
                alert("Forgotten username or password? (Demo only)")
              }
            >
              Forgotten username or password?
            </button>
          </form>

          <div className="mt-6 border-t border-content-border pt-4 text-sm text-navy">
            <span className="font-semibold">New User?</span>{" "}
            <Link href="/signup" className="text-brand underline">
              Create an account
            </Link>
          </div>
        </Panel>
      </div>
    </ChartBackground>
  );
}
