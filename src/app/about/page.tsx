import {
  BrandMark,
  ChartBackground,
  Panel,
  PurpleButton,
  UrlCaption,
} from "@/components/demo/chrome";

const BENEFITS = [
  "Adopt a riskless approach to project volatility",
  "Determine and capitalize on the upside value in market volatility",
  "Mitigate downside risk of volatility",
  "Eliminate false positive and false negative in capital budgeting decisions",
  "Improve strategic decision making and timing of such decisions",
];

export default function AboutPage() {
  return (
    <ChartBackground>
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-8">
        <header className="mb-8 flex items-center justify-between gap-4">
          <BrandMark onDark />
          <div className="flex items-center gap-3">
            <UrlCaption path="" onDark />
            <PurpleButton href="/about" variant="ghost">
              About
            </PurpleButton>
          </div>
        </header>

        <Panel className="flex-1 bg-white/95">
          <div className="space-y-4 text-base leading-relaxed text-navy md:text-lg">
            <p>
              DCF &amp; Traditional NPV valuations are fairly accurate when
              dealing with cost cutting initiatives or capital projects with a
              high degree of certainty in expected cost savings or revenue
              forecast. However, when faced with high uncertainty or volatility
              (for example in disruptive, semi-radical or radical innovation)
              relying on the same metric typically results in false positive and
              false negative decision making errors. Real options valuation
              allows project valuation to capture the value of uncertainty and
              drive accurate strategic decision making.
            </p>
            <p>
              Don’t leave opportunity that could transform your organisation on
              the table by continuing to use not-fit-for-purpose valuation
              metrics..
            </p>
            <p className="font-semibold text-brand">
              Get started with Real Options valuation today
            </p>
          </div>

          <ul className="mt-8 space-y-3 text-base text-navy md:text-lg">
            {BENEFITS.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex justify-center">
            <PurpleButton href="/signup" className="px-10 py-3 uppercase tracking-wider">
              Get Started For Free
            </PurpleButton>
          </div>
        </Panel>
      </div>
    </ChartBackground>
  );
}
