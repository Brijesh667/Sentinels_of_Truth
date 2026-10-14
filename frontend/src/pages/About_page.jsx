import { siteConfig } from "../config/site";
import aboutData from "../data/about";
import benchmark from "../data/benchmark";
import usePageTitle from "../utils/usePageTitle";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Reveal from "../components/ui/Reveal";
import PipelineDiagram from "../components/about/PipelineDiagram";
import FaqAccordion from "../components/about/FaqAccordion";
import EvaluationSection from "../components/about/EvaluationSection";

const TECH_STACK = [
  "React",
  "Node/Express",
  "Gemini",
  "Pinecone",
  "Tavily",
  "MongoDB",
  "Redis",
  "JWT auth",
];

export default function About() {
  usePageTitle("About — Sentinels of Truth");

  return (
    <div className="w-full bg-bg text-fg py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16 sm:space-y-24">
        {/* 1. HEADER SECTION */}
        <header className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-fg font-display tracking-tight leading-tight mb-4">
            About Sentinels of Truth
          </h1>
          <p className="text-base sm:text-lg text-fg-muted leading-relaxed mb-8">
            {aboutData.intro}
          </p>

          <div className="flex items-center justify-center gap-3.5 flex-wrap">
            {/* The single primary button on this page */}
            <Button
              variant="primary"
              size="md"
              to="/app"
              className="px-7 min-h-[44px] font-semibold"
            >
              Try it
            </Button>

            {siteConfig.github && (
              <a
                href={siteConfig.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl border border-line bg-surface text-fg hover:bg-surface-2 font-medium text-sm transition-colors shadow-xs gap-2"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>View the code</span>
              </a>
            )}
          </div>
        </header>

        {/* 2. WHAT IT DOES */}
        <section aria-labelledby="what-it-does-heading">
          <Reveal>
            <div className="text-center mb-10">
              <h2
                id="what-it-does-heading"
                className="text-2xl sm:text-3xl font-bold text-fg font-display tracking-tight"
              >
                What it does
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aboutData.whatItDoes.map((item, idx) => (
                <Card key={idx} className="p-6 border border-line bg-surface">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    {item.icon === "chat" && (
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                        />
                      </svg>
                    )}
                    {item.icon === "shield" && (
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                        />
                      </svg>
                    )}
                    {item.icon === "bolt" && (
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                        />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-fg font-display mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-fg-muted leading-relaxed">
                    {item.desc}
                  </p>
                </Card>
              ))}
            </div>
          </Reveal>
        </section>

        {/* 3. HOW A CHECK WORKS (INTERACTIVE PIPELINE) */}
        <section aria-labelledby="pipeline-heading">
          <Reveal>
            <div className="text-center mb-10">
              <h2
                id="pipeline-heading"
                className="text-2xl sm:text-3xl font-bold text-fg font-display tracking-tight"
              >
                How a check works
              </h2>
              <p className="text-sm text-fg-muted mt-2 max-w-xl mx-auto">
                Step-by-step walkthrough of the dual-agent architecture and semantic memory.
              </p>
            </div>

            <PipelineDiagram nodes={aboutData.pipeline} />
          </Reveal>
        </section>

        {/* 4. WHERE YOUR DATA LIVES */}
        <section aria-labelledby="data-lives-heading">
          <Reveal>
            <div className="text-center mb-10">
              <h2
                id="data-lives-heading"
                className="text-2xl sm:text-3xl font-bold text-fg font-display tracking-tight"
              >
                Where your data lives
              </h2>
              <p className="text-sm text-fg-muted mt-2 max-w-xl mx-auto">
                Clear separation between public knowledge and private user data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shared Knowledge */}
              <Card className="p-6 sm:p-7 border border-line bg-surface flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="primary" size="sm">
                      SHARED
                    </Badge>
                    <h3 className="text-lg font-bold text-fg font-display">
                      {aboutData.dataLives.shared.title}
                    </h3>
                  </div>
                  <p className="text-xs text-primary font-medium mb-4">
                    {aboutData.dataLives.shared.subtitle}
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-fg-muted">
                    {aboutData.dataLives.shared.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="text-primary mt-0.5">•</span>
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              {/* Personal Data */}
              <Card className="p-6 sm:p-7 border border-line bg-surface flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="neutral" size="sm">
                      PRIVATE
                    </Badge>
                    <h3 className="text-lg font-bold text-fg font-display">
                      {aboutData.dataLives.personal.title}
                    </h3>
                  </div>
                  <p className="text-xs text-fg-muted font-medium mb-4">
                    {aboutData.dataLives.personal.subtitle}
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-fg-muted">
                    {aboutData.dataLives.personal.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="text-success mt-0.5">•</span>
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          </Reveal>
        </section>

        {/* 5. HONEST LIMITATIONS */}
        <section aria-labelledby="limitations-heading">
          <Reveal>
            <div className="text-center mb-10">
              <h2
                id="limitations-heading"
                className="text-2xl sm:text-3xl font-bold text-fg font-display tracking-tight"
              >
                Honest limitations
              </h2>
              <p className="text-sm text-fg-muted mt-2 max-w-xl mx-auto">
                What this system can and cannot do. Transparency matters.
              </p>
            </div>

            <Card className="p-6 sm:p-8 border border-line bg-surface">
              <ul className="space-y-3.5 text-xs sm:text-sm text-fg-muted">
                {aboutData.limitations.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2 flex-none" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </section>

        {/* 6. EVALUATION SECTION (CONDITIONAL) */}
        {typeof benchmark?.accuracy === "number" && (
          <section aria-labelledby="evaluation-heading">
            <Reveal>
              <div className="text-center mb-6">
                <h2
                  id="evaluation-heading"
                  className="text-2xl sm:text-3xl font-bold text-fg font-display tracking-tight"
                >
                  System evaluation
                </h2>
              </div>
              <EvaluationSection benchmark={benchmark} />
            </Reveal>
          </section>
        )}

        {/* 7. FAQ */}
        <section aria-labelledby="faq-heading">
          <Reveal>
            <div className="text-center mb-10">
              <h2
                id="faq-heading"
                className="text-2xl sm:text-3xl font-bold text-fg font-display tracking-tight"
              >
                Frequently asked questions
              </h2>
              <p className="text-sm text-fg-muted mt-2 max-w-xl mx-auto">
                Detailed answers on accuracy, data privacy, and architecture.
              </p>
            </div>

            <FaqAccordion items={aboutData.faq} />
          </Reveal>
        </section>

        {/* 8. BUILT BY */}
        <section aria-labelledby="built-by-heading">
          <Reveal>
            <Card className="p-6 sm:p-8 border border-line bg-surface text-center max-w-2xl mx-auto">
              <h2
                id="built-by-heading"
                className="text-xl sm:text-2xl font-bold text-fg font-display mb-1"
              >
                Built by {siteConfig.author}
              </h2>
              <p className="text-xs sm:text-sm text-fg-muted mb-4">
                Developer of this project
              </p>

              {aboutData.authorNote && (
                <p className="text-sm text-fg-muted italic mb-6 leading-relaxed max-w-md mx-auto">
                  &ldquo;{aboutData.authorNote}&rdquo;
                </p>
              )}

              <div className="flex items-center justify-center gap-3 flex-wrap">
                {siteConfig.github && (
                  <a
                    href={siteConfig.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-line bg-surface text-fg hover:bg-surface-2 text-xs font-semibold transition shadow-xs"
                  >
                    <span>GitHub</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                )}
                {siteConfig.linkedin && (
                  <a
                    href={siteConfig.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-line bg-surface text-fg hover:bg-surface-2 text-xs font-semibold transition shadow-xs"
                  >
                    <span>LinkedIn</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                )}
                {siteConfig.portfolio && (
                  <a
                    href={siteConfig.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-line bg-surface text-fg hover:bg-surface-2 text-xs font-semibold transition shadow-xs"
                  >
                    <span>Portfolio</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                )}
              </div>
            </Card>
          </Reveal>
        </section>

        {/* 9. TECH STACK */}
        <section aria-label="Technology Stack" className="text-center pt-4">
          <Reveal>
            <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-4">
              Technology Stack
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {TECH_STACK.map((tech, idx) => (
                <Badge
                  key={idx}
                  variant="neutral"
                  size="md"
                  className="px-3 py-1 font-medium text-xs text-fg-muted hover:text-fg transition-colors"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
}