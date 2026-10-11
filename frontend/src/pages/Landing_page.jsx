import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 border-b border-gray-200/60 bg-linear-to-b from-blue-50/50 via-white to-gray-50">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-100/80 text-blue-800 border border-blue-200 mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Live Evidence-Based Fact Intelligence
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.15] mb-6">
              Sift signal from noise. <br />
              <span className="text-blue-600">Verify truth</span> with evidence in seconds.
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Autonomous multi-agent research that cross-examines live web sources,
              detects contradictions, and caches verified knowledge instantly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-4">
              <Link
                to="/app"
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition duration-200 text-center"
              >
                Verify a claim
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-7 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition duration-200 text-center"
              >
                How it works
              </a>
            </div>

            <p className="text-xs text-gray-500 font-medium">
              No login required for your first 2 checks.
            </p>
          </div>
        </section>

        {/* 2. LIVE SAMPLE RESULT CARD (STATIC) */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-bold tracking-widest text-blue-600 uppercase">
              Transparent Output
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              What an evidence verdict looks like
            </h2>
          </div>

          <div
            className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border-l-4 border-red-500 border border-gray-200"
            aria-label="Sample fact verification card"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-gray-900">Verification Result</h3>
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-xs font-medium">
                  340ms
                </span>
              </div>
              <span className="px-4 py-1.5 rounded-full font-semibold text-xs border bg-red-100 text-red-800 border-red-300">
                fake
              </span>
            </div>

            <div className="space-y-5">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Claim
                </p>
                <p className="text-gray-900 font-medium text-base sm:text-lg">
                  Is Earth flat?
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Confidence Score
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: "98%" }}
                    ></div>
                  </div>
                  <span className="text-xl font-bold text-gray-900">98%</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Summary
                </p>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  Copernican heliocentrism, modern satellite geodesy, circumnavigation physics,
                  and celestial observational mechanics definitively establish Earth as an
                  oblate spheroid. Flat Earth hypotheses contradict empirical observations.
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Primary Source
                </p>
                <a
                  href="https://nasa.gov/earth"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-3 bg-blue-50/80 rounded-xl border border-blue-200 hover:bg-blue-100/80 transition group text-sm"
                >
                  <span className="text-blue-600">🔗</span>
                  <span className="text-blue-600 font-medium truncate group-hover:underline">
                    https://nasa.gov/earth — NASA Earth Science Observation
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 3. HOW IT WORKS */}
        <section
          id="how-it-works"
          className="py-16 bg-white border-y border-gray-200 px-4 sm:px-6 lg:px-8 scroll-mt-14"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold tracking-widest text-blue-600 uppercase">
                Architecture
              </p>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">
                How Sentinels of Truth Works
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-4">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Ask</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Submit any factual statement or breaking claim in plain natural language.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-4">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Search the Web</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Tavily agent retrieves real-time evidence from verified news and scholarly sources.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-4">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">AI Analysis</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Gemini cross-examines evidence, assigns confidence, and cites source URLs.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-4">
                  4
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Semantic Index</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Verified claims are stored in Pinecone vector DB so future queries return in sub-second time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. WHY IT'S DIFFERENT (6 FEATURES) */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-blue-600 uppercase">
              Capabilities
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">
              Built for speed, accuracy, and efficiency
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <div className="text-blue-600 mb-3 text-2xl font-bold">⚡</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Semantic Cache</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Repeated or semantically equivalent claims serve instantly from Pinecone without incurring API credit costs.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <div className="text-blue-600 mb-3 text-2xl font-bold">⏹️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Live Progress & Stop</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Watch real-time server stages over SSE. Press Stop anytime to abort backend LLM and search calls cleanly.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <div className="text-blue-600 mb-3 text-2xl font-bold">⚖️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Contradiction Detection</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Secondary AI guard compares incoming verdicts against existing vector entries to catch and resolve conflicting claims.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <div className="text-blue-600 mb-3 text-2xl font-bold">🔍</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Human Review Queue</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Controversial or conflicting evidence is escalated to a dedicated review queue instead of polluting the vector index.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <div className="text-blue-600 mb-3 text-2xl font-bold">🔗</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Direct Source Citations</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Every verdict is tied to original hyperlinks so users can inspect primary evidence independently.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <div className="text-blue-600 mb-3 text-2xl font-bold">📜</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">User History & Quota</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Persistent rate limiting with Clerk auth, giving verified members 20 checks/day and private history logs.
              </p>
            </div>
          </div>
        </section>

        {/* 5. BUILT WITH */}
        <section className="py-14 bg-gray-100/70 border-t border-gray-200 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
              Engineered with Modern Industry Stack
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                "React 19",
                "Node / Express",
                "Google Gemini 2.5",
                "Pinecone Vector DB",
                "Tavily Search API",
                "MongoDB",
                "Clerk Auth",
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 shadow-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 6. FINAL CTA STRIP */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Ready to verify a claim?
            </h2>
            <p className="text-blue-100 text-base sm:text-lg mb-8">
              Experience instant evidence analysis and misinformation defense today.
            </p>
            <Link
              to="/app"
              className="inline-block px-9 py-3.5 bg-white text-blue-700 font-bold rounded-xl shadow-md hover:bg-blue-50 transition duration-200"
            >
              Open Verifier
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2 font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
            Sentinels of Truth
          </div>

          <div className="text-center sm:text-right">
            <a
              href="https://github.com/Brijesh667/Sentinels_of_Truth"
              target="_blank"
              rel="noreferrer"
              className="text-gray-300 hover:text-white underline transition"
            >
              GitHub Repository
            </a>
            <p className="text-xs text-gray-500 mt-1">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
