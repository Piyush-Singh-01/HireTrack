import React from "react";
import { FiTrash, FiUser, FiHash, FiUsers, FiCalendar, FiClock } from "react-icons/fi";

const DEFAULT_BUTTON_CLASS =
  "inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue/40 bg-white py-2.5 text-sm font-semibold text-blue transition-all hover:border-transparent hover:bg-gradient-to-r hover:from-[#324371] hover:to-[#4f6bb8] hover:text-white hover:shadow-md mt-auto";

// Helper function to safely render values (unchanged logic)
const safeRender = (value) => {
  if (value === null || value === undefined) return "--";
  if (typeof value === "object") {
    if (value.name) return value.name;
    if (value.userId) return value.userId;
    return JSON.stringify(value);
  }
  return value;
};

const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
      <Icon className="text-sm" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="truncate text-sm font-medium text-slate-800">{children}</div>
    </div>
  </div>
);

const JobCard = ({
  role,
  manager,
  opening,
  openDate,
  closeDate,
  count,
  post,
  buttonText = "Use this Template",
  onButtonClick,
  onDeleteClick,
  buttonClassName = DEFAULT_BUTTON_CLASS,
}) => {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 " />

      {/* Job role + delete */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-base font-bold leading-snug text-slate-900 line-clamp-2 lg:text-lg">
          {safeRender(role)}
        </h3>
        <button
          type="button"
          className="shrink-0 cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-600"
          onClick={onDeleteClick}
          title="Delete Position"
          aria-label="Delete"
        >
          <FiTrash className="h-4 w-4" />
        </button>
      </div>

      {/* Job details */}
      <div className="grid flex-1 grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <InfoRow icon={FiUser} label="Hiring Manager">
            {safeRender(manager)}
          </InfoRow>
        </div>
        <InfoRow icon={FiHash} label="Openings">
          {safeRender(opening)}
        </InfoRow>
        <InfoRow icon={FiUsers} label="Applicants">
          {safeRender(count)} Candidates
        </InfoRow>
        <InfoRow icon={FiCalendar} label="Opened On">
          {safeRender(openDate)}
        </InfoRow>
        <InfoRow icon={FiCalendar} label="Closed On">
          {safeRender(closeDate)}
        </InfoRow>
        <div className="sm:col-span-2">
          <InfoRow icon={FiClock} label="Posted On">
            {safeRender(post)}
          </InfoRow>
        </div>
      </div>

      {/* Customizable button */}
         {onButtonClick && (
        <button
          type="button"
          className={`${buttonClassName} inline-flex min-h-11 items-center justify-center rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 transition duration-200 hover:border-indigo-600 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-violet-600 hover:text-white focus:outline-none focus:ring-4 focus:ring-indigo-100`}
          onClick={onButtonClick}
        >
          {buttonText}
        </button>
      )}
    </article>
  );
};

export default JobCard;