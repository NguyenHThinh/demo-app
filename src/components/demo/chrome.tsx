"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/utils";

export function BrandMark({ onDark = true }: { onDark?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <Image
        src={onDark ? "/logo-on-dark.svg" : "/logo.svg"}
        alt="innStrat"
        width={140}
        height={36}
        className="h-8 w-auto md:h-9"
        priority
      />
    </Link>
  );
}

export function BrandBlock({
  compact = false,
  onDark = false,
}: {
  compact?: boolean;
  onDark?: boolean;
}) {
  const title = onDark ? "text-white" : "text-navy";
  const sub = onDark ? "text-white/80" : "text-navy/80";
  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <h1
        className={cn(
          "font-semibold tracking-tight",
          compact ? "text-2xl md:text-3xl" : "text-4xl md:text-5xl",
          title,
        )}
      >
        Innoster Real Options
      </h1>
      <p className={cn(compact ? "text-sm md:text-base" : "text-base md:text-lg", sub)}>
        Financial Modelling – Real Options Valuation
      </p>
      <p className={cn("text-sm italic", sub)}>
        Powered by{" "}
        <span className="font-semibold not-italic text-brand">InnStrat</span>
      </p>
    </div>
  );
}

export function UrlCaption({
  path,
  onDark = false,
}: {
  path: string;
  onDark?: boolean;
}) {
  return (
    <p
      className={cn(
        "text-center text-xs underline md:text-sm",
        onDark ? "text-white/50" : "text-muted-foreground",
      )}
    >
      www.innstrat.com/innoster/realoptions{path}
    </p>
  );
}

/** Primary CTA — innStrat blue-violet pill */
export function PurpleButton({
  children,
  className = "",
  type = "button",
  onClick,
  href,
  variant = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "ghost" | "secondary" | "outline";
}) {
  const variants = {
    primary:
      "bg-brand text-white shadow-md shadow-brand/25 hover:bg-brand-hover hover:text-navy-deep",
    ghost:
      "border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20",
    secondary: "bg-navy text-white hover:bg-navy-deep",
    outline:
      "border border-content-border bg-white text-navy hover:border-brand hover:text-brand",
  };
  const cls = cn(
    "inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold tracking-wide transition",
    variants[variant],
    className,
  );
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

/** Dark navy marketing shell (landing / about / auth backdrop) */
export function ChartBackground({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("relative min-h-screen overflow-hidden bg-navy-deep", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(82,98,237,0.35),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(55,59,83,0.8),transparent_50%)] opacity-40"
      />
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-30"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        <path
          d="M0 220 C 240 160, 480 280, 720 220 S 1200 120, 1440 200"
          fill="none"
          stroke="#5262ED"
          strokeWidth="1.2"
        />
        <path
          d="M0 420 C 300 360, 520 480, 780 400 S 1180 300, 1440 380"
          fill="none"
          stroke="#6B7AFF"
          strokeWidth="1"
        />
        <path
          d="M0 640 C 260 580, 500 700, 760 620 S 1160 520, 1440 600"
          fill="none"
          stroke="#3A3F5C"
          strokeWidth="1.4"
        />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/** Light app workspace shell (home / projects) */
export function AppShell({
  children,
  title,
  actions,
}: {
  children: React.ReactNode;
  title?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-content-bg">
      <header className="sticky top-0 z-20 border-b border-content-border bg-white">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <BrandMark onDark={false} />
            {title ? (
              <div className="hidden border-l border-content-border pl-4 md:block">
                {title}
              </div>
            ) : null}
          </div>
          {actions}
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-content-border bg-white p-6 shadow-sm md:p-8",
        className,
      )}
    >
      {children}
    </div>
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
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-navy">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/25",
        props.className,
      )}
    />
  );
}

export function SelectInput(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <select
      {...props}
      className={cn(
        "h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25",
        props.className,
      )}
    />
  );
}
