import React from "react";
import {
  SectionCard,
  ChipList,
  CheckIcon,
  XIcon,
  SparkIcon,
  ResumeEmptyIcon,
} from "./shared";

/* =========================================================
   Local Sub-components
   ========================================================= */

const RECOMMENDATION_STYLES = {
  STRONG_MATCH: "bg-emerald-100 text-emerald-800 ring-emerald-300",
  MATCH: "bg-teal-100 text-teal-800 ring-teal-300",
  REVIEW: "bg-amber-100 text-amber-800 ring-amber-300",
  WEAK_MATCH: "bg-orange-100 text-orange-800 ring-orange-300",
};

const ScoreRing = ({ value }) => {
  const safe = Number(value) || 0;
  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-32 w-32 -rotate-90 transform">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        <circle cx="64" cy="64" r="54" stroke="#e2e8f0" strokeWidth="10" fill="transparent" />
        <circle
          cx="64"
          cy="64"
          r="54"
          stroke="url(#scoreGradient)"
          strokeWidth="10"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={339.3}
          strokeDashoffset={339.3 - (339.3 * safe) / 100}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-extrabold text-slate-900">{safe}%</div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Fit
        </div>
      </div>
    </div>
  );
};

const MiniBar = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
    <div className="mt-1 text-2xl font-extrabold text-slate-900">{value || 0}%</div>
    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-400 transition-all duration-700"
        style={{ width: `${value || 0}%` }}
      />
    </div>
  </div>
);

const InsightCard = ({ title, icon, tone, items, emptyText }) => {
  const tones = {
    emerald: "from-emerald-500 to-teal-500 bg-emerald-50/50 border-emerald-100",
    rose: "from-rose-500 to-red-500 bg-rose-50/50 border-rose-100",
    indigo: "from-indigo-500 to-blue-500 bg-white border-slate-200",
    amber: "from-amber-400 to-orange-500 bg-white border-slate-200",
  };
  return (
    <div
      className={`rounded-xl border p-5 shadow-sm ${tones[tone].split(" ").slice(2).join(" ")}`}
    >
      <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${tones[tone].split(" ")[0]} ${tones[tone].split(" ")[1]} text-white`}
        >
          {icon}
        </span>
        {title}
      </h4>
      <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
        {items && items.length > 0 ? (
          items.map((item, idx) => <li key={idx}>{item}</li>)
        ) : (
          <li>{emptyText}</li>
        )}
      </ul>
    </div>
  );
};

/* =========================================================
   Analysis Results (when analysis data exists)
   ========================================================= */

const AnalysisResults = ({ analysis, isAnalyzing, onAnalyzeResume }) => {
  const recommendationKey = analysis?.recommendation;
  const recommendationTone =
    RECOMMENDATION_STYLES[recommendationKey] ||
    "bg-rose-100 text-rose-800 ring-rose-300";

  return (
    <div className="space-y-6">
      {/* Score & recommendation */}
      <div className="grid items-center gap-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-indigo-50/30 to-sky-50/40 p-6 shadow-sm md:grid-cols-3">
        <div className="flex flex-col items-center justify-center text-center">
          <ScoreRing value={analysis.score?.overall} />
          <span className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Overall Fit Score
          </span>
        </div>

        <div className="space-y-4 md:col-span-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-slate-500">
              Recommendation:
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ring-1 ring-inset ${recommendationTone}`}
            >
              {analysis.recommendation?.replace("_", " ")}
            </span>
          </div>
          <div className="rounded-xl border-l-4 border-indigo-400 bg-white/80 p-4">
            <p className="text-sm italic leading-relaxed text-slate-700">
              &ldquo;{analysis.summary}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Sub-scores */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MiniBar label="Technical" value={analysis.score?.technical} />
        <MiniBar label="Experience" value={analysis.score?.experience} />
        <MiniBar label="Education" value={analysis.score?.education} />
        <MiniBar label="Projects" value={analysis.score?.projects} />
      </div>

      {/* Skills */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
              <CheckIcon />
            </span>
            Matched Skills ({analysis.matchedSkills?.length || 0})
          </h4>
          <ChipList items={analysis.matchedSkills} tone="emerald" />
        </div>

        <div className="rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-5">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-rose-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white">
              <XIcon />
            </span>
            Missing Skills ({analysis.missingSkills?.length || 0})
          </h4>
          <ChipList items={analysis.missingSkills} tone="rose" />
        </div>
      </div>

      {/* Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <InsightCard
          title="Candidate Strengths"
          icon={<CheckIcon />}
          tone="emerald"
          items={analysis.strengths}
          emptyText="None noted"
        />
        <InsightCard
          title="Areas for Improvement"
          icon={<SparkIcon />}
          tone="amber"
          items={analysis.weaknesses}
          emptyText="None noted"
        />
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="button"
          disabled={isAnalyzing}
          onClick={onAnalyzeResume}
          className="cursor-pointer rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-gradient-to-r hover:from-indigo-600 hover:to-violet-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAnalyzing ? "Re-analyzing..." : "Run Re-analysis"}
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   Empty State (no analysis yet)
   ========================================================= */

const AnalysisEmptyState = ({ isAnalyzing, analysisError, onAnalyzeResume }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-500 text-white shadow-lg">
      <ResumeEmptyIcon />
    </div>
    <h4 className="mb-1 text-base font-bold text-slate-800">Resume ATS Analyzer</h4>
    <p className="mb-6 max-w-md text-sm leading-relaxed text-slate-500">
      Gemini can read this candidate&apos;s resume, extract skills, highlight key
      strengths and weaknesses, and score their overall job fit.
    </p>

    <button
      type="button"
      disabled={isAnalyzing}
      onClick={onAnalyzeResume}
      className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isAnalyzing ? (
        <>
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span>Analyzing Resume...</span>
        </>
      ) : (
        <span>Analyze Resume</span>
      )}
    </button>

    {analysisError && (
      <p className="mt-4 rounded-lg border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs text-rose-600">
        {analysisError}
      </p>
    )}
  </div>
);

/* =========================================================
   ATSAnalysis — Main Export
   ========================================================= */

/**
 * ATSAnalysis
 * Renders the ATS resume analysis section — loading spinner, analysis results
 * with scores/skills/insights, or the empty state with analyze button.
 */
const ATSAnalysis = ({
  analysis,
  loadingAnalysis,
  isAnalyzing,
  analysisError,
  onAnalyzeResume,
}) => (
  <SectionCard
    title="Resume ATS Analysis"
    subtitle="Match candidate resumes against the job description and extract profile matching scores."
    icon={<SparkIcon />}
    accent="from-fuchsia-500 to-violet-500"
  >
    {loadingAnalysis ? (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
        <p className="text-sm text-slate-500">
          Checking for existing resume analysis...
        </p>
      </div>
    ) : analysis ? (
      <AnalysisResults
        analysis={analysis}
        isAnalyzing={isAnalyzing}
        onAnalyzeResume={onAnalyzeResume}
      />
    ) : (
      <AnalysisEmptyState
        isAnalyzing={isAnalyzing}
        analysisError={analysisError}
        onAnalyzeResume={onAnalyzeResume}
      />
    )}
  </SectionCard>
);

export default ATSAnalysis;
