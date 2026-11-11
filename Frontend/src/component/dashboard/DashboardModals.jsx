import React from "react";
import { FiVideo, FiMapPin, FiCalendar, FiUser, FiUsers, FiAlertTriangle } from "react-icons/fi";
import { FaCalendarAlt, FaClock, FaRegCheckCircle } from "react-icons/fa";
import { FaRegPenToSquare } from "react-icons/fa6";
import { LuBriefcaseBusiness } from "react-icons/lu";
import { RxCrossCircled } from "react-icons/rx";
import { HiOutlineCheckCircle } from "react-icons/hi";
import { Calendar, Bell } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import RescheduleImg from "../../assets/schedule/reschedule.png";
import Confirm from "../../assets/viewTask/confirmmail.png";
import {
  ModalShell,
  ModalHeader,
  InfoItem,
  GroupMenu,
  formatTimeToAMPM,
  getGroupNames,
  isGroupWithMany,
} from "./DashboardCommon";

const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

/**
 * Start Interview Confirmation Dialog
 */
export const StartInterviewModal = ({
  isOpen = false,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <ModalShell widthClass="max-w-sm">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-blue/10 text-blue flex items-center justify-center text-lg">
            <FiVideo />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">Start interview?</p>
            <p className="text-sm text-slate-500">Are you going to start this interview?</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            Yes, start
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

/**
 * Candidate / Applicant Details Dialog
 */
export const ApplicantDetailsModal = ({
  isOpen = false,
  applicant = null,
  onClose,
  onGoToResume,
  onGoToFeedback,
  onOpenReschedule,
  onOpenReject,
}) => {
  if (!isOpen) return null;

  return (
    <ModalShell widthClass="max-w-lg">
      <ModalHeader
        eyebrow={`Application #${applicant?.candidateId?.slice(-6) ?? "-"}`}
        title={
          applicant?.scheduleType === "Group Interview"
            ? getGroupNames(applicant) || "-"
            : applicant?.name || "-"
        }
        onClose={onClose}
      />

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoItem icon={<LuBriefcaseBusiness />} label="Position">
            {applicant?.position || "-"}
          </InfoItem>
          <InfoItem icon={<FiMapPin />} label="Mode">
            {applicant?.mode || "-"}
          </InfoItem>
          <InfoItem icon={<FiCalendar />} label="Date">
            {applicant?.date
              ? new Date(applicant.date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "-"}
          </InfoItem>
          <InfoItem icon={<FaClock />} label="Time">
            {formatTimeToAMPM(applicant?.time)}
          </InfoItem>
        </div>

        {/* Primary actions */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Candidate
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {isGroupWithMany(applicant) ? (
              <GroupMenu
                label="View Profiles"
                icon={<FiUsers />}
                variant="solid"
                applications={applicant.allApplications}
                onPick={(app) =>
                  onGoToResume(
                    {
                      ...applicant,
                      name: app.name,
                      applicationId: app.applicationId,
                      candidateId: app.candidateId,
                      candidateEmail: app.email,
                    },
                    app.applicationId
                  )
                }
              />
            ) : (
              <button
                type="button"
                onClick={() =>
                  onGoToResume(
                    applicant,
                    applicant?.id || applicant?.candidateId || applicant?._id
                  )
                }
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                <FiUser />
                View Resume
              </button>
            )}

            <button
              type="button"
              onClick={onOpenReschedule}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-blue border border-blue/40 bg-white hover:bg-blue hover:text-white hover:border-blue transition-colors cursor-pointer"
            >
              <FaRegPenToSquare />
              Reschedule
            </button>
          </div>
        </div>

        {/* Outcome actions */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Outcome
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {isGroupWithMany(applicant) ? (
              <GroupMenu
                label="Mark as Complete"
                icon={<FaRegCheckCircle />}
                applications={applicant.allApplications}
                onPick={(app) =>
                  onGoToFeedback(
                    {
                      ...applicant,
                      name: app.name,
                      applicationId: app.applicationId,
                      candidateId: app.candidateId,
                      candidateEmail: app.email,
                    },
                    app.candidateId || app.applicationId
                  )
                }
              />
            ) : (
              <button
                type="button"
                onClick={() =>
                  onGoToFeedback(
                    applicant,
                    applicant?.id || applicant?.candidateId
                  )
                }
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-blue border border-blue/40 bg-white hover:bg-blue hover:text-white hover:border-blue transition-colors cursor-pointer"
              >
                <FaRegCheckCircle />
                Mark as Complete
              </button>
            )}

            {isGroupWithMany(applicant) ? (
              <GroupMenu
                label="Reject Profile"
                icon={<RxCrossCircled />}
                variant="danger"
                applications={applicant.allApplications}
                onPick={(app) => {
                  onOpenReject({
                    ...applicant,
                    applicationId: app.applicationId,
                    candidateId: app.candidateId,
                    name: app.name,
                    candidateEmail: app.email,
                  });
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => onOpenReject(applicant)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-200 bg-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors cursor-pointer"
              >
                <RxCrossCircled />
                Reject Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

/**
 * Reschedule Interview Dialog
 */
export const RescheduleModal = ({
  isOpen = false,
  applicant = null,
  selectedDate,
  setSelectedDate,
  hour,
  setHour,
  minute,
  setMinute,
  period,
  setPeriod,
  rescheduleDuration,
  setRescheduleDuration,
  sendNotification,
  setSendNotification,
  onClose,
  onSave,
  isSaving = false,
}) => {
  if (!isOpen) return null;

  return (
    <ModalShell widthClass="max-w-2xl">
      <ModalHeader
        eyebrow="Reschedule"
        title="Update interview slot"
        onClose={onClose}
      />

      <div className="flex flex-col md:flex-row gap-6 p-6">
        <div className="flex-1 space-y-5">
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-1.5 text-sm">
            <p>
              <span className="text-slate-500">Candidate:</span>{" "}
              <span className="font-semibold text-slate-900">{applicant?.name}</span>
            </p>
            <p>
              <span className="text-slate-500">Position:</span>{" "}
              <span className="font-semibold text-slate-900">
                {applicant?.position || "Position Title"}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Date</label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue/30 focus-within:border-blue">
              <FaCalendarAlt className="text-blue shrink-0" size={15} />
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="dd-MM-yyyy"
                className="w-full text-sm font-medium text-slate-800 outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Time</label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <FaClock className="text-blue shrink-0" size={15} />
              <div className="flex items-center gap-2 w-full justify-center">
                <select
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  className="bg-transparent outline-none font-medium text-sm px-1 cursor-pointer"
                >
                  {hours.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="text-slate-400">:</span>
                <select
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  className="bg-transparent outline-none font-medium text-sm px-1 cursor-pointer"
                >
                  {minutes.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="bg-transparent outline-none font-medium text-sm px-1 cursor-pointer"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Duration</label>
            <div className="flex items-center gap-2">
              <div className="relative h-10 w-10 flex items-center justify-center text-blue shrink-0">
                <Calendar size={22} />
                <Bell className="absolute -bottom-0.5 -right-0.5 text-blue bg-white rounded-full" size={12} />
              </div>
              <input
                type="number"
                min={1}
                value={rescheduleDuration}
                onChange={(e) => setRescheduleDuration(e.target.value)}
                className="w-20 h-10 text-center rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue font-medium"
              />
              <select className="h-10 px-3 rounded-lg bg-white border border-slate-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue/30">
                <option>Minutes</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 cursor-pointer accent-[#324371]"
              checked={sendNotification}
              onChange={(e) => setSendNotification(e.target.checked)}
            />
            Send notification to candidate
          </label>
        </div>

        <div className="hidden md:flex w-[35%] items-center justify-center">
          <img src={RescheduleImg} alt="" className="w-full h-auto object-contain" />
        </div>
      </div>

      <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/70 rounded-b-2xl">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={onSave}
          className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </ModalShell>
  );
};

/**
 * Candidate Rejection Dialog
 */
export const RejectConfirmModal = ({
  isOpen = false,
  applicant = null,
  onClose,
  onConfirm,
  isRejecting = false,
}) => {
  if (!isOpen) return null;

  return (
    <ModalShell widthClass="max-w-md">
      <div className="flex">
        <div className="flex-1 p-7 text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-2xl">
            <FiAlertTriangle />
          </div>
          <p className="text-lg font-bold text-slate-900">Reject this candidate?</p>
          <p className="mt-1 text-sm text-slate-500">
            {applicant?.name
              ? `${applicant.name} will be marked as rejected.`
              : "This will update the candidate's status."}
          </p>

          <div className="mt-6 flex justify-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RxCrossCircled />
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isRejecting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white shadow-sm hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <HiOutlineCheckCircle />
              {isRejecting ? "Rejecting..." : "Confirm"}
            </button>
          </div>
        </div>
        <div className="hidden sm:flex w-[40%] items-center justify-center bg-slate-50 border-l border-slate-100 p-4">
          <img src={Confirm} alt="" className="max-h-48 w-full object-contain" />
        </div>
      </div>
    </ModalShell>
  );
};
