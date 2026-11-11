import React from "react";
import { HiOutlineCheckCircle } from "react-icons/hi";

/**
 * ViewTask Component
 * Focused presentational component rendering the applicant task submission details,
 * assigned and submitted dates, and shortlist / cancel buttons.
 */
const ViewTask = ({
  candidateName = "--",
  taskTitle = "Aptitude Round-1",
  position = "--",
  assignedDate = "--",
  submittedDate = "--",
  onShortlist,
  onCancel,
}) => {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-10 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">View Task</h1>
          <div className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
            Detailed submission info for candidate
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-wrap">
          <button
            type="button"
            className="flex items-center gap-1 sm:gap-2 px-3 py-2 hover:bg-blue font-semibold hover:text-white rounded-md border border-blue text-xs sm:text-sm bg-white cursor-pointer"
            onClick={onShortlist}
          >
            <span>Shortlist</span>
            <HiOutlineCheckCircle className="text-lg" />
          </button>
          <button
            type="button"
            className="flex items-center gap-1 sm:gap-2 px-3 py-2 hover:bg-red-600 font-semibold hover:text-white rounded-md border border-red-700 text-xs sm:text-sm text-red-700 cursor-pointer"
            onClick={onCancel}
          >
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* Task Details Content */}
      <div className="text-gray-600 text-sm sm:text-base space-y-4">
        <span className="block font-medium">{taskTitle}</span>
        <h2 className="text-black text-lg sm:text-xl font-bold">{candidateName}</h2>
        <span className="block">{position}</span>

        {/* Assigned and Submitted Dates */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row justify-between max-w-lg w-full">
            <span>Date Assigned</span>
            <span>{assignedDate}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between max-w-lg w-full">
            <span>Date Submitted</span>
            <span>{submittedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTask;