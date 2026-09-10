"use client";

import Link from "next/link";

export function BrandBlock({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "space-y-0.5" : "space-y-1"}>
      <h1
        className={
          compact
            ? "font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--brand-purple)] md:text-3xl"
            : "font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--brand-purple)] md:text-5xl"
        }
      >
        Innoster Real Options
      </h1>
      <p className="text-base text-[var(--brand-purple)] md:text-lg">
        Financial Modelling – Real Options Valuation
      </p>
      <p className="text-sm italic text-[var(--brand-purple)]">
        Powered by{" "}
        <span className="underline decoration-red-600 decoration-2">
          InnStrat
        </span>
      </p>
    </div>
  );
}

export function UrlCaption({ path }: { path: string }) {
  return (
    <p className="text-center text-sm text-slate-600 underline">
      www.innstrat.com/innoster/realoptions{path}
    </p>
  );
}

export function PurpleButton({
  children,
  className = "",
  type = "button",
  onClick,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  href?: string;
}) {
  const cls = `inline-flex items-center justify-center rounded-xl bg-[var(--brand-purple)] px-6 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-[var(--brand-purple-dark)] ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function ChartBackground({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-screen bg-white ${className}`}>{children}</div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-semibold text-[var(--brand-purple)] underline">
        {label}
      </span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-[var(--brand-purple)] ${props.className ?? ""}`}
    />
  );
}
