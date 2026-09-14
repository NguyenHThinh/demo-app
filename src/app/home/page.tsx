"use client";

import Link from "next/link";
import { RequireAuth } from "@/components/demo/require-auth";
import { AppShell } from "@/components/demo/chrome";
import { clearSession } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <RequireAuth>
      <AppShell
        title={
          <p className="text-sm font-medium text-navy">
            Real Options Valuation
          </p>
        }
        actions={
          <button
            type="button"
            className="text-sm font-medium text-brand hover:underline"
            onClick={() => {
              clearSession();
              router.push("/signin");
            }}
          >
            Sign out
          </button>
        }
      >
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-navy md:text-3xl">
            Choose how to continue
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a valuation case or open one you already saved.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/projects/new"
            className="rounded-2xl border border-content-border bg-white p-6 shadow-sm transition hover:border-brand hover:shadow-md"
          >
            <p className="text-lg font-semibold text-navy">New Project</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start a new NPV or Real Options case.
            </p>
          </Link>
          <Link
            href="/projects"
            className="rounded-2xl border border-content-border bg-white p-6 shadow-sm transition hover:border-brand hover:shadow-md"
          >
            <p className="text-lg font-semibold text-navy">Open Existing</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Review or edit a saved valuation case.
            </p>
          </Link>
        </div>
      </AppShell>
    </RequireAuth>
  );
}
