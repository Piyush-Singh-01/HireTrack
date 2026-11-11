import React from "react";
import { RxCrossCircled } from "react-icons/rx";
import { FiUsers, FiCopy, FiClipboard } from "react-icons/fi";
import { FaRegDotCircle } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { FileUser } from "lucide-react";
import JoiningInstructionsModal from "./JoiningInstructionsModal";

/**
 * ViewDetials Component
 * Presentational component rendering the position details, candidate page header,
 * status banner (Open / Closed), job specifications, screening questions, and onboarding modal.
 */
const ViewDetials = ({
  jobId,
  status = "Open",
  jobDescription,
  isLoading = false,
  error = null,
  existingTemplate,
  isHiringManagerForThisJob = true,
  copied = false,
  onCopyLink,
  getFullApplicationLink,
  formatMonthYear,
  onBack,
  onViewApplicants,
  onActivate,
  onSendOfferLetter,
  onOfferLetterTemplate,
  isInstructionsModalOpen = false,
  onOpenInstructionsModal,
  onCloseInstructionsModal,
  onInstructionsSuccess,
}) => {
  const isClosed = status === "Closed";

  /* Helper to format bullet list items */
  const renderBulletList = (text) => {
    if (!text) return null;
    return (
      <ul className="list-disc pl-5 space-y-1 text-gray-600">
        {text
          .split("\n")
          .filter((t) => t.trim())
          .map((line, idx) => (
            <li key={idx}>
              {line.trim().startsWith("-") ||
              line.trim().startsWith("•") ||
              line.trim().startsWith("*")
                ? line.trim().substring(1).trim()
                : line.trim()}
            </li>
          ))}
      </ul>
    );
  };

  return (
    <div className="max-w-6xl px-4 md:px-8 py-8 space-y-6">
      {/* ================= Top Bar Header ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer border border-gray-200"
            title="Back to Positions"
          >
            <IoArrowBack className="text-xl" />
          </button>

          <div className="flex items-center gap-2.5 text-indigo-600">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <FileUser className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Candidate’s Page
              </h1>
              <p className="text-xs text-gray-500">
                {isClosed ? "Closed Position Overview" : "Position Details & Configuration"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Applicants */}
          <button
            type="button"
            className="flex items-center justify-center cursor-pointer gap-2 px-4 py-2 bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-semibold rounded-xl border border-gray-300 text-sm transition-all shadow-sm"
            onClick={onViewApplicants}
          >
            <span>View Applicants</span>
            <FiUsers className="text-base text-indigo-600" />
          </button>

          {/* Open Position Actions */}
          {!isClosed && isHiringManagerForThisJob && (
            <>
              {existingTemplate ? (
                <button
                  type="button"
                  className="flex items-center justify-center cursor-pointer gap-2 px-4 py-2 bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-semibold rounded-xl border border-gray-300 text-sm transition-all shadow-sm group"
                  onClick={onSendOfferLetter}
                >
                  <span>Send Offer Letter</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="group-hover:fill-indigo-600 fill-gray-600"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.12199 1.04102H10.8787C11.8228 1.04102 12.5937 1.04102 13.2037 1.12268C13.8395 1.20852 14.3912 1.39352 14.832 1.83435C15.2728 2.27518 15.4578 2.82602 15.5437 3.46352C15.5853 3.77685 15.6062 4.13268 15.6162 4.53268C16.4978 4.67435 17.2203 4.95518 17.7995 5.53352C18.4228 6.15768 18.6995 6.94851 18.8312 7.92518C18.9587 8.87518 18.9587 10.0877 18.9587 11.6193V11.7135C18.9587 13.2443 18.9587 14.4577 18.8312 15.4068C18.6995 16.3843 18.4228 17.1752 17.7995 17.7985C17.1753 18.4218 16.3845 18.6985 15.4078 18.8302C14.4578 18.9577 13.2453 18.9577 11.7137 18.9577H8.28699C6.75533 18.9577 5.54199 18.9577 4.59283 18.8302C3.61616 18.6985 2.82533 18.4218 2.20116 17.7985C1.57783 17.1752 1.30116 16.3843 1.16949 15.4068C1.04199 14.4577 1.04199 13.2443 1.04199 11.7135V11.6193C1.04199 10.0877 1.04199 8.87435 1.16949 7.92518C1.30116 6.94851 1.57783 6.15768 2.20116 5.53352C2.78033 4.95518 3.50283 4.67518 4.38449 4.53352C4.39449 4.13268 4.41533 3.77685 4.45699 3.46352C4.54283 2.82685 4.72783 2.27518 5.16866 1.83435C5.60949 1.39352 6.16033 1.20852 6.79782 1.12268C7.40616 1.04102 8.17699 1.04102 9.12199 1.04102ZM4.37533 5.80435C3.76616 5.92685 3.38033 6.12268 3.08533 6.41768C2.73283 6.77018 2.52116 7.25352 2.40866 8.09185C2.29366 8.94852 2.29199 10.0768 2.29199 11.6668C2.29199 13.2552 2.29366 14.3835 2.40866 15.2402C2.52116 16.0785 2.73283 16.5618 3.08533 16.9152C3.43783 17.2668 3.92116 17.4785 4.75949 17.591C5.61616 17.7068 6.74449 17.7077 8.33366 17.7077H11.667C13.2562 17.7077 14.3853 17.7068 15.242 17.591C16.0795 17.4785 16.5628 17.2668 16.9153 16.9143C17.2678 16.5618 17.4795 16.0785 17.592 15.2402C17.707 14.3843 17.7087 13.2552 17.7087 11.666C17.7087 10.0768 17.707 8.94852 17.592 8.09185C17.4795 7.25352 17.2678 6.77018 16.9153 6.41768C16.6203 6.12268 16.2345 5.92602 15.6253 5.80435V6.88518C15.6253 7.54018 15.627 8.05935 15.4087 8.52435C15.192 8.98851 14.792 9.32018 14.2887 9.73935L14.2012 9.81268L13.5703 10.3377C12.8312 10.9543 12.2328 11.4527 11.7037 11.7927C11.1537 12.1468 10.6178 12.3702 10.0003 12.3702C9.38282 12.3702 8.84699 12.146 8.29616 11.7927C7.76783 11.4527 7.16949 10.9535 6.43033 10.3385L5.79949 9.81268C5.77005 9.78713 5.74088 9.76268 5.71199 9.73935C5.20866 9.32018 4.80949 8.98935 4.59199 8.52435C4.37449 8.05935 4.37533 7.54102 4.37533 6.88518V5.80435ZM6.96449 2.36185C6.46616 2.42852 6.22283 2.54852 6.05283 2.71852C5.88283 2.88852 5.76283 3.13185 5.69616 3.63018C5.62699 4.14602 5.62533 4.83268 5.62533 5.83268V6.77185C5.62533 7.59685 5.63949 7.81352 5.72366 7.99352C5.80783 8.17435 5.96533 8.32352 6.59949 8.85185L7.19949 9.35185C7.97699 9.99935 8.51616 10.4477 8.97283 10.741C9.41366 11.0243 9.71283 11.1202 10.0003 11.1202C10.2878 11.1202 10.587 11.0252 11.0278 10.741C11.4837 10.4477 12.0237 9.99935 12.8012 9.35185L13.4012 8.85185C14.0353 8.32352 14.1928 8.17435 14.277 7.99352C14.3612 7.81352 14.3753 7.59768 14.3753 6.77185V5.83268C14.3753 4.83268 14.3737 4.14602 14.3045 3.63018C14.2378 3.13185 14.1178 2.88852 13.9478 2.71852C13.7778 2.54852 13.5345 2.42852 13.0362 2.36185C12.5203 2.29268 11.8337 2.29102 10.8337 2.29102H9.16699C8.16699 2.29102 7.48033 2.29268 6.96449 2.36185ZM7.70866 4.99935C7.70866 4.83359 7.77451 4.67462 7.89172 4.55741C8.00893 4.4402 8.1679 4.37435 8.33366 4.37435H11.667C11.8328 4.37435 11.9917 4.4402 12.1089 4.55741C12.2261 4.67462 12.292 4.83359 12.292 4.99935C12.292 5.16511 12.2261 5.32408 12.1089 5.44129C11.9917 5.5585 11.8328 5.62435 11.667 5.62435H8.33366C8.1679 5.62435 8.00893 5.5585 7.89172 5.44129C7.77451 5.32408 7.70866 5.16511 7.70866 4.99935ZM8.54199 7.49935C8.54199 7.33359 8.60784 7.17462 8.72505 7.05741C8.84226 6.9402 9.00123 6.87435 9.16699 6.87435H10.8337C10.9994 6.87435 11.1584 6.9402 11.2756 7.05741C11.3928 7.17462 11.4587 7.33359 11.4587 7.49935C11.4587 7.66511 11.3928 7.82408 11.2756 7.94129C11.1584 8.0585 10.9994 8.12435 10.8337 8.12435H9.16699C9.00123 8.12435 8.84226 8.0585 8.72505 7.94129C8.60784 7.82408 8.54199 7.66511 8.54199 7.49935Z"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  className="flex items-center justify-center cursor-pointer gap-2 px-4 py-2 bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-semibold rounded-xl border border-gray-300 text-sm transition-all shadow-sm group"
                  onClick={onOfferLetterTemplate}
                >
                  <span>Offer Letter Template</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="group-hover:fill-indigo-600 fill-gray-600"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.12199 1.04102H10.8787C11.8228 1.04102 12.5937 1.04102 13.2037 1.12268C13.8395 1.20852 14.3912 1.39352 14.832 1.83435C15.2728 2.27518 15.4578 2.82602 15.5437 3.46352C15.5853 3.77685 15.6062 4.13268 15.6162 4.53268C16.4978 4.67435 17.2203 4.95518 17.7995 5.53352C18.4228 6.15768 18.6995 6.94851 18.8312 7.92518C18.9587 8.87518 18.9587 10.0877 18.9587 11.6193V11.7135C18.9587 13.2443 18.9587 14.4577 18.8312 15.4068C18.6995 16.3843 18.4228 17.1752 17.7995 17.7985C17.1753 18.4218 16.3845 18.6985 15.4078 18.8302C14.4578 18.9577 13.2453 18.9577 11.7137 18.9577H8.28699C6.75533 18.9577 5.54199 18.9577 4.59283 18.8302C3.61616 18.6985 2.82533 18.4218 2.20116 17.7985C1.57783 17.1752 1.30116 16.3843 1.16949 15.4068C1.04199 14.4577 1.04199 13.2443 1.04199 11.7135V11.6193C1.04199 10.0877 1.04199 8.87435 1.16949 7.92518C1.30116 6.94851 1.57783 6.15768 2.20116 5.53352C2.78033 4.95518 3.50283 4.67518 4.38449 4.53352C4.39449 4.13268 4.41533 3.77685 4.45699 3.46352C4.54283 2.82685 4.72783 2.27518 5.16866 1.83435C5.60949 1.39352 6.16033 1.20852 6.79782 1.12268C7.40616 1.04102 8.17699 1.04102 9.12199 1.04102ZM4.37533 5.80435C3.76616 5.92685 3.38033 6.12268 3.08533 6.41768C2.73283 6.77018 2.52116 7.25352 2.40866 8.09185C2.29366 8.94852 2.29199 10.0768 2.29199 11.6668C2.29199 13.2552 2.29366 14.3835 2.40866 15.2402C2.52116 16.0785 2.73283 16.5618 3.08533 16.9152C3.43783 17.2668 3.92116 17.4785 4.75949 17.591C5.61616 17.7068 6.74449 17.7077 8.33366 17.7077H11.667C13.2562 17.7077 14.3853 17.7068 15.242 17.591C16.0795 17.4785 16.5628 17.2668 16.9153 16.9143C17.2678 16.5618 17.4795 16.0785 17.592 15.2402C17.707 14.3843 17.7087 13.2552 17.7087 11.666C17.7087 10.0768 17.707 8.94852 17.592 8.09185C17.4795 7.25352 17.2678 6.77018 16.9153 6.41768C16.6203 6.12268 16.2345 5.92602 15.6253 5.80435V6.88518C15.6253 7.54018 15.627 8.05935 15.4087 8.52435C15.192 8.98851 14.792 9.32018 14.2887 9.73935L14.2012 9.81268L13.5703 10.3377C12.8312 10.9543 12.2328 11.4527 11.7037 11.7927C11.1537 12.1468 10.6178 12.3702 10.0003 12.3702C9.38282 12.3702 8.84699 12.146 8.29616 11.7927C7.76783 11.4527 7.16949 10.9535 6.43033 10.3385L5.79949 9.81268C5.77005 9.78713 5.74088 9.76268 5.71199 9.73935C5.20866 9.32018 4.80949 8.98935 4.59199 8.52435C4.37449 8.05935 4.37533 7.54102 4.37533 6.88518V5.80435ZM6.96449 2.36185C6.46616 2.42852 6.22283 2.54852 6.05283 2.71852C5.88283 2.88852 5.76283 3.13185 5.69616 3.63018C5.62699 4.14602 5.62533 4.83268 5.62533 5.83268V6.77185C5.62533 7.59685 5.63949 7.81352 5.72366 7.99352C5.80783 8.17435 5.96533 8.32352 6.59949 8.85185L7.19949 9.35185C7.97699 9.99935 8.51616 10.4477 8.97283 10.741C9.41366 11.0243 9.71283 11.1202 10.0003 11.1202C10.2878 11.1202 10.587 11.0252 11.0278 10.741C11.4837 10.4477 12.0237 9.99935 12.8012 9.35185L13.4012 8.85185C14.0353 8.32352 14.1928 8.17435 14.277 7.99352C14.3612 7.81352 14.3753 7.59768 14.3753 6.77185V5.83268C14.3753 4.83268 14.3737 4.14602 14.3045 3.63018C14.2378 3.13185 14.1178 2.88852 13.9478 2.71852C13.7778 2.54852 13.5345 2.42852 13.0362 2.36185C12.5203 2.29268 11.8337 2.29102 10.8337 2.29102H9.16699C8.16699 2.29102 7.48033 2.29268 6.96449 2.36185ZM7.70866 4.99935C7.70866 4.83359 7.77451 4.67462 7.89172 4.55741C8.00893 4.4402 8.1679 4.37435 8.33366 4.37435H11.667C11.8328 4.37435 11.9917 4.4402 12.1089 4.55741C12.2261 4.67462 12.292 4.83359 12.292 4.99935C12.292 5.16511 12.2261 5.32408 12.1089 5.44129C11.9917 5.5585 11.8328 5.62435 11.667 5.62435H8.33366C8.1679 5.62435 8.00893 5.5585 7.89172 5.44129C7.77451 5.32408 7.70866 5.16511 7.70866 4.99935ZM8.54199 7.49935C8.54199 7.33359 8.60784 7.17462 8.72505 7.05741C8.84226 6.9402 9.00123 6.87435 9.16699 6.87435H10.8337C10.9994 6.87435 11.1584 6.9402 11.2756 7.05741C11.3928 7.17462 11.4587 7.33359 11.4587 7.49935C11.4587 7.66511 11.3928 7.82408 11.2756 7.94129C11.1584 8.0585 10.9994 8.12435 10.8337 8.12435H9.16699C9.00123 8.12435 8.84226 8.0585 8.72505 7.94129C8.60784 7.82408 8.54199 7.66511 8.54199 7.49935Z"
                    />
                  </svg>
                </button>
              )}

              <button
                type="button"
                className="flex items-center justify-center cursor-pointer gap-2 px-4 py-2 bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-semibold rounded-xl border border-gray-300 text-sm transition-all shadow-sm"
                onClick={onOpenInstructionsModal}
              >
                <span>Onboarding Details</span>
                <FiClipboard className="text-base text-indigo-600" />
              </button>
            </>
          )}

          {/* Closed Position Actions */}
          {isClosed && (
            <button
              type="button"
              className="flex justify-center items-center gap-2 px-4 py-2 bg-white hover:bg-red-50 font-semibold rounded-xl border border-red-300 text-sm text-red-600 transition-all shadow-sm cursor-pointer"
              onClick={onBack}
            >
              <RxCrossCircled className="text-lg font-semibold" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= Position Title & Status Banner ================= */}
      <div
        className={
          isClosed
            ? "flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-700"
            : "bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-6 md:p-8 rounded-2xl shadow-sm border border-indigo-700/50"
        }
      >
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-1 tracking-tight">
            {jobDescription?.jobTitle || "Loading..."}
          </h2>
          <div className={`text-sm font-medium ${isClosed ? "text-gray-300" : "text-indigo-200"}`}>
            <span className="inline-block bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm mr-2 text-white">
              {status}
            </span>
            {isClosed ? (
              <>
                Closed on{" "}
                {jobDescription?.closingDate
                  ? formatMonthYear(jobDescription.closingDate)
                  : "Loading..."}{" "}
                | Opened on{" "}
                {jobDescription?.postedOn
                  ? formatMonthYear(jobDescription.postedOn)
                  : "Loading..."}
              </>
            ) : (
              <>
                Opened on{" "}
                {jobDescription?.postedOn
                  ? formatMonthYear(jobDescription.postedOn)
                  : "Loading..."}
              </>
            )}
          </div>
        </div>

        {/* Closed state: Activate Position button */}
        {isClosed && isHiringManagerForThisJob && (
          <div>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 cursor-pointer font-semibold text-white rounded-xl shadow-md transition-all text-sm"
              onClick={onActivate}
            >
              <span>Activate Position</span>
              <FaRegDotCircle className="text-base" />
            </button>
          </div>
        )}
      </div>

      {/* ================= Main Content Sections ================= */}
      <div className="flex flex-col gap-6 max-h-[65vh] hide-scrollbar overflow-auto pr-1">
        {/* Job Description Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
            Job Description
          </h3>

          {isLoading ? (
            <div className="text-sm text-gray-500 py-4">Loading job description...</div>
          ) : error ? (
            <div className="text-sm text-red-600 py-4">
              Error loading job description: {error.message}
            </div>
          ) : (
            <div className="text-sm text-gray-700 space-y-4">
              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/60 p-4 rounded-xl border border-gray-200/60">
                <div className="flex justify-between sm:justify-start gap-4">
                  <span className="text-gray-500 w-32">Position:</span>
                  <span className="font-semibold text-gray-800">
                    {jobDescription?.jobTitle || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between sm:justify-start gap-4">
                  <span className="text-gray-500 w-32">Role:</span>
                  <span className="font-semibold text-gray-800">
                    {jobDescription?.jobRole || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between sm:justify-start gap-4">
                  <span className="text-gray-500 w-32">Department:</span>
                  <span className="font-semibold text-gray-800">
                    {jobDescription?.department || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between sm:justify-start gap-4">
                  <span className="text-gray-500 w-32">Location:</span>
                  <span className="font-semibold text-gray-800">
                    {jobDescription?.jobLocation || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between sm:justify-start gap-4">
                  <span className="text-gray-500 w-32">Type:</span>
                  <span className="font-semibold text-gray-800">
                    {jobDescription?.jobType || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between sm:justify-start gap-4">
                  <span className="text-gray-500 w-32">Hiring Manager:</span>
                  <span className="font-semibold text-gray-800">
                    {jobDescription?.hiringManager?.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between sm:justify-start gap-4">
                  <span className="text-gray-500 w-32">Openings:</span>
                  <span className="font-semibold text-gray-800">
                    {jobDescription?.numberOfOpenings || "N/A"}
                  </span>
                </div>
              </div>

              {/* Application Link (shown when open) */}
              {!isClosed && (
                <div className="flex flex-wrap items-center gap-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <span className="font-semibold text-indigo-900">Application Link:</span>
                  {jobDescription?.applicationLink ? (
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                      <a
                        href={getFullApplicationLink?.(jobDescription.applicationLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline font-medium break-all text-xs md:text-sm"
                      >
                        {getFullApplicationLink?.(jobDescription.applicationLink)}
                      </a>
                      <button
                        type="button"
                        onClick={onCopyLink}
                        className="p-1.5 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 shadow-sm text-xs cursor-pointer"
                        title="Copy Link"
                      >
                        <FiCopy />
                        {copied && (
                          <span className="text-xs text-green-600 font-bold ml-1">Copied!</span>
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </div>
              )}

              {/* About the Role */}
              {jobDescription?.about && (
                <div className="space-y-1.5 pt-2">
                  <p className="font-bold text-gray-900">About the Role:</p>
                  <p className="whitespace-pre-wrap text-gray-600 leading-relaxed">
                    {jobDescription.about}
                  </p>
                </div>
              )}

              {/* Responsibilities */}
              {jobDescription?.responsibilities && (
                <div className="space-y-1.5 pt-2">
                  <p className="font-bold text-gray-900">Key Responsibilities:</p>
                  {renderBulletList(jobDescription.responsibilities)}
                </div>
              )}

              {/* Requirements */}
              {jobDescription?.requirements && (
                <div className="space-y-1.5 pt-2">
                  <p className="font-bold text-gray-900">Requirements / Skills Needed:</p>
                  {renderBulletList(jobDescription.requirements)}
                </div>
              )}

              {/* Preferred Qualifications */}
              {jobDescription?.preferredQualifications && (
                <div className="space-y-1.5 pt-2">
                  <p className="font-bold text-gray-900">Preferred Qualifications:</p>
                  {renderBulletList(jobDescription.preferredQualifications)}
                </div>
              )}

              {/* What We're Looking For */}
              {jobDescription?.lookingFor && (
                <div className="space-y-1.5 pt-2">
                  <p className="font-bold text-gray-900">What We're Looking For:</p>
                  {renderBulletList(jobDescription.lookingFor)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Screening Questions Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
            Screening Questions
          </h3>

          {isLoading ? (
            <div className="text-sm text-gray-500 py-4">Loading screening questions...</div>
          ) : error ? (
            <div className="text-sm text-red-600 py-4">Error loading screening questions</div>
          ) : (
            <div className="space-y-4">
              {jobDescription?.screeningQuestions &&
              jobDescription.screeningQuestions.length > 0 ? (
                jobDescription.screeningQuestions.map((question, index) => (
                  <div
                    key={index}
                    className="bg-gray-50/60 p-4 rounded-xl border border-gray-200/60 space-y-2"
                  >
                    <p className="font-semibold text-gray-800 text-sm md:text-base">
                      {index + 1}. {question.label}
                    </p>

                    {question.options?.length > 0 && (
                      <ul className="list-disc list-inside ml-4 text-xs md:text-sm text-gray-600 space-y-1">
                        {question.options.map((option, i) => (
                          <li key={i}>{option}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic py-2">
                  No screening questions configured for this position.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Joining Instructions Modal */}
      <JoiningInstructionsModal
        isOpen={isInstructionsModalOpen}
        onClose={onCloseInstructionsModal}
        jobId={jobId}
        onSuccess={onInstructionsSuccess}
      />
    </div>
  );
};

export default ViewDetials;