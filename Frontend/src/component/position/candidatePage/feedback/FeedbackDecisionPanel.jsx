import React from "react";
import {
  CheckCircle2,
  XCircle,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  PauseCircle,
  Send,
} from "lucide-react";
import feedbackImg from "../../../../assets/Feedback/feedback.png";

/**
 * FeedbackDecisionPanel Component
 * Handles candidate decision options and submission:
 * Mode 1 (showFeedback === true): Candidate on-hold actions (Reject, Reschedule, Hire).
 * Mode 2 (showFeedback === false): Hiring committee decision status selection (Hire, On-Wait, Reject),
 * submission button, and cancel action.
 */
const FeedbackDecisionPanel = ({
  showFeedback = false,
  profileStatus,
  candidate,
  isHiringManagerForThisJob = true,
  isDirectReject = false,
  newStatus = "",
  setNewStatus,
  isSubmitting = false,
  isActionPending = false,
  feedbackMutate = {},
  reject = {},
  shortlist = {},
  onRejectFromOnHold,
  onOpenReschedule,
  setShowReschedule,
  onHireFromOnHold,
  onSubmitFinalDecision,
  onBack,
}) => {
  const currentStatus = profileStatus || candidate?.profileStatus || null;
  const isPending =
    isActionPending ||
    Boolean(reject.isPending || shortlist.isPending || feedbackMutate.isPending);
  const isSubmitPending = isSubmitting || Boolean(feedbackMutate.isPending);
  const handleReschedule = onOpenReschedule || (() => setShowReschedule?.(true));

  return (
    <>
      {/* MODE 1: showFeedback === true (Candidate on-hold actions) */}
      {showFeedback && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                Candidate Decision
              </h3>
              <p className="text-[11px] text-slate-500">
                Execute final decision on current application pipeline
              </p>
            </div>
          </div>

          {currentStatus === "onhold" && isHiringManagerForThisJob && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Reject Button */}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={onRejectFromOnHold}
                  className="py-3 px-3 rounded-2xl border border-rose-200 bg-rose-50/70 hover:bg-rose-600 text-rose-700 hover:text-white transition-all font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {isSubmitPending ? "Rejecting..." : "Reject Profile"}
                  </span>
                </button>

                {/* Reschedule Button */}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleReschedule}
                  className="py-3 px-3 rounded-2xl border border-blue-200 bg-blue-50/70 hover:bg-blue-600 text-blue-700 hover:text-white transition-all font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Reschedule</span>
                </button>

                {/* Hire Button */}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={onHireFromOnHold}
                  className="py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {isSubmitPending ? "Processing..." : "Hire Candidate"}
                  </span>
                </button>
              </div>
            </div>
          )}

          <div className="pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-4">
              <img
                src={feedbackImg}
                alt="Feedback Assessment Illustration"
                className="w-20 h-auto shrink-0 hidden sm:block object-contain"
              />
              <div className="text-xs text-slate-600 leading-relaxed">
                Documenting timely, competency-driven assessments ensures a smooth
                candidate journey and empowers collaborative hiring.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: !showFeedback (General status selection & submission) */}
      {!showFeedback && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                Final Hiring Committee Decision
              </h3>
              <p className="text-[11px] text-slate-500">
                Select candidate status and commit formal evaluation
              </p>
            </div>
          </div>

          {/* Status Selection Cards */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Target Pipeline Status <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Hire Option */}
              {isHiringManagerForThisJob && !isDirectReject && (
                <button
                  type="button"
                  onClick={() => setNewStatus("hired")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    newStatus === "hired"
                      ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/25 shadow-xs"
                      : "bg-slate-50 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`p-1.5 rounded-lg ${
                        newStatus === "hired"
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        newStatus === "hired"
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-slate-300"
                      }`}
                    />
                  </div>
                  <div>
                    <div
                      className={`text-xs font-bold ${
                        newStatus === "hired"
                          ? "text-emerald-900"
                          : "text-slate-800"
                      }`}
                    >
                      Hire
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Extend Offer
                    </div>
                  </div>
                </button>
              )}

              {/* On-Wait Option */}
              {isHiringManagerForThisJob && !isDirectReject && (
                <button
                  type="button"
                  onClick={() => setNewStatus("onhold")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    newStatus === "onhold"
                      ? "bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/25 shadow-xs"
                      : "bg-slate-50 border-slate-200 hover:border-amber-300 hover:bg-amber-50/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`p-1.5 rounded-lg ${
                        newStatus === "onhold"
                          ? "bg-amber-500 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      <PauseCircle className="w-3.5 h-3.5" />
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        newStatus === "onhold"
                          ? "bg-amber-500 animate-pulse"
                          : "bg-slate-300"
                      }`}
                    />
                  </div>
                  <div>
                    <div
                      className={`text-xs font-bold ${
                        newStatus === "onhold"
                          ? "text-amber-900"
                          : "text-slate-800"
                      }`}
                    >
                      On-Wait
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Hold Candidate
                    </div>
                  </div>
                </button>
              )}

              {/* Reject Option */}
              {isHiringManagerForThisJob && (
                <button
                  type="button"
                  onClick={() => setNewStatus("rejected")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    newStatus === "rejected"
                      ? "bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/25 shadow-xs"
                      : "bg-slate-50 border-slate-200 hover:border-rose-300 hover:bg-rose-50/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`p-1.5 rounded-lg ${
                        newStatus === "rejected"
                          ? "bg-rose-500 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        newStatus === "rejected"
                          ? "bg-rose-500 animate-pulse"
                          : "bg-slate-300"
                      }`}
                    />
                  </div>
                  <div>
                    <div
                      className={`text-xs font-bold ${
                        newStatus === "rejected"
                          ? "text-rose-900"
                          : "text-slate-800"
                      }`}
                    >
                      Reject
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Archive Profile
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Submit Action Buttons */}
          <div className="space-y-3 pt-2">
            {isHiringManagerForThisJob && (
              <button
                type="button"
                disabled={isSubmitPending}
                onClick={onSubmitFinalDecision}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitPending
                    ? "Submitting Decision..."
                    : "Submit Assessment & Decision"}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onBack}
              className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs transition-all cursor-pointer text-center"
            >
              Cancel &amp; Return
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackDecisionPanel;
