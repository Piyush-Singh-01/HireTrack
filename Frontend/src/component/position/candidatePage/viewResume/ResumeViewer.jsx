import React from "react";
import { SectionCard, IconCircle, FileIcon, WarningIcon } from "./shared";

/**
 * ResumeViewer
 * Renders the resume PDF preview iframe, or appropriate empty/error states.
 */
const ResumeViewer = ({ resumeUrl, isLoading, connectionError }) => (
  <SectionCard
    title="Resume Viewer"
    subtitle="Preview the candidate's uploaded resume."
    icon={<FileIcon />}
    accent="from-sky-500 to-cyan-500"
  >
    {isLoading && (
      <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
        Loading resume...
      </div>
    )}
    {connectionError && (
      <p className="mb-4 text-sm text-rose-600">Unable to connect to server</p>
    )}

    {resumeUrl && !connectionError ? (
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
        <iframe
          src={`${resumeUrl}#toolbar=0&navpanes=0`}
          title="Resume"
          className="h-[70vh] w-full border-0 sm:h-[75vh] md:h-[80vh] lg:h-[85vh]"
        />
      </div>
    ) : (
      !isLoading &&
      !connectionError && (
        <div className="flex items-center gap-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
          <IconCircle tone="bg-gradient-to-br from-amber-400 to-orange-500">
            <WarningIcon />
          </IconCircle>
          <div>
            <h3 className="text-base font-bold text-amber-800">No Resume Found</h3>
            <p className="mt-0.5 text-sm text-amber-700">
              A resume file was not attached or the link is no longer valid.
            </p>
          </div>
        </div>
      )
    )}
  </SectionCard>
);

export default ResumeViewer;
