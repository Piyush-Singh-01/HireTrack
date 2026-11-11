import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useJobDetails } from "../../hooks/useJobDetails";
import { useToast } from "../../utils/ToastContext";
import JobDetailsPrev from "../../assets/Job_Post/JobDetailsPreiew.png";
import { IoArrowBack } from "react-icons/io5";
import { RxCrossCircled } from "react-icons/rx";
import { FaRegCheckCircle } from "react-icons/fa";

/**
 * JobDetailsPage
 * Main page for viewing full job details, specifications, poster visuals,
 * copying public application link, and publishing the job post.
 */
const JobDetailsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const { data: job, isLoading, isError, error, updateJob, isUpdating } =
    useJobDetails(jobId);

  const [showConfirm, setShowConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const stateDetails = location.state?.jobDetails || null;
  const cached = localStorage.getItem("jobApplicationDraft");
  const cachedDetails = cached ? JSON.parse(cached) : null;
  const displayJob = stateDetails || cachedDetails || job || {};

  useEffect(() => {
    const title = displayJob?.jobTitle
      ? `${displayJob.jobTitle} - Details | Talent OS`
      : "Job Details & Preview | Talent OS";
    document.title = title;
  }, [displayJob?.jobTitle]);

  const username =
    localStorage.getItem("username") ||
    localStorage.getItem("Name") ||
    "";
  const userId = localStorage.getItem("userId");

  const handleBack = () => {
    navigate(-1);
  };

  const handleConfirm = async () => {
    if (!job && !displayJob) return;

    const source = stateDetails || cachedDetails || {};
    const pickPosterVisuals = (...lists) =>
      lists.find((list) => Array.isArray(list) && list.length > 0) || [];
    const mergedPosterVisuals = pickPosterVisuals(
      source.posterVisuals,
      source.additionalInfo?.posterVisuals,
      cachedDetails?.posterVisuals,
      cachedDetails?.additionalInfo?.posterVisuals,
      job?.posterVisuals
    );

    const mergedJob = {
      ...job,
      jobTitle: source.jobTitle || job?.jobTitle || displayJob.jobTitle,
      jobRole: source.jobRole || job?.jobRole || displayJob.jobRole,
      department: source.department || job?.department || displayJob.department,
      jobLocation:
        source.jobLocation || job?.jobLocation || displayJob.jobLocation,
      jobType: source.jobType || job?.jobType || displayJob.jobType,
      experience: source.experience || job?.experience || displayJob.experience,
      hiringManager: {
        name: username,
        userId: userId,
      },
      numberOfOpenings:
        source.numberOfOpenings ??
        job?.numberOfOpenings ??
        displayJob.numberOfOpenings,
      jobStatus:
        source.jobStatus || job?.jobStatus || displayJob.jobStatus || "Open",
      closingDate:
        source.closingDate || job?.closingDate || displayJob.closingDate,
      applicantsCount:
        source.applicantsCount ??
        job?.applicantsCount ??
        displayJob.applicantsCount,
      about: source.about || job?.about || displayJob.about,
      responsibilities:
        source.responsibilities ||
        job?.responsibilities ||
        displayJob.responsibilities,
      requirements:
        source.requirements || job?.requirements || displayJob.requirements,
      preferredQualifications:
        source.preferredQualifications ||
        job?.preferredQualifications ||
        displayJob.preferredQualifications,
      lookingFor: source.lookingFor || job?.lookingFor || displayJob.lookingFor,
      applicationLink:
        source.applicationLink ||
        job?.applicationLink ||
        displayJob.applicationLink,
      posterVisuals: mergedPosterVisuals,
      formId: source.formId || job?.formId || displayJob.formId,
    };

    updateJob(mergedJob, {
      onSuccess: () => {
        setShowConfirm(false);
        navigate("/positions");
      },
      onError: (err) => {
        console.error(err);
        const apiMessage = err?.response?.data?.message;
        const missing = err?.response?.data?.missingFields;
        const details =
          Array.isArray(missing) && missing.length > 0
            ? ` Missing: ${missing.join(", ")}`
            : "";
        showToast(
          apiMessage
            ? `${apiMessage}${details}`
            : err?.message || "Failed to publish job",
          "error"
        );
        setShowConfirm(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm font-semibold text-slate-700">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <p className="text-base font-semibold text-rose-600">Failed to load job details</p>
          <p className="mt-1 text-sm text-slate-500">{error?.message}</p>
          <button
            type="button"
            onClick={handleBack}
            className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const fullApplicationLink =
    displayJob?.applicationLink && displayJob.applicationLink.startsWith("/")
      ? `${window.location.origin}${displayJob.applicationLink}`
      : displayJob?.applicationLink || "";

  const pickPosterVisuals = (...lists) =>
    lists.find((list) => Array.isArray(list) && list.length > 0) || [];
  const posterList = pickPosterVisuals(
    displayJob?.posterVisuals,
    displayJob?.additionalInfo?.posterVisuals,
    cachedDetails?.posterVisuals,
    cachedDetails?.additionalInfo?.posterVisuals,
    job?.posterVisuals
  );
  const poster = posterList?.[0] || null;
  const posterUrl = poster?.fileUrl || "";
  const posterType = poster?.fileType || "";
  const isPdf =
    posterUrl.toLowerCase().endsWith(".pdf") ||
    posterType.toLowerCase().includes("pdf");
  const isCloudinary = /res\.cloudinary\.com/.test(posterUrl);
  const cloudinaryTransform = (url, transform) =>
    url.replace("/upload/", `/upload/${transform}/`);
  const pdfPreviewUrl =
    isPdf && isCloudinary
      ? cloudinaryTransform(posterUrl, "pg_1,f_jpg,w_900").replace(
          /\.pdf(\?.*)?$/i,
          ".jpg$1"
        )
      : "";
  const pdfOpenUrl =
    isPdf && posterUrl.includes("/image/upload/")
      ? posterUrl.replace("/image/upload/", "/raw/upload/")
      : posterUrl;
  const pdfViewerUrl = isPdf
    ? `https://docs.google.com/gview?url=${encodeURIComponent(
        pdfOpenUrl
      )}&embedded=true`
    : "";

  const handleCopyLink = async () => {
    if (!fullApplicationLink) return;
    try {
      await navigator.clipboard.writeText(fullApplicationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const jobDetailsList = [
    { label: "Job Role/Position", value: displayJob.jobRole, colSpan: "col-span-1" },
    {
      label: "Department or team",
      value: displayJob.department,
      colSpan: "col-span-1 md:col-span-3",
    },
    { label: "Job Location", value: displayJob.jobLocation, colSpan: "col-span-1" },
    {
      label: "Job Type",
      value: displayJob.jobType,
      colSpan: "col-span-1 md:col-span-3",
    },
    {
      label: "Experience",
      value: displayJob.experience,
      colSpan: "col-span-1",
    },
    { label: "Job Code", value: displayJob.jobCode, colSpan: "col-span-1" },
    {
      label: "Hiring Manager",
      value: username,
      colSpan: "col-span-1 md:col-span-3",
    },
    {
      label: "Number of Openings",
      value: displayJob.numberOfOpenings,
      colSpan: "col-span-1",
    },
    { label: "", value: "", colSpan: "col-span-1 md:col-span-3" },
    { label: "Status", value: displayJob.jobStatus, colSpan: "col-span-1" },
    {
      label: "Closing Date",
      value: displayJob.closingDate
        ? new Date(displayJob.closingDate).toLocaleDateString()
        : "N/A",
      colSpan: "col-span-1 md:col-span-3",
    },
    {
      label: "Posted On",
      value: displayJob.postedOn
        ? new Date(displayJob.postedOn).toLocaleDateString()
        : "N/A",
      colSpan: "col-span-1",
    },
    { label: "", value: "", colSpan: "col-span-1 md:col-span-3" },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left Section (Details) */}
        <div className="w-full md:w-[70%] p-4 md:p-10 border-b md:border-b-0 md:border-r border-gray-300">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <IoArrowBack className="text-lg" />
            </button>
            <h1 className="text-xl md:text-3xl font-bold font-inter text-[#120D1C]">
              {displayJob.jobTitle || "Job Title"}
            </h1>
          </div>

          <h2 className="text-lg md:text-xl font-bold font-inter text-[#120D1C] mt-6 md:mt-8 mb-4">
            Job Details
          </h2>

          {/* Grid for Job Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-y-4 gap-x-6 text-sm text-gray-700">
            {jobDetailsList.map((item, index) => (
              <div key={index} className={item.colSpan}>
                {item.label && <div className="text-xs text-gray-400">{item.label}</div>}
                {item.value && (
                  <div className="text-sm font-medium text-[#120D1C]">{item.value}</div>
                )}
              </div>
            ))}
          </div>

          <hr className="my-6 md:my-8 text-[#E6E4EB]" />

          {/* Role Description Sections */}
          <div className="space-y-6">
            {displayJob.about && (
              <div>
                <h3 className="text-base md:text-lg font-bold font-inter text-[#120D1C] mb-2">
                  About the Role
                </h3>
                <p className="text-sm text-[#120D1C] whitespace-pre-line leading-relaxed">
                  {displayJob.about}
                </p>
              </div>
            )}

            {displayJob.responsibilities && (
              <div>
                <h3 className="text-base md:text-lg font-bold font-inter text-[#120D1C] mb-2">
                  Key Responsibilities
                </h3>
                <p className="text-sm text-[#120D1C] whitespace-pre-line leading-relaxed">
                  {displayJob.responsibilities}
                </p>
              </div>
            )}

            {displayJob.requirements && (
              <div>
                <h3 className="text-base md:text-lg font-bold font-inter text-[#120D1C] mb-2">
                  Requirements
                </h3>
                <p className="text-sm text-[#120D1C] whitespace-pre-line leading-relaxed">
                  {displayJob.requirements}
                </p>
              </div>
            )}

            {displayJob.preferredQualifications && (
              <div>
                <h3 className="text-base md:text-lg font-bold font-inter text-[#120D1C] mb-2">
                  Preferred Qualifications
                </h3>
                <p className="text-sm text-[#120D1C] whitespace-pre-line leading-relaxed">
                  {displayJob.preferredQualifications}
                </p>
              </div>
            )}

            {displayJob.lookingFor && (
              <div>
                <h3 className="text-base md:text-lg font-bold font-inter text-[#120D1C] mb-2">
                  What We're Looking For
                </h3>
                <p className="text-sm text-[#120D1C] whitespace-pre-line leading-relaxed">
                  {displayJob.lookingFor}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Section (Preview & Actions) */}
        <div className="w-full md:w-[30%] p-4 md:p-8 bg-[#FDFDFD]">
          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="text-[#68558A] cursor-pointer"
              onClick={handleBack}
              title="Cancel"
            >
              <RxCrossCircled className="w-[2vw] h-[2vw]" />
            </button>
            <button
              type="button"
              className="text-[#32174D] cursor-pointer"
              onClick={() => setShowConfirm(true)}
              title="Confirm Publish"
            >
              <FaRegCheckCircle className="w-[2vw] h-[2vw]" />
            </button>
          </div>

          {/* Poster Section */}
          <div className="mt-4 md:mt-10">
            {posterUrl ? (
              isPdf ? (
                <div className="space-y-2">
                  {pdfPreviewUrl ? (
                    <img
                      src={pdfPreviewUrl}
                      alt={poster?.fileName || "Job Poster PDF"}
                      className="w-full object-contain border rounded-md"
                    />
                  ) : (
                    <iframe
                      title={poster?.fileName || "Job Poster PDF"}
                      src={pdfViewerUrl}
                      className="w-full h-96 border rounded-md"
                    />
                  )}
                </div>
              ) : (
                <img
                  src={posterUrl}
                  alt={poster?.fileName || "Job Poster"}
                  className="w-full object-contain"
                />
              )
            ) : (
              <img
                src={JobDetailsPrev}
                alt="Job Poster"
                className="w-full object-contain"
              />
            )}
          </div>

          {fullApplicationLink && (
            <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
              <p className="text-xs font-semibold text-indigo-900">Application Link</p>
              <p className="mt-1 truncate text-xs text-indigo-700">{fullApplicationLink}</p>
              <button
                type="button"
                onClick={handleCopyLink}
                className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 border shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Publish</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to publish this job posting?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                onClick={() => setShowConfirm(false)}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                onClick={handleConfirm}
                disabled={isUpdating}
              >
                {isUpdating ? "Publishing..." : "Confirm Publish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobDetailsPage;
