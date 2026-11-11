import React from "react";
import { Briefcase, Calendar, Clock } from "lucide-react";

/**
 * CandidateSummaryCard Component
 * Renders the Candidate Identity Dossier card displaying initials avatar,
 * name, position, scheduled date, interview time, and assigned recruiter information.
 */
const CandidateSummaryCard = ({
  candidateInfo,
  initials: propInitials,
  candidateDisplayName: propName,
  candidateDisplayPosition: propPosition,
  formattedInterviewDate: propDate,
  formattedInterviewTime: propTime,
  recruiter: propRecruiter,
}) => {
  const initials = candidateInfo?.initials || propInitials || "CA";
  const name = candidateInfo?.name || propName || "Candidate";
  const position = candidateInfo?.position || propPosition || "Role Position";
  const interviewDate =
    candidateInfo?.interviewDate || propDate || "Pending Schedule";
  const interviewTime =
    candidateInfo?.interviewTime || propTime || "Time TBD";
  const recruiter = candidateInfo?.recruiter || propRecruiter || null;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-slate-800 space-y-5">
      {/* Ambient Glows */}
      <div className="absolute -right-16 -top-16 w-44 h-44 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Candidate Identity Header */}
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
            {name}
          </h3>
          <p className="text-xs text-slate-300 font-medium truncate flex items-center gap-1.5 mt-0.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {position}
          </p>
        </div>
      </div>

      {/* Schedule Info Box */}
      <div className="relative z-10 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          Confirmed Schedule Details
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase">
              Date
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
              {interviewDate}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase">
              Session Time
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {interviewTime}
            </div>
          </div>
        </div>

        {recruiter && (
          <div className="pt-2 border-t border-white/5 text-[11px] text-slate-300 flex items-center justify-between">
            <span className="text-slate-400">Assigned Recruiter:</span>
            <span className="font-semibold text-white">{recruiter}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateSummaryCard;
