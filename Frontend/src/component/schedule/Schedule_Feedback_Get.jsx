import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  Briefcase,
  User,
  MessageSquare,
  Code2,
  Terminal,
  BrainCircuit,
  ThumbsDown,
  ShieldCheck,
  FileCheck2,
} from "lucide-react";
import feedbackImg from "../../assets/Feedback/feedback.png";
import { useFeedback } from "../../hooks/useScheduleFeedback";
import { useToast } from "../../utils/ToastContext";

const Schedule_Feedback_Get = ({ onBack, onSuccess, ...props }) => {
  const {
    candidate,
    ratings,
    comments,
    rejectCandidate,
    shortlistCandidate,
  } = useFeedback();

  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isRejecting, setIsRejecting] = useState(false);
  const [isShortlisting, setIsShortlisting] = useState(false);

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

  const getRatingBadge = (val) => {
    switch (val) {
      case "Excellent":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-400/20",
          dot: "bg-emerald-500",
        };
      case "Good":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-300 ring-1 ring-blue-400/20",
          dot: "bg-blue-500",
        };
      case "Below Average":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-400/20",
          dot: "bg-amber-500",
        };
      case "Inadequate":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-400/20",
          dot: "bg-rose-500",
        };
      default:
        return {
          bg: "bg-slate-100 text-slate-600 border-slate-200",
          dot: "bg-slate-400",
        };
    }
  };

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

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await rejectCandidate("Not suitable after interview");
      showToast("Candidate profile rejected", "success");
      if (onSuccess) {
        onSuccess();
      } else {
        handleBack();
      }
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to reject candidate";
      showToast(msg, "error");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleShortlist = async () => {
    setIsShortlisting(true);
    try {
      await shortlistCandidate();
      showToast("Candidate successfully shortlisted!", "success");
      if (onSuccess) {
        onSuccess();
      } else {
        handleBack();
      }
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to shortlist candidate";
      showToast(msg, "error");
    } finally {
      setIsShortlisting(false);
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
                  <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                  Recorded Evaluation
                </span>
                {candidate?.profileStatus && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                    Status: {candidate.profileStatus}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight">
                Candidate Evaluation Record
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 self-start sm:self-auto">
            <span>Candidate:</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold shadow-xs">
              {candidateDisplayName}
            </span>
          </div>
        </div>

        {/* ================= MAIN TWO-COLUMN WORKSPACE ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* ================= LEFT COLUMN: RECORDED RATINGS & NOTES ================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Skill Matrix Summary Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 shadow-xs">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                      Recorded Competency Scores
                    </h2>
                    <p className="text-xs text-slate-500">
                      Evaluated dimensions recorded during candidate assessment
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 hidden sm:inline-block">
                  Verified
                </span>
              </div>

              {/* Dimensions Grid */}
              <div className="space-y-4">
                {skillFields.map(({ label, key, desc, icon: Icon, color }) => {
                  const val = ratings[key] || "Not Specified";
                  const badge = getRatingBadge(val);

                  return (
                    <div
                      key={key}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${color}`}
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

                      <div
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold self-start sm:self-auto ${badge.bg}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                        <span>{val}</span>
                      </div>
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
                    Interviewer Observations &amp; Feedback
                  </h2>
                  <p className="text-xs text-slate-500">
                    Detailed qualitative notes logged by the evaluation team
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200 text-slate-800 text-sm leading-relaxed min-h-[120px] whitespace-pre-wrap font-medium">
                {comments || (
                  <span className="text-slate-400 italic">
                    No detailed written comments provided for this candidate evaluation.
                  </span>
                )}
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

            {/* Pipeline Actions (if not already Hired) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                    Pipeline Decision
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Take action based on evaluated candidate feedback
                  </p>
                </div>
              </div>

              {candidate?.profileStatus?.toLowerCase() !== "hired" ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={isRejecting || isShortlisting}
                      onClick={handleReject}
                      className="py-3 px-4 rounded-2xl border border-rose-200 bg-rose-50/70 hover:bg-rose-600 text-rose-700 hover:text-white transition-all font-bold text-xs flex items-center justify-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>{isRejecting ? "Rejecting..." : "Reject Profile"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isRejecting || isShortlisting}
                      onClick={handleShortlist}
                      className="py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{isShortlisting ? "Shortlisting..." : "Shortlist"}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs transition-all cursor-pointer text-center"
                  >
                    Back to Schedule
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>This candidate has already been marked as Hired.</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-all cursor-pointer text-center"
                  >
                    Back to Schedule
                  </button>
                </div>
              )}

              {/* Bottom Tip with illustration */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-4">
                <img
                  src={feedbackImg}
                  alt="Feedback Assessment Illustration"
                  className="w-16 h-auto shrink-0 hidden sm:block object-contain"
                />
                <div className="text-xs text-slate-600 leading-relaxed">
                  Evaluations are permanently associated with this candidate's application profile for auditability and compliance.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule_Feedback_Get;