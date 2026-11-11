import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Award,
  CheckCircle2,
  Calendar,
  Clock,
  Briefcase,
  User,
  MessageSquare,
  Code2,
  Terminal,
  BrainCircuit,
  Send,
  ThumbsUp,
  ThumbsDown,
  PauseCircle,
  HelpCircle,
} from "lucide-react";
import feedbackImg from "../../assets/Feedback/feedback.png";
import { useFeedback } from "../../hooks/useScheduleFeedback";
import { useToast } from "../../utils/ToastContext";

const Schedule_Feedback_Post = ({ onBack, onSuccess, ...props }) => {
  const {
    candidate,
    ratings,
    comments,
    setComments,
    overallRating,
    setOverallRating,
    updateRating,
    submitFeedback,
    rejectCandidate,
    shortlistCandidate,
    showFeedback,
  } = useFeedback();

  const navigate = useNavigate();
  const { showToast } = useToast();
  const [newStatus, setNewStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const skillFields = [
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
      desc: "Analytical reasoning, debugging aptitude, trade-offs",
      icon: BrainCircuit,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
  ];

  const ratingOptions = [
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

  const candidateDisplayName =
    candidate?.name ||
    candidate?.fullName ||
    candidate?.candidateName ||
    "Candidate";

  const candidatePosition =
    candidate?.position ||
    candidate?.jobTitle ||
    "Interviewee";

  const initials = useMemo(() => {
    const parts = candidateDisplayName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return candidateDisplayName.slice(0, 2).toUpperCase() || "CA";
  }, [candidateDisplayName]);

  const formattedInterviewDate = useMemo(() => {
    const rawDate =
      candidate?.interviewSchedule?.interviewDate ||
      candidate?.date ||
      candidate?.interviewDate ||
      (candidate?.lastUpdated ? candidate.lastUpdated : null);

    if (!rawDate) return "Pending Schedule";
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return String(rawDate);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return String(rawDate);
    }
  }, [candidate]);

  const formattedInterviewTime = useMemo(() => {
    return (
      candidate?.interviewSchedule?.interviewTime ||
      candidate?.time ||
      candidate?.interviewTime ||
      "Time TBD"
    );
  }, [candidate]);

  const handleSubmit = async () => {
    if (!newStatus) {
      showToast("Please select candidate status", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback({
        ratings,
        comments,
        newStatus,
      });
      showToast("Feedback submitted successfully!", "success");
      if (onSuccess) {
        onSuccess();
      } else {
        handleBack();
      }
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to submit feedback";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-6 sm:py-8 px-3 sm:px-6 lg:px-10 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={handleBack}
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
                  Schedule Assessment
                </span>
                {candidate?.profileStatus && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                    Status: {candidate.profileStatus}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight">
                Candidate Feedback
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 self-start sm:self-auto">
            <span>Evaluating:</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold shadow-xs">
              {candidateDisplayName}
            </span>
          </div>
        </div>

        {/* ================= MAIN TWO-COLUMN WORKSPACE ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* ================= LEFT COLUMN: RATINGS & NOTES ================= */}
          <div className="lg:col-span-7 space-y-6">
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
                      Score candidate capabilities across key interview competencies
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60 hidden sm:inline-block">
                  4 Dimensions
                </span>
              </div>

              {/* Skill Dimensions Grid */}
              <div className="space-y-5">
                {skillFields.map(({ label, key, desc, icon: Icon, color }) => {
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

                      {/* Interactive Segmented Rating Buttons */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {ratingOptions.map((opt) => {
                          const isSelected = currentSelected === opt.value;

                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => updateRating(key, opt.value)}
                              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                                isSelected
                                  ? opt.activeClass
                                  : `bg-white text-slate-600 border-slate-200/90 shadow-2xs ${opt.hoverClass}`
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

                      {/* Accessible Hidden Select for fallback */}
                      <select
                        value={ratings[key] || ""}
                        onChange={(e) => updateRating(key, e.target.value)}
                        className="sr-only"
                        aria-label={label}
                      >
                        <option value="" disabled>
                          Select Rating
                        </option>
                        {ratingOptions.map((opt) => (
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
                    Qualitative Interview Notes
                  </h2>
                  <p className="text-xs text-slate-500">
                    Record detailed observations, problem-solving depth, and overall evaluation
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={5}
                  placeholder="Summarize candidate discussion, architecture highlights, algorithm clarity, communication style, and key recommendations..."
                  className="w-full p-4 rounded-2xl bg-slate-50/80 border border-slate-200 text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-2xs resize-y"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Formatting: Plain text narrative</span>
                  <span>{comments ? `${comments.length} characters` : "Empty notes"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: CANDIDATE DOSSIER & ACTIONS ================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* Candidate Identity Dossier Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-slate-800 space-y-5">
              {/* Decorative Glow Orbs */}
              <div className="absolute -right-16 -top-16 w-44 h-44 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 shrink-0">
                  <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center font-['Outfit'] font-black text-xl text-white tracking-wider">
                    {initials}
                  </div>
                </div>

                <div className="min-w-0">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-cyan-300 border border-white/10 mb-1">
                    Candidate Profile
                  </span>
                  <h3 className="text-xl font-extrabold text-white font-['Outfit'] truncate">
                    {candidateDisplayName}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium truncate flex items-center gap-1.5 mt-0.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    Applied for: {candidatePosition}
                  </p>
                </div>
              </div>

              {/* Schedule Details Box */}
              <div className="relative z-10 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  Scheduled Session
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">
                      Date
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
                      {formattedInterviewDate}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">
                      Time Slot
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white mt-0.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {formattedInterviewTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decision & Action Hub */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                    Hiring Pipeline Decision
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Choose status update and commit candidate feedback
                  </p>
                </div>
              </div>

              {/* Target Status Cards */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Select Action / Status <span className="text-rose-500">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Hire Button */}
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
                        Advance Candidate
                      </div>
                    </div>
                  </button>

                  {/* On-Wait Button */}
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
                        Hold Profile
                      </div>
                    </div>
                  </button>

                  {/* Reject Button */}
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
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting ? "Submitting Feedback..." : "Submit Feedback & Decision"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs transition-all cursor-pointer text-center"
                >
                  Cancel &amp; Return
                </button>
              </div>

              {/* Bottom Info Tip with illustration */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-4">
                <img
                  src={feedbackImg}
                  alt="Feedback Assessment Illustration"
                  className="w-16 h-auto shrink-0 hidden sm:block object-contain"
                />
                <div className="text-xs text-slate-600 leading-relaxed">
                  Submitting this feedback automatically updates the candidate's hiring pipeline status and records competency ratings.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule_Feedback_Post;