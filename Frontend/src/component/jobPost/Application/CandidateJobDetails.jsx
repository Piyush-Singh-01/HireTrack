import React from "react";
import { FiCopy } from "react-icons/fi";
import { Briefcase, MapPin, Building2, User, Clock, Link2, CheckCircle2 } from "lucide-react";

const CandidateJobDetails = ({ job, onApply }) => {
  const [copied, setCopied] = React.useState(false);

  const getFullApplicationLink = (link) => {
    if (!link) return "";
    if (link.startsWith("http://") || link.startsWith("https://")) return link;
    const prefix = link.startsWith("/") ? "" : "/";
    return `${window.location.origin}${prefix}${link}`;
  };

  const handleCopyLink = () => {
    if (job?.applicationLink) {
      const fullLink = getFullApplicationLink(job.applicationLink);
      navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatMonthYear = (input) => {
    if (!input) return "N/A";
    const dateObj = new Date(input);
    if (Number.isNaN(dateObj.getTime())) return "N/A";
    return dateObj.toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    });
  };

  const renderBulletList = (content) => {
    if (!content || (Array.isArray(content) && content.length === 0)) {
      return <li className="text-gray-500">N/A</li>;
    }

    const lines = Array.isArray(content)
      ? content
      : content.split(/\n|(?<=\.)\s+/).filter((line) => line.trim() !== "");

    return lines.map((line, index) => {
      const cleanedLine = line.trim().replace(/^[•\-\*]\s*/, "");
      return <li key={index} className="text-gray-600 leading-relaxed">{cleanedLine}</li>;
    });
  };

  const DetailItem = ({ label, value, isLink = false }) => (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-sm">
      <span className="text-gray-500 font-medium sm:w-36 shrink-0">
        {label}:
      </span>

      <span className="text-gray-900 font-semibold break-words">
        {isLink ? (
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={getFullApplicationLink(value)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline break-all font-medium text-xs sm:text-sm"
            >
              {getFullApplicationLink(value)}
            </a>

            <button
              onClick={handleCopyLink}
              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Copy link"
            >
              <FiCopy size={14} />
            </button>

            {copied && (
              <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Copied!
              </span>
            )}
          </div>
        ) : (
          value || "N/A"
        )}
      </span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-6 md:p-8 rounded-2xl shadow-sm mb-8 border border-indigo-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block bg-white/10 px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider text-indigo-200 backdrop-blur-sm mb-3">
              Candidate View
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              {job?.jobTitle || "Job Title"}
            </h1>
            <p className="text-sm text-indigo-200 font-medium flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                Open Position
              </span>
              <span>•</span>
              <span>Opened on {formatMonthYear(job?.postedOn)}</span>
            </p>
          </div>

          <button
            onClick={onApply}
            className="self-start sm:self-center bg-white text-indigo-900 hover:bg-indigo-50 font-bold py-3 px-8 rounded-xl shadow-md transition-all active:scale-[0.98] text-sm md:text-base cursor-pointer shrink-0"
          >
            Apply Now
          </button>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-8 space-y-6">
        <div className="flex items-center gap-2.5 text-indigo-600 pb-4 border-b border-gray-100">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <Briefcase className="w-5 h-5" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            Job Overview & Description
          </h2>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/60 p-4 sm:p-5 rounded-xl border border-gray-200/60">
          <DetailItem label="Position" value={job?.jobTitle} />
          <DetailItem label="Type" value={job?.jobType} />
          <DetailItem label="Role" value={job?.jobRole} />
          <DetailItem label="Hiring Manager" value={job?.hiringManager?.name} />
          <DetailItem label="Department" value={job?.department} />
          <DetailItem label="Openings" value={job?.numberOfOpenings} />
          <DetailItem label="Location" value={job?.jobLocation} />
          <DetailItem label="Application Link" value={job?.applicationLink} isLink />
        </div>

        {/* About Section */}
        {job?.about && (
          <div className="pt-2">
            <h3 className="text-sm uppercase font-semibold tracking-wider text-gray-500 mb-2">
              About the Position
            </h3>
            <div className="text-gray-700 text-sm md:text-base leading-relaxed bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50">
              {(() => {
                const lines = job.about
                  .split(/\n|(?<=\.)\s+/)
                  .filter((line) => line.trim() !== "");
                if (lines.length === 0) return null;

                const firstLine = lines[0].trim().replace(/^[•\-\*]\s*/, "");
                const remainingLines = lines.slice(1);

                return (
                  <>
                    <p className="mb-2 font-medium">{firstLine}</p>
                    {remainingLines.length > 0 && (
                      <ul className="list-disc list-inside space-y-1.5 ml-2">
                        {renderBulletList(remainingLines)}
                      </ul>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Requirements */}
        {job?.requirements && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
            <h3 className="text-base md:text-lg font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              Requirements / Skills Needed
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {renderBulletList(job?.requirements)}
            </ul>
          </div>
        )}

        {/* Preferred */}
        {job?.preferredQualifications && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
            <h3 className="text-base md:text-lg font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              Preferred Qualifications
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {renderBulletList(job?.preferredQualifications)}
            </ul>
          </div>
        )}

        {/* Looking For */}
        {job?.lookingFor && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
            <h3 className="text-base md:text-lg font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              What We’re Looking For
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {renderBulletList(job?.lookingFor)}
            </ul>
          </div>
        )}

        {/* Responsibilities */}
        {job?.responsibilities && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
            <h3 className="text-base md:text-lg font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              What You’ll Do
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {renderBulletList(job?.responsibilities)}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="flex justify-center sm:justify-end pt-4 pb-8">
        <button
          onClick={onApply}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-10 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] text-sm md:text-base cursor-pointer"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default CandidateJobDetails;