import React from "react";
import {
  Award,
  MessageSquare,
  Code2,
  Terminal,
  BrainCircuit,
} from "lucide-react";

const SKILL_FIELDS = [
  {
    label: "Communication",
    key: "communication",
    desc: "Verbal clarity, active listening, articulation of ideas",
    icon: MessageSquare,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    label: "Technical Knowledge",
    key: "technical",
    desc: "Core domain fundamentals, architecture, tool mastery",
    icon: Code2,
    color: "text-cyan-600 bg-cyan-50 border-cyan-200",
  },
  {
    label: "Programming / Coding",
    key: "programming",
    desc: "Code cleanliness, syntax fluency, algorithmic thinking",
    icon: Terminal,
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    label: "Problem Solving",
    key: "problemSolving",
    desc: "Analytical reasoning, debugging aptitude, trade-off evaluation",
    icon: BrainCircuit,
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
];

const RATING_OPTIONS = [
  {
    label: "Excellent",
    value: "Excellent",
    activeClass:
      "bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/30 ring-2 ring-emerald-500/20 font-bold",
    hoverClass: "hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
    indicator: "bg-emerald-500",
  },
  {
    label: "Good",
    value: "Good",
    activeClass:
      "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/30 ring-2 ring-blue-600/20 font-bold",
    hoverClass: "hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700",
    indicator: "bg-blue-500",
  },
  {
    label: "Below Average",
    value: "Below Average",
    activeClass:
      "bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/30 ring-2 ring-amber-500/20 font-bold",
    hoverClass: "hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700",
    indicator: "bg-amber-500",
  },
  {
    label: "Inadequate",
    value: "Inadequate",
    activeClass:
      "bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-500/30 ring-2 ring-rose-500/20 font-bold",
    hoverClass: "hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700",
    indicator: "bg-rose-500",
  },
];

/**
 * FeedbackFormSection Component
 * Renders the Skill Competency Ratings matrix with interactive segmented pills
 * and the Comprehensive Interview Notes textarea with character count.
 */
const FeedbackFormSection = ({
  ratings = {},
  updateRating,
  comments = "",
  setComments,
  isHiringManagerForThisJob = true,
}) => {
  return (
    <div className="space-y-6">
      {/* Skill Matrix Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                Skill Competency Ratings
              </h2>
              <p className="text-xs text-slate-500">
                Score candidate capabilities across essential job dimensions
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60 hidden sm:inline-block">
            4 Dimensions
          </span>
        </div>

        {/* Skill Dimensions Grid */}
        <div className="space-y-5">
          {SKILL_FIELDS.map(({ label, key, desc, icon: Icon, color }) => {
            const currentSelected = ratings[key] || "";

            return (
              <div
                key={key}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-blue-200 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 font-['Outfit']">
                        {label}
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        {desc}
                      </div>
                    </div>
                  </div>

                  {currentSelected && (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 whitespace-nowrap">
                      {currentSelected}
                    </span>
                  )}
                </div>

                {/* Interactive Segmented Rating Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {RATING_OPTIONS.map((opt) => {
                    const isSelected = currentSelected === opt.value;

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={!isHiringManagerForThisJob}
                        onClick={() => updateRating(key, opt.value)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? opt.activeClass
                            : `bg-white text-slate-600 border-slate-200/90 shadow-2xs ${opt.hoverClass}`
                        } ${
                          !isHiringManagerForThisJob
                            ? "cursor-not-allowed opacity-75"
                            : ""
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? "bg-white" : opt.indicator
                          }`}
                        />
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Native Hidden Select for Form Accessibility */}
                <select
                  value={ratings[key] || ""}
                  onChange={(e) => updateRating(key, e.target.value)}
                  className="sr-only"
                  disabled={!isHiringManagerForThisJob}
                  aria-label={label}
                >
                  <option value="" disabled>
                    Select Rating
                  </option>
                  {RATING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* Qualitative Feedback Textarea Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
              Comprehensive Interview Notes
            </h2>
            <p className="text-xs text-slate-500">
              Record detailed observations, key strengths, potential gaps, and culture
              alignment
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            disabled={!isHiringManagerForThisJob}
            rows={5}
            placeholder="Document clear, objective observations from the discussion. E.g., 'Demonstrated strong architectural understanding of distributed caching, answered algorithms efficiently with clean edge-case handling...'"
            className="w-full p-4 rounded-2xl bg-slate-50/80 border border-slate-200 text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-2xs resize-y disabled:cursor-not-allowed disabled:bg-slate-100/60"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Formatting: Plain text narrative</span>
            <span>{comments ? `${comments.length} characters` : "Empty notes"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackFormSection;
