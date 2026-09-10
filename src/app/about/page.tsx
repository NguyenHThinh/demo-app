import {
  ChartBackground,
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
        <div className="mb-6 flex items-start justify-between gap-4">
          <UrlCaption path="" />
          <PurpleButton href="/about">About</PurpleButton>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-10 py-8">
          <div className="space-y-4 text-base leading-relaxed text-[var(--brand-purple)] md:text-lg">
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
            <p className="font-semibold">
              Get started with Real Options valuation today
            </p>
          </div>

          <ul className="space-y-3 text-base text-[var(--brand-purple)] md:text-lg">
            {BENEFITS.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-purple)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-center pt-4">
            <PurpleButton href="/signup" className="px-10 py-3 text-lg">
              Get Started For Free
            </PurpleButton>
          </div>
        </div>
      </div>
    </ChartBackground>
  );
}
