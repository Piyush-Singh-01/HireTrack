import React from "react";
import { FaRegCheckCircle, FaChevronDown } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import rescheduleicon from "../../assets/schedule/whitere.png";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../utils/AxiosInstance";
import ApiRoutes from "../../utils/ApiRoutes";

const ViewDetailsPopup = ({ interview, onClose, onReschedule, onReject }) => {
  const navigate = useNavigate();

  if (!interview) return null;
  const applicationId = interview.applicationId;

  const { data, isLoading } = useQuery({
    queryKey: ["view-resume", applicationId],
    enabled: !!applicationId,
    queryFn: async () => {
      const res = await axiosInstance.get(
        ApiRoutes.SCHEDULE.GET_FEEDBACK(applicationId),
      );
      return res.data.data;
    },
  });

  const resumeUrl =
    data?.answers?.attachments?.[0]?.url ||
    data?.answers?.attachments?.[0]?.fileUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 sm:px-6">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between bg-blue text-white px-4 sm:px-6 py-3 rounded-t-lg">
          <h1 className="font-semibold text-sm sm:text-base md:text-lg">
            Application Number : {interview.id || "1122456"}
          </h1>

          <button
            onClick={onClose}
            className="border border-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-white hover:text-black text-xs sm:text-sm cursor-pointer"
          >
            <IoClose />
          </button>
        </div>

        <div className="p-4 sm:p-6 text-xs sm:text-sm text-gray-900 space-y-4 sm:space-y-5">
          <p>
            <span className="font-medium">Candidate Name :</span>{" "}
            {interview.name}
          </p>
          <p>
            <span className="font-medium">Position Applied :</span>{" "}
            {interview.position}
          </p>
          <p>
            <span className="font-medium">Interview Date :</span>{" "}
            {new Date(interview.date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
          <p>
            <span className="font-medium">Interview Time :</span>{" "}
            {(() => {
              const time24 = interview.time;
              if (!time24) return "-";
              if (/(AM|PM)/i.test(time24)) return time24;
              const parts = time24.split(":");
              if (parts.length < 2) return time24;
              let h = parseInt(parts[0], 10);
              const m = parts[1];
              const ampm = h >= 12 ? "PM" : "AM";
              h = h % 12;
              h = h === 0 ? 12 : h;
              return `${String(h).padStart(2, "0")}:${m.slice(0, 2)} ${ampm}`;
            })()}
          </p>
          <p>
            <span className="font-medium">Interview Mode :</span>{" "}
            {interview.mode}
          </p>
        </div>

        <div className="p-4 sm:p-6 pt-0 flex flex-col md:flex-row gap-3 md:gap-2 lg:gap-25">
          <div className="flex flex-col sm:flex-row gap-3">
            {interview.scheduleType === "Group Interview" && interview.allApplications?.length > 1 ? (
              <div className="relative group flex items-center justify-center">
                <button
                  className="bg-blue text-white px-4 py-2 rounded-md text-xs w-full sm:w-auto cursor-pointer flex items-center gap-2"
                >
                  View Profiles
                  <FaChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute bottom-full left-0 mb-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover:block z-50 max-h-60 overflow-y-auto">
                  {interview.allApplications.map((app, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        navigate("/viewResume", {
                          state: {
                            jobId: interview.jobId,
                            candidateId: app.applicationId,
                            candidate: { ...interview, name: app.name, applicationId: app.applicationId, candidateId: app.candidateId, candidateEmail: app.email },
                            status: interview.status,
                            from: "/schedule",
                          },
                        })
                      }
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue transition-colors border-b border-gray-100 last:border-0"
                      title={app.name}
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue font-bold text-[10px]">
                        {(app.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={() =>
                  navigate("/viewResume", {
                    state: {
                      jobId: interview.jobId,
                      candidateId: interview.applicationId,
                      candidate: interview,
                      status: interview.status,
                      from: "/schedule",
                    },
                  })
                }
                disabled={isLoading}
                className="bg-blue text-white px-4 py-2 rounded-md text-xs w-full sm:w-auto cursor-pointer"
              >
                {isLoading
                  ? "Loading..."
                  : resumeUrl
                    ? "View Resume"
                    : "View Profile"}
              </button>
            )}

            <button
              onClick={() => onReschedule(interview)}
              className="bg-blue text-white px-4 py-2 rounded-md text-xs flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
            >
              <img src={rescheduleicon} alt="Reschedule" className="w-4 h-4" />
              <span>Reschedule</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            {interview.scheduleType === "Group Interview" && interview.allApplications?.length > 1 ? (
              <div className="relative group flex items-center justify-center">
                <button
                  className="flex items-center justify-center gap-2 border border-blue text-blue px-4 py-2 rounded-md text-xs font-semibold hover:bg-blue hover:text-white w-full sm:w-auto cursor-pointer"
                >
                  <span>Mark as Complete</span>
                  <FaChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute bottom-full right-0 mb-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover:block z-50 max-h-60 overflow-y-auto">
                  {interview.allApplications.map((app, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        navigate("/schedule_Feedback_Post", {
                          state: {
                            jobId: interview.jobId,
                            candidateId: app.candidateId,
                            candidate: { ...interview, name: app.name, applicationId: app.applicationId, candidateId: app.candidateId, candidateEmail: app.email },
                            showFeedback: true,
                          },
                        })
                      }
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue transition-colors border-b border-gray-100 last:border-0"
                      title={app.name}
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue font-bold text-[10px]">
                        {(app.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={() =>
                  navigate("/schedule_Feedback_Post", {
                    state: {
                      jobId: interview.jobId,
                      candidateId: interview.candidateId,
                      candidate: interview,
                      showFeedback: true,
                    },
                  })
                }
                className="flex items-center justify-center gap-2 border border-blue text-blue px-4 py-2 rounded-md text-xs font-semibold hover:bg-blue hover:text-white w-full sm:w-auto cursor-pointer"
              >
                <span>Mark as Complete</span>
                <FaRegCheckCircle className="text-sm" />
              </button>
            )}

            {interview.scheduleType === "Group Interview" && interview.allApplications?.length > 1 ? (
              <div className="relative group flex items-center justify-center">
                <button
                  className="flex items-center justify-center gap-2 border border-red text-red px-4 py-2 rounded-md text-xs font-semibold hover:bg-red hover:text-white w-full sm:w-auto cursor-pointer"
                >
                  <span>Reject Profile</span>
                  <FaChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute bottom-full right-0 mb-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover:block z-50 max-h-60 overflow-y-auto">
                  {interview.allApplications.map((app, idx) => (
                    <button
                      key={idx}
                      onClick={() => onReject({ ...interview, applicationId: app.applicationId, candidateId: app.candidateId, name: app.name, candidateEmail: app.email })}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors border-b border-gray-100 last:border-0"
                      title={app.name}
                    >
                      <div className="w-6 h-6 rounded-full bg-red-100 flex-shrink-0 flex items-center justify-center text-red font-bold text-[10px]">
                        {(app.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={() => onReject(interview)}
                className="flex items-center justify-center gap-2 border border-red text-red px-4 py-2 rounded-md text-xs font-semibold hover:bg-red hover:text-white w-full sm:w-auto cursor-pointer"
              >
                <span>Reject Profile</span>
                <RxCrossCircled className="text-sm" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailsPopup; 