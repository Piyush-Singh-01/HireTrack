import React from "react";
import { FiEdit, FiTrash, FiUser, FiCalendar, FiClock } from "react-icons/fi";
import FormattedDate from "../common/FormattedDate";

const STATUS_STYLES = {
  Open: {
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  Closed: {
    pill: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
  },
  default: {
    pill: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  },
};

export const StatusPill = ({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.default;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${style.pill}`}
    >
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {status || "-"}
    </span>
  );
};

export const InfoRow = ({ label, children }) => (
  <div className="flex flex-col min-w-0">
    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </span>
    <span className="text-sm font-medium text-slate-800 truncate">{children}</span>
  </div>
);

/**
 * PositionCard Component
 * Displays a single position with status, metadata, actions, and details trigger.
 */
const PositionCard = ({
  job,
  canManage = true,
  onDetails,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  if (!job) return null;

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_16px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base md:text-lg font-bold text-slate-900 leading-snug line-clamp-2">
          {job.title}
        </h3>
        <div className="flex shrink-0 items-center gap-1">
          {canManage && (
            <>
              {onEdit && (
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue hover:bg-blue/10 transition-colors duration-200 cursor-pointer"
                  onClick={() => onEdit(job.id)}
                  title="Edit Position"
                  aria-label="Edit Position"
                >
                  <FiEdit className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  onClick={() => onDelete(job.id, job.title)}
                  disabled={isDeleting}
                  title="Delete Position"
                  aria-label="Delete Position"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiTrash className="w-4 h-4" />
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-2">
        <StatusPill status={job.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
        <div className="col-span-2">
          <InfoRow label="Hiring Manager">
            <span className="inline-flex items-center gap-1.5">
              <FiUser className="shrink-0 text-slate-400" />
              {job.hiringManager || "-"}
            </span>
          </InfoRow>
        </div>
        <InfoRow label="Openings">{job.openings}</InfoRow>
        <InfoRow label="Applicants">{job.applicantsCount} Candidates</InfoRow>
        <InfoRow label="Opened On">
          <span className="inline-flex items-center gap-1.5">
            <FiCalendar className="shrink-0 text-slate-400" />
            <FormattedDate date={job.openedOn} />
          </span>
        </InfoRow>
        <InfoRow label="Closed On">
          <span className="inline-flex items-center gap-1.5">
            <FiCalendar className="shrink-0 text-slate-400" />
            <FormattedDate date={job.closedOn} />
          </span>
        </InfoRow>
        <div className="col-span-2">
          <InfoRow label="Posted On">
            <span className="inline-flex items-center gap-1.5">
              <FiClock className="shrink-0 text-slate-400" />
              <FormattedDate date={job.postedOn} />
            </span>
          </InfoRow>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-xl border border-blue/40 bg-indigo-700 py-2 text-sm font-semibold text-white hover:bg-indigo-800 hover:border-blue transition-colors duration-200 cursor-pointer"
        onClick={() => onDetails && onDetails(job)}
      >
        View Details
      </button>
    </article>
  );
};

export default PositionCard;
