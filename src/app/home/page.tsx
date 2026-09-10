"use client";

import { RequireAuth } from "@/components/demo/require-auth";
import { AppShell, BrandBlock, PurpleButton } from "@/components/demo/chrome";
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
        <div className="mb-8">
          <BrandBlock compact />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <PurpleButton
            href="/projects/new"
            className="h-auto min-h-28 flex-col gap-1 rounded-2xl px-8 py-6 text-lg"
          >
            New Project
          </PurpleButton>
          <PurpleButton
            href="/projects"
            variant="secondary"
            className="h-auto min-h-28 flex-col gap-1 rounded-2xl px-8 py-6 text-lg"
          >
            Open Existing
          </PurpleButton>
        </div>
      </AppShell>
    </RequireAuth>
  );
}
