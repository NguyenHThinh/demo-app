"use client";

import { RequireAuth } from "@/components/demo/require-auth";
import {
  BrandBlock,
  ChartBackground,
  PurpleButton,
} from "@/components/demo/chrome";
import { clearSession } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <RequireAuth>
      <ChartBackground>
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
          <div className="flex items-start justify-between">
            <BrandBlock compact />
            <button
              type="button"
              className="text-sm text-[var(--brand-purple)] underline"
              onClick={() => {
                clearSession();
                router.push("/signin");
              }}
            >
              Sign out
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-8 md:flex-row">
            <PurpleButton href="/projects/new" className="min-w-52 px-8 py-4 text-lg">
              New Project
            </PurpleButton>
            <PurpleButton href="/projects" className="min-w-52 px-8 py-4 text-lg">
              Open Existing
            </PurpleButton>
          </div>
        </div>
      </ChartBackground>
    </RequireAuth>
  );
}
