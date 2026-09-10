import {
  BrandBlock,
  BrandMark,
  ChartBackground,
  PurpleButton,
  UrlCaption,
} from "@/components/demo/chrome";

export default function LandingPage() {
  return (
    <ChartBackground>
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
        <header className="mb-10 flex items-center justify-between gap-4">
          <BrandMark onDark />
          <div className="flex items-center gap-3">
            <UrlCaption path="" onDark />
            <PurpleButton href="/about" variant="ghost" className="shrink-0">
              About
            </PurpleButton>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
          <BrandBlock onDark />
          <div className="max-w-3xl space-y-4 text-lg leading-relaxed text-white/85 md:text-xl">
            <p>When DCF Misses the Future. Real Options Captures It.</p>
            <p>
              Value Flexibility. Mitigate the Risk.
              <br />
              Turn Uncertainty &amp; Volatility into your Competitive Advantage.
            </p>
          </div>
          <PurpleButton href="/signup" className="px-10 py-3 text-base uppercase tracking-wider">
            Get Started For Free
          </PurpleButton>
        </div>

        <p className="mt-8 text-center text-xs text-brand-hover">
          System should send verify email link before account is finally created
        </p>
      </div>
    </ChartBackground>
  );
}
