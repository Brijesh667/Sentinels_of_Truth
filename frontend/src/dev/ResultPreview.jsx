import { useState, useEffect } from "react";
import ResponseCard from "../components/ResponseCard";
import ThoughtLine from "../components/reactbits/ThoughtLine";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

const FIXTURES = {
  freshFake: {
    title: "1. Fresh fake result with sources (web_search)",
    desc: "Verdict fake -> danger red confidence bar, neutral badge, live web search origin, sources list.",
    result: {
      query: "Does drinking bleach cure viral infections?",
      origin: "web_search",
      cached: false,
      took_ms: 1420,
      data: {
        claim: "Drinking chlorine bleach or disinfectants can cure viral infections",
        verification_status: "Fake",
        confidence: 96,
        summary:
          "Ingesting bleach or chemical disinfectants does not cure viral infections and is extremely toxic and potentially lethal. Public health authorities worldwide strictly advise against internal consumption.\n\nBleach and other disinfectants are designed exclusively for sanitizing external surfaces and cause severe chemical burns to mucous membranes, internal bleeding, and organ failure if ingested.",
        sources: [
          "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters",
          "https://www.cdc.gov/disinfectants/safety.html",
          "https://www.fda.gov/consumers/consumer-updates/danger-dont-drink-miracle-mineral-solution-or-similar-products",
        ],
      },
    },
  },
  dbWithDateAndMatch: {
    title: "2. Verified DB result with verifiedAt and matchedClaim",
    desc: "Origin verified_db with primary badge, shield icon, formatted date, matchedClaim note, green confidence bar.",
    result: {
      query: "Is the earth spherical?",
      origin: "verified_db",
      cached: true,
      verifiedAt: "2026-10-12T14:32:00.000Z",
      matchedClaim: "The Earth is an oblate spheroid in shape",
      took_ms: 38,
      data: {
        claim: "The Earth is an oblate spheroid in shape",
        verification_status: "Verified",
        confidence: 99,
        summary:
          "Centuries of empirical astronomical and physical measurements, satellite geodesy, and direct orbital photography demonstrate that the Earth is an oblate spheroid with a slight equatorial bulge due to rotation.",
        sources: [
          "https://oceanservice.noaa.gov/facts/earth-round.html",
          "https://science.nasa.gov/earth/facts",
        ],
      },
    },
  },
  dbWithoutDate: {
    title: "3. Verified DB result without verifiedAt",
    desc: "Fallback text 'Previously verified', matchedClaim absent.",
    result: {
      query: "Is the Great Wall of China visible from space?",
      origin: "verified_db",
      cached: true,
      verifiedAt: null,
      matchedClaim: null,
      took_ms: 54,
      data: {
        claim:
          "The Great Wall of China is visible from low Earth orbit with the unaided eye",
        verification_status: "Fake",
        confidence: 92,
        summary:
          "Astronauts and orbital missions have verified that the Great Wall cannot be distinguished from surrounding terrain with the naked human eye from orbit due to its narrow width and natural building materials.",
        sources: [
          "https://www.nasa.gov/vision/space/workinginspace/great_wall.html",
          "https://www.scientificamerican.com/article/is-chinas-great-wall-visible-from-space",
        ],
      },
    },
  },
  lowConfidence: {
    title: "4. Low-confidence verified result (< 60%)",
    desc: "Confidence 54% -> bar stays green (by verdict), muted hint 'Low confidence. Double-check the sources.' displayed.",
    result: {
      query: "Did Abraham Lincoln receive an early facsimile machine prototype?",
      origin: "web_search",
      cached: false,
      took_ms: 2850,
      data: {
        claim:
          "Facsimile transmission technology existed during Abraham Lincoln's presidency",
        verification_status: "Verified",
        confidence: 54,
        summary:
          "Alexander Bain patented an electric chemical facsimile telegraph in 1843, and Giovanni Caselli operated the commercial Pantelegraph between Paris and Lyon in the 1860s. While the technology coexisted with Lincoln's lifetime, evidence that Lincoln personally received a transmission is sparse.",
        sources: [
          "https://en.wikipedia.org/wiki/Fax#History",
          "https://www.smithsonianmag.com/history/early-fax-technology",
        ],
      },
    },
  },
  stopped: {
    title: "5. Stopped state",
    desc: "Calm state, no error red, no ThoughtLine.",
    isStopped: true,
  },
  error: {
    title: "6. Error state",
    desc: "Card with danger border and took_ms badge.",
    result: {
      response:
        "The upstream verification agent timed out while gathering live web sources. Please check your connection and try again.",
      code: "UPSTREAM_TIMEOUT",
      took_ms: 4100,
    },
  },
};

