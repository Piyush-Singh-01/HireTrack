import React from "react";
import { HiOutlineCheckCircle } from "react-icons/hi";
import { RxCrossCircled } from "react-icons/rx";
import { Avatar, BriefcaseIcon } from "./shared";

/**
 * CandidateProfileHero
 * Displays the candidate's name, applied role, profile status badge,
 * and shortlist/reject action buttons (when in "Applied" status).
 */
const CandidateProfileHero = ({
  displayName,
  appliedRole,
  profileStatus,
  isApplied,
  isHiringManagerForThisJob,
  onToggleShortlist,
  onOpenRejectModal,
  isRejecting,
}) => (
  <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 to-indigo-600 p-6 text-white shadow-xl sm:p-8">
    <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
    <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl" />

    <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-5">
        <Avatar name={displayName} />
        <div className="min-w-0">
          {profileStatus && (
            <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-inset ring-white/25 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              {profileStatus}
            </span>
          )}
          <h2 className="truncate text-2xl font-bold md:text-3xl">{displayName}</h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-white/80">
            <BriefcaseIcon />
            {appliedRole}
          </p>
        </div>
      </div>

      {/* Action Buttons for Applied status */}
      {isApplied && isHiringManagerForThisJob && (
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() => onToggleShortlist((prev) => !prev)}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <HiOutlineCheckCircle className="text-lg" />
            <span>Shortlist</span>
          </button>

          <button
            type="button"
            onClick={onOpenRejectModal}
            disabled={isRejecting}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/40 bg-rose-500/90 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RxCrossCircled className="text-lg" />
            <span>{isRejecting ? "Rejecting..." : "Reject Profile"}</span>
          </button>
        </div>
      )}
    </div>
  </section>
);

export default CandidateProfileHero;
