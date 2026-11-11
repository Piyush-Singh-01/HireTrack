import React from "react";
import { ArrowLeft, Sparkles, ShieldAlert } from "lucide-react";
import Toast from "../../ui/Toast";
import Reschedule from "../../schedule/Reschedule";
import FeedbackFormSection from "./feedback/FeedbackFormSection";
import CandidateSummaryCard from "./feedback/CandidateSummaryCard";
import FeedbackDecisionPanel from "./feedback/FeedbackDecisionPanel";

/**
 * Feedback Component
 * Main UI composition component that coordinates the candidate evaluation interface:
 * renders page header, interviewer permission alert, two-column layout containing
 * the feedback form, candidate dossier card, and decision panel, plus toast and reschedule modal.
 */
const Feedback = ({
  candidateInfo,
  // Backward compatibility fallback props
  candidate,
  candidateDisplayName,
  candidateDisplayPosition,
  initials,
  formattedInterviewDate,
  formattedInterviewTime,
  ratings = {},
  updateRating,
  comments = "",
  setComments,
  newStatus = "",
  setNewStatus,
  showFeedback = false,
  isDirectReject = false,
  isHiringManagerForThisJob = true,
  isSubmitting = false,
  isActionPending = false,
  showReschedule = false,
  selectedInterviewForReschedule,
  onOpenReschedule,
  onCloseReschedule,
  onRescheduleSuccess,
  toast = null,
  onBack,
  onRejectFromOnHold,
  onHireFromOnHold,
  onSubmitFinalDecision,
}) => {
  const info = candidateInfo || {
    name: candidateDisplayName || "Candidate",
    position: candidateDisplayPosition || "Role Position",
    initials: initials || "CA",
    interviewDate: formattedInterviewDate || "Pending Schedule",
    interviewTime: formattedInterviewTime || "Time TBD",
    recruiter: selectedInterviewForReschedule?.recruiter || null,
    profileStatus: candidate?.profileStatus || null,
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-6 sm:py-8 px-3 sm:px-6 lg:px-10 transition-colors">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* ================= PAGE HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={onBack}
              className="w-11 h-11 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 hover:text-blue-600 flex items-center justify-center transition-all shadow-xs cursor-pointer group shrink-0"
              title="Return to previous view"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/70 font-['Outfit']">
                  <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" />
                  Interview Assessment
                </span>
                {info.profileStatus && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                    Status: {info.profileStatus}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight">
                Candidate Evaluation
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 self-start sm:self-auto">
            <span>Evaluating:</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold shadow-xs">
              {info.name}
            </span>
          </div>
        </div>

        {/* ================= PERMISSION NOTICE ================= */}
        {!isHiringManagerForThisJob && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3 text-xs sm:text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Read-Only Observation Mode:</strong> You are
              viewing this candidate's evaluation as an interviewer. Only assigned Hiring
              Managers or SuperAdmins have authorization to submit formal decisions and
              modify skill competency ratings.
            </div>
          </div>
        )}

        {/* ================= TWO-COLUMN WORKSPACE ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* ================= LEFT COLUMN: SKILL RATINGS & NOTES ================= */}
          <div className="lg:col-span-7 space-y-6">
            <FeedbackFormSection
              ratings={ratings}
              updateRating={updateRating}
              comments={comments}
              setComments={setComments}
              isHiringManagerForThisJob={isHiringManagerForThisJob}
            />
          </div>

          {/* ================= RIGHT COLUMN: CANDIDATE PROFILE & ACTIONS ================= */}
          <div className="lg:col-span-5 space-y-6">
            <CandidateSummaryCard candidateInfo={info} />

            <FeedbackDecisionPanel
              showFeedback={showFeedback}
              profileStatus={info.profileStatus}
              isHiringManagerForThisJob={isHiringManagerForThisJob}
              isDirectReject={isDirectReject}
              newStatus={newStatus}
              setNewStatus={setNewStatus}
              isSubmitting={isSubmitting}
              isActionPending={isActionPending}
              onRejectFromOnHold={onRejectFromOnHold}
              onOpenReschedule={onOpenReschedule}
              onHireFromOnHold={onHireFromOnHold}
              onSubmitFinalDecision={onSubmitFinalDecision}
              onBack={onBack}
            />
          </div>
        </div>
      </div>

      {/* ================= RESCHEDULE MODAL ================= */}
      {showReschedule && selectedInterviewForReschedule && (
        <Reschedule
          interview={selectedInterviewForReschedule}
          onCancel={onCloseReschedule}
          onSuccess={onRescheduleSuccess}
        />
      )}
    </div>
  );
};

export default Feedback;