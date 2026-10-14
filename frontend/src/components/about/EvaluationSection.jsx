import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { siteConfig } from "../../config/site";

export default function EvaluationSection({ benchmark }) {
  if (!benchmark || typeof benchmark.accuracy !== "number") {
    return null;
  }

  const evalUrl = `${siteConfig.github || "https://github.com/Brijesh667/Sentinels_of_Truth"}/tree/main/Backend/eval`;

  return (
    <Card className="p-6 sm:p-8 border border-line bg-surface mt-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            BENCHMARK
          </Badge>
          <h3 className="text-lg font-bold text-fg font-display">
            Automated Evaluation Metrics
          </h3>
        </div>
        {benchmark.runDate && (
          <span className="text-xs text-fg-muted">
            Evaluated on: {benchmark.runDate}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {benchmark.claims != null && (
          <div className="p-4 rounded-xl bg-surface-2 border border-line">
            <span className="text-[11px] font-semibold text-fg-muted uppercase tracking-wider block mb-1">
              Claims Tested
            </span>
            <span className="text-2xl font-bold font-display text-fg">
              {benchmark.claims}
            </span>
          </div>
        )}

        <div className="p-4 rounded-xl bg-surface-2 border border-line">
          <span className="text-[11px] font-semibold text-fg-muted uppercase tracking-wider block mb-1">
            Accuracy
          </span>
          <span className="text-2xl font-bold font-display text-success">
            {benchmark.accuracy}%
          </span>
        </div>

        {benchmark.precision != null && (
          <div className="p-4 rounded-xl bg-surface-2 border border-line">
            <span className="text-[11px] font-semibold text-fg-muted uppercase tracking-wider block mb-1">
              Precision
            </span>
            <span className="text-2xl font-bold font-display text-fg">
              {benchmark.precision}%
            </span>
          </div>
        )}

        {benchmark.recall != null && (
          <div className="p-4 rounded-xl bg-surface-2 border border-line">
            <span className="text-[11px] font-semibold text-fg-muted uppercase tracking-wider block mb-1">
              Recall
            </span>
            <span className="text-2xl font-bold font-display text-fg">
              {benchmark.recall}%
            </span>
          </div>
        )}

        {benchmark.f1 != null && (
          <div className="p-4 rounded-xl bg-surface-2 border border-line">
            <span className="text-[11px] font-semibold text-fg-muted uppercase tracking-wider block mb-1">
              F1 Score
            </span>
            <span className="text-2xl font-bold font-display text-fg">
              {benchmark.f1}
            </span>
          </div>
        )}
      </div>

      {benchmark.withSearchGain != null && (
        <div className="p-3 rounded-xl bg-success-soft border border-success/25 text-xs text-success-fg">
          <strong>Search Impact:</strong> +{benchmark.withSearchGain}% accuracy
          gain observed when live web retrieval is enabled vs static model memory.
        </div>
      )}

      <div className="text-xs text-fg-muted pt-2 border-t border-line flex items-center justify-between flex-wrap gap-2">
        <span>
          Measured against a curated dataset of confirmed factual claims and debunked hoaxes.
        </span>
        <a
          href={evalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium inline-flex items-center gap-1"
        >
          <span>View test suite in Backend/eval</span>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>
    </Card>
  );
}