const THOUGHT_STAGES = [
  { stage: "checking_cache", steps: ["Checking the verified database"] },
  {
    stage: "searching",
    steps: [
      "Checking the verified database",
      "Searching the web for evidence",
    ],
  },
  {
    stage: "analyzing",
    steps: [
      "Checking the verified database",
      "Searching the web for evidence",
      "Weighing the evidence",
    ],
  },
];

export default function ResultPreview() {
  const [selectedKey, setSelectedKey] = useState("freshFake");
  const [stageIndex, setStageIndex] = useState(0);
  const [isLooping, setIsLooping] = useState(true);

  // Auto-loop ThoughtLine demo
  useEffect(() => {
    if (!isLooping) return;
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % THOUGHT_STAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLooping]);

  const currentFixture = FIXTURES[selectedKey];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Dev banner */}
      <div className="p-4 rounded-xl bg-surface-2 border border-line flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              DEV ONLY
            </Badge>
            <h1 className="text-lg font-bold text-fg">Result Preview Fixtures</h1>
          </div>
          <p className="text-xs text-fg-muted mt-1">
            Test and verify all ResultCard states and ThoughtLine progress offline without spending API quota.
          </p>
        </div>
        <div className="text-xs text-fg-muted">
          Route: <code className="text-primary font-mono">/dev/result-preview</code>
        </div>
      </div>

      {/* Fixture Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(FIXTURES).map(([key, item]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedKey(key)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer min-h-[40px] ${
              selectedKey === key
                ? "bg-primary text-primary-fg border-primary shadow-xs"
                : "bg-surface text-fg border-line hover:bg-surface-2"
            }`}
          >
            {item.title.split(". ")[1] || item.title}
          </button>
        ))}
      </div>

      {/* Active Fixture Description */}
      <Card className="p-4 border border-line bg-surface-2/40">
        <h2 className="text-sm font-bold text-fg">{currentFixture.title}</h2>
        <p className="text-xs text-fg-muted mt-1">{currentFixture.desc}</p>
      </Card>

      {/* Render the ResponseCard for active fixture */}
      <div className="mt-2">
        <ResponseCard
          result={currentFixture.result}
          isStopped={currentFixture.isStopped}
          currentQuery={currentFixture.result?.query || ""}
          onCheckAnother={() => alert("Check another clicked (clears result & focuses input)")}
        />
      </div>

      {/* ThoughtLine Live Loop Section */}
      <div className="pt-8 border-t border-line space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-fg">7. ThoughtLine Progress Demo</h2>
            <p className="text-xs text-fg-muted">
              Auto-cycling through stream stages: checking_cache → searching → analyzing
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsLooping((v) => !v)}
              className="text-xs min-h-[36px]"
            >
              {isLooping ? "Pause loop" : "Resume loop"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setStageIndex((prev) => (prev + 1) % THOUGHT_STAGES.length)}
              className="text-xs min-h-[36px]"
            >
              Next stage
            </Button>
          </div>
        </div>

        <div className="p-6 bg-surface border border-line rounded-2xl shadow-xs">
          <div className="mb-4 flex items-center gap-2 text-xs text-fg-muted">
            <span className="font-semibold text-fg">Current stage:</span>
            <Badge variant="primary" size="sm">
              {THOUGHT_STAGES[stageIndex].stage}
            </Badge>
            <span>({stageIndex + 1} of 3)</span>
          </div>

          <ThoughtLine
            key={stageIndex}
            working={true}
            steps={THOUGHT_STAGES[stageIndex].steps}
            label="Thinking"
            doneLabel="Thought for"
            glyph="sparkle"
            fontSize={16}
            breathPeriod={1.6}
            breathDepth={0.45}
            settleDuration={350}
            settleBlur={2}
            collapsible
            collapseOnSettle
            showTimer
          />
        </div>
      </div>
    </div>
  );
}
