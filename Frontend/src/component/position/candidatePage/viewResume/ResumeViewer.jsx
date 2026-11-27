import React from "react";
import { SectionCard, IconCircle, FileIcon, WarningIcon } from "./shared";

/**
 * ResumeViewer
 * Renders the resume PDF/image preview (via authenticated Blob URL, Cloudinary page images,
 * or direct URL), along with loading, error, and empty states.
 */
const ResumeViewer = ({
  resumeUrl,
  previewUrl,
  pageImages = [],
  mimeType = "application/pdf",
  fileName = "resume.pdf",
  isLoading,
  isResumeLoading = false,
  resumeError = null,
  onReload,
  connectionError,
}) => {
  const hasPageImages = Array.isArray(pageImages) && pageImages.length > 0;
  const effectiveUrl =
    previewUrl || (hasPageImages ? pageImages[0] : !isResumeLoading && !resumeError ? resumeUrl : null);
  const isImage = mimeType?.startsWith("image/");

  return (
    <SectionCard
      title="Resume Viewer"
      subtitle="Preview the candidate's uploaded resume."
      icon={<FileIcon />}
      accent="from-sky-500 to-cyan-500"
    >
      {(isLoading || isResumeLoading) && (
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
          Loading resume...
        </div>
      )}
      {connectionError && (
        <p className="mb-4 text-sm text-rose-600">Unable to connect to server</p>
      )}

      {resumeUrl && !connectionError ? (
        isResumeLoading && !effectiveUrl && !hasPageImages ? (
          <div className="flex h-[55vh] w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
            <span className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
            <p className="text-sm font-medium">Preparing resume preview...</p>
          </div>
        ) : resumeError && !effectiveUrl && !hasPageImages ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-rose-200 bg-slate-900 px-6 py-16 text-center text-white shadow-inner">
            <div className="max-w-md rounded-xl border border-slate-700 bg-slate-800/90 p-6 shadow-lg">
              <h3 className="text-base font-semibold text-white">Failed to load PDF document</h3>
              <p className="mt-1.5 text-xs text-slate-300">{resumeError}</p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                {onReload && (
                  <button
                    type="button"
                    onClick={onReload}
                    className="cursor-pointer rounded-full bg-sky-300 px-5 py-2 text-xs font-semibold text-slate-900 transition hover:bg-sky-200"
                  >
                    Reload
                  </button>
                )}
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-slate-600 px-4 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
                >
                  Open Original Link
                </a>
              </div>
            </div>
          </div>
        ) : hasPageImages && !previewUrl ? (
          <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate text-xs font-semibold text-slate-600">
                  {fileName}
                </span>
                <span className="shrink-0 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                  {pageImages.length} {pageImages.length === 1 ? "page" : "pages"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={pageImages[0]}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Open in New Tab
                </a>
              </div>
            </div>

            <div className="max-h-[82vh] space-y-6 overflow-y-auto bg-slate-200/70 p-4 sm:p-6">
              {pageImages.map((pageSrc, idx) => (
                <div key={pageSrc} className="mx-auto max-w-4xl">
                  <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-md">
                    <img
                      src={pageSrc}
                      alt={`${fileName} - Page ${idx + 1}`}
                      loading="lazy"
                      className="block w-full h-auto"
                    />
                  </div>
                  {pageImages.length > 1 && (
                    <p className="mt-2 text-center text-xs font-medium text-slate-500">
                      Page {idx + 1} of {pageImages.length}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : effectiveUrl ? (
          <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2.5">
              <span className="truncate text-xs font-semibold text-slate-600">
                {fileName}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={effectiveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Open in New Tab
                </a>
                <a
                  href={effectiveUrl}
                  download={fileName}
                  className="rounded-lg bg-sky-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-sky-700"
                >
                  Download
                </a>
              </div>
            </div>

            {isImage ? (
              <div className="flex justify-center bg-slate-900/5 p-4">
                <img
                  src={effectiveUrl}
                  alt={fileName}
                  className="max-h-[80vh] w-auto rounded-lg object-contain shadow-sm"
                />
              </div>
            ) : (
              <iframe
                src={`${effectiveUrl}#toolbar=0&navpanes=0`}
                title="Resume"
                className="h-[70vh] w-full border-0 sm:h-[75vh] md:h-[80vh] lg:h-[85vh]"
              />
            )}
          </div>
        ) : null
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
};

export default ResumeViewer;
