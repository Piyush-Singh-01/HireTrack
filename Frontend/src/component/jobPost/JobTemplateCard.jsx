import React from "react";
import { CiFileOn } from "react-icons/ci";
import { VscCircleFilled } from "react-icons/vsc";
import FormattedDate from "../common/FormattedDate";

export const getJobStatus = (closingDate) => {
  if (!closingDate) return "Open";

  const closeDate = new Date(closingDate);
  if (Number.isNaN(closeDate.getTime())) return "Open";

  const today = new Date();
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const closeDateOnly = new Date(
    closeDate.getFullYear(),
    closeDate.getMonth(),
    closeDate.getDate()
  );

  return todayOnly > closeDateOnly ? "Closed" : "Open";
};

const JobTemplateCard = ({ job, onUseTemplate, isLoading }) => {
  const status = getJobStatus(job.closingDate);
  const isClosed = status === "Closed";

  const hiringManagerDisplay =
    job.hiringManagers && job.hiringManagers.length > 0
      ? job.hiringManagers.map((hm) => hm.name).join(", ")
      : job.hiringManager?.name || "-";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/70">
      <div
        className={`h-1.5 w-full ${
          isClosed
            ? "bg-gradient-to-r from-rose-400 to-orange-400"
            : "bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500"
        }`}
      />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 transition group-hover:bg-indigo-100">
              <CiFileOn className="text-2xl" />
            </div>
            <div className="min-w-0">
              <h3 className="break-words text-base font-bold leading-6 text-slate-900 transition group-hover:text-indigo-700 sm:text-lg">
                {job.jobTitle}
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-400">
                Job template
              </p>
            </div>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
              isClosed
                ? "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100"
                : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100"
            }`}
          >
            <VscCircleFilled
              className={`text-[10px] ${
                isClosed ? "text-rose-500" : "text-emerald-500"
              }`}
            />
            {status}
          </span>
        </div>

        <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Hiring manager
          </p>
          <p className="break-words text-sm font-semibold leading-5 text-slate-700">
            {hiringManagerDisplay}
          </p>
        </div>

        <dl className="mb-6 grid grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <dt className="text-xs font-medium text-slate-400">Openings</dt>
            <dd className="mt-1 text-sm font-bold text-slate-800">
              {job.numberOfOpenings ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-400">Applicants</dt>
            <dd className="mt-1 text-sm font-bold text-slate-800">
              {job.applicantsCount ?? 0}
              <span className="ml-1 font-medium text-slate-500">
                candidates
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-400">Created on</dt>
            <dd className="mt-1 text-sm font-medium text-slate-700">
              <FormattedDate date={job.createdAt} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-400">Closing date</dt>
            <dd className="mt-1 text-sm font-medium text-slate-700">
              <FormattedDate date={job.closingDate} />
            </dd>
          </div>
          <div className="col-span-2 border-t border-slate-100 pt-3">
            <dt className="text-xs font-medium text-slate-400">Posted on</dt>
            <dd className="mt-1 text-sm font-medium text-slate-700">
              <FormattedDate date={job.postedOn} />
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => onUseTemplate(job._id)}
          disabled={isLoading}
          className="mt-auto inline-flex min-h-11 w-full items-center justify-center cursor-pointer gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 transition hover:border-indigo-600 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-violet-600 hover:text-white focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Loading template..." : "Reuse Template"}
          {!isLoading && (
            <span aria-hidden="true" className="text-lg transition-transform group-hover:translate-x-1">
              →
            </span>
          )}
        </button>
      </div>
    </article>
  );
};

export default JobTemplateCard;
