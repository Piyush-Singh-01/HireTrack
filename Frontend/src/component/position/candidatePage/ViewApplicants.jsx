import React from "react";
import { RxCrossCircled } from "react-icons/rx";
import { HiOutlineBriefcase, HiOutlineCheckCircle, HiOutlineEye } from "react-icons/hi";
import { LuSquarePen } from "react-icons/lu";
import { FaCalendarAlt, FaClock, FaChevronDown, FaArrowUp, FaArrowDown } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";
import { IoArrowBack, IoClose } from "react-icons/io5";
import scheduleImg from "../../../assets/schedule/schedule.png";
import scheduleGDImg from "../../../assets/schedule/GD.png";
import Confirm from "../../../assets/viewTask/confirmmail.png";
import Toast from "../../ui/Toast";
import Reschedule from "../../schedule/Reschedule";
import JoiningInstructionsModal from "./JoiningInstructionsModal";
import { getDisplayName } from "../../../utils/getDisplayName";

/* =========================================================
   Design tokens & CSS constants
   ========================================================= */

const CARD =
  "rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)]";

const BTN_OUTLINE =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-blue/40 bg-white px-3.5 py-2 text-sm font-semibold text-blue transition-colors hover:border-blue hover:bg-indigo-600 hover:text-white cursor-pointer";

const BTN_DANGER =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-sm font-semibold text-rose-600 transition-colors hover:border-rose-600 hover:bg-rose-600 hover:text-white cursor-pointer";

const INPUT =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30";

const TH =
  "px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap";

const TBODY =
  "divide-y divide-slate-100 bg-white [&_td]:px-5 [&_td]:py-3 [&_td]:text-sm [&_td]:text-slate-700 [&_tr]:transition-colors [&_tr:hover]:bg-indigo-50/40";

const AVATAR_TONES = [
  "from-indigo-500 to-blue-400",
  "from-violet-500 to-purple-400",
  "from-emerald-500 to-teal-400",
  "from-amber-400 to-orange-400",
  "from-rose-500 to-pink-400",
  "from-sky-500 to-cyan-400",
];

const PILL_TONES = {
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
};

const OPEN_SORT_KEYS = {
  "Applied On": "appliedOn",
  "Interview Date": "interviewDate",
  "Interview Time": "interviewTime",
  "Selected On": "selectedOn",
};

const CLOSED_SORT_KEYS = { "Applied On": "appliedOn" };

const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

/* =========================================================
   Presentational Helpers & Badges
   ========================================================= */

const Avatar = ({ name }) => {
  const label = (name || "?").trim() || "?";
  const tone = AVATAR_TONES[label.charCodeAt(0) % AVATAR_TONES.length];
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${tone} text-xs font-bold text-white shadow-sm`}
    >
      {label.charAt(0).toUpperCase()}
    </div>
  );
};

const NameCell = ({ name }) => (
  <div className="flex items-center gap-3">
    <Avatar name={name} />
    <span className="font-semibold text-slate-900">{name}</span>
  </div>
);

const Pill = ({ tone = "blue", children }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${PILL_TONES[tone]}`}
  >
    {children}
  </span>
);

const RatingPill = ({ value }) => {
  if (value === "Good fit") return <Pill tone="green">{value}</Pill>;
  if (value === "Maybe") return <Pill tone="blue">{value}</Pill>;
  if (value) return <Pill tone="red">{value}</Pill>;
  return <span className="text-slate-400">-</span>;
};

const CountTile = ({ label, count, gradient }) => (
  <div
    className={`min-w-[104px] flex-1 rounded-xl bg-gradient-to-br ${gradient} px-4 py-3 text-white shadow-md`}
  >
    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80">{label}</p>
    <p className="mt-1 text-2xl font-bold tabular-nums">{count}</p>
  </div>
);

const TabButton = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
      active
        ? "bg-gradient-to-r from-indigo-900 to-indigo-600 text-white shadow-md"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    }`}
  >
    {children}
  </button>
);

const SortIcon = ({ active, direction }) => {
  if (!active) return <span className="text-slate-300">⇅</span>;
  return direction === "asc" ? (
    <FaArrowUp size={9} className="text-blue" />
  ) : (
    <FaArrowDown size={9} className="text-blue" />
  );
};

const ModalShell = ({ children, width = "max-w-md" }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-[2px]">
    <div
      className={`relative max-h-[90vh] w-full ${width} overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl`}
    >
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, onClose, tone = "from-[#324371] to-[#4f6bb8]" }) => (
  <div className={`flex items-center justify-between rounded-t-2xl bg-gradient-to-r ${tone} px-6 py-4 text-white`}>
    <h2 className="text-base font-semibold">{title}</h2>
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white cursor-pointer"
      >
        ✕
      </button>
    )}
  </div>
);

const TimeSelect = ({ hour, setHour, minute, setMinute, period, setPeriod }) => (
  <div className="flex items-center justify-center gap-1">
    <select
      value={hour}
      onChange={(e) => setHour(e.target.value)}
      className="cursor-pointer bg-transparent px-1 text-sm font-medium outline-none"
    >
      {hours.map((h) => (
        <option key={h} value={h}>
          {h}
        </option>
      ))}
    </select>
    <span className="text-slate-400">:</span>
    <select
      value={minute}
      onChange={(e) => setMinute(e.target.value)}
      className="cursor-pointer bg-transparent px-1 text-sm font-medium outline-none"
    >
      {minutes.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
    <select
      value={period}
      onChange={(e) => setPeriod(e.target.value)}
      className="cursor-pointer bg-transparent px-1 text-sm font-medium outline-none"
    >
      <option value="AM">AM</option>
      <option value="PM">PM</option>
    </select>
  </div>
);

const HrsMinsInput = ({ total, onChange }) => {
  const field =
    "w-16 rounded-xl border-2 border-slate-200 p-2 text-center text-sm focus:border-blue focus:outline-none no-spinner";
  return (
    <div className="mt-1 flex items-center gap-3">
      <div className="flex items-center gap-1">
        <input
          inputMode="numeric"
          placeholder="0"
          type="text"
          value={Math.floor(total / 60)}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, "");
            onChange((Number(val) || 0) * 60 + (total % 60));
          }}
          className={field}
        />
        <span className="text-sm font-medium">Hrs</span>
      </div>
      <div className="flex items-center gap-1">
        <input
          inputMode="numeric"
          placeholder="0"
          type="text"
          value={total % 60}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, "");
            onChange(Math.floor(total / 60) * 60 + (Number(val) || 0));
          }}
          className={field}
        />
        <span className="text-sm font-medium">Mins</span>
      </div>
    </div>
  );
};

const ModeToggle = ({ mode, setMode }) => (
  <div className="inline-flex rounded-xl bg-slate-100 p-1">
    {["Online", "Offline"].map((m) => (
      <button
        key={m}
        type="button"
        onClick={() => setMode(m)}
        className={`rounded-lg px-5 py-1.5 text-sm font-semibold transition-all cursor-pointer ${
          mode === m
            ? "bg-gradient-to-r from-[#324371] to-[#4f6bb8] text-white shadow"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        {m}
      </button>
    ))}
  </div>
);

const ProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.2621 32.0818L17.4998 32.0837C17.1779 32.0836 16.856 32.0731 16.5347 32.0522C16.1371 32.0262 15.7408 31.984 15.3466 31.9258C14.8887 31.858 14.4343 31.7684 13.985 31.6573C13.542 31.5476 13.1045 31.4171 12.6738 31.2662L12.6715 31.2654C11.9623 31.0166 11.2735 30.7131 10.6114 30.3575C10.1415 30.1053 9.68586 29.8273 9.24645 29.5251C8.75231 29.1853 8.27953 28.8154 7.83079 28.4176C7.674 28.2787 7.52021 28.1364 7.3695 27.9909C4.62385 25.3388 2.9165 21.619 2.9165 17.5003C2.9165 9.4462 9.44571 2.91699 17.4998 2.91699C19.4149 2.91698 21.3113 3.29418 23.0806 4.02706C24.85 4.75994 26.4576 5.83413 27.8118 7.18832C29.166 8.54251 30.2402 10.1502 30.9731 11.9195C31.706 13.6888 32.0832 15.5852 32.0832 17.5003C32.0832 21.6191 30.3757 25.3391 27.63 27.991C27.6299 27.9912 27.6299 27.9915 27.63 27.9918C26.9392 28.6586 26.1847 29.2559 25.3773 29.7752L25.366 29.7824C25.1829 29.9 24.9971 30.0134 24.8089 30.1226L24.789 30.1342C24.4596 30.3245 24.1229 30.502 23.7797 30.666C23.6454 30.7301 23.5101 30.7921 23.374 30.8523C23.232 30.9147 23.0891 30.975 22.9453 31.0331C22.8058 31.0891 22.6655 31.143 22.5245 31.1949C22.3819 31.2471 22.2386 31.2972 22.0945 31.3451C21.9529 31.392 21.8106 31.4367 21.6676 31.4794C21.5162 31.5244 21.364 31.567 21.2112 31.6072C21.0625 31.6462 20.9131 31.6828 20.7633 31.7171C20.6138 31.7512 20.4637 31.783 20.3132 31.8125C19.6997 31.9324 19.0791 32.0127 18.4553 32.0529C18.3002 32.0629 18.145 32.0705 17.9897 32.0756L17.9867 32.0757C17.7453 32.0836 17.5036 32.0856 17.2621 32.0818ZM18.9582 23.3337H16.0415C13.7184 23.3337 11.6867 24.7007 10.7527 26.6994L10.6471 26.9416L10.7385 27.0092C12.4008 28.1931 14.3867 28.9523 16.5377 29.1279C16.6019 29.1331 16.6663 29.1378 16.7308 29.142L16.5466 29.1286C16.6093 29.1337 16.6721 29.1383 16.735 29.1423L16.7308 29.142C16.7931 29.1461 16.8555 29.1497 16.9181 29.1528L16.735 29.1423C16.8 29.1466 16.8651 29.1502 16.9304 29.1533L16.9181 29.1528C16.965 29.1551 17.0119 29.1571 17.0588 29.1588L17.4998 29.167L17.6827 29.1656C17.7499 29.1646 17.8171 29.163 17.8843 29.1608L17.6998 29.1653C17.762 29.1643 17.8241 29.1628 17.886 29.1607L17.8843 29.1608C17.9468 29.1588 18.0092 29.1563 18.0715 29.1533L17.886 29.1607C17.9503 29.1586 18.0145 29.156 18.0788 29.1528L18.0715 29.1533C18.1364 29.1501 18.2011 29.1464 18.2656 29.1423L18.0788 29.1528C18.142 29.1498 18.2051 29.1462 18.2681 29.1421L18.2657 29.1422C18.3289 29.1381 18.3919 29.1336 18.4548 29.1285L18.268 29.1421C18.3323 29.1379 18.3965 29.1332 18.4606 29.128L18.4548 29.1285C18.5159 29.1235 18.5768 29.1181 18.6376 29.1122L18.4606 29.128C18.5244 29.1228 18.5881 29.1171 18.6516 29.1109L18.6376 29.1122C20.7168 28.911 22.6363 28.164 24.2512 27.0162L24.3511 26.9416L24.247 26.6997C23.3539 24.7878 21.4561 23.4537 19.2595 23.3413L18.9582 23.3337ZM17.4998 5.83368C11.0565 5.83368 5.83319 11.057 5.83319 17.5003C5.83319 20.2828 6.80725 22.8378 8.43297 24.8428C9.93879 22.1992 12.782 20.417 16.0415 20.417H18.9582C22.2178 20.417 25.061 22.1993 26.5666 24.8426C28.1924 22.8378 29.1665 20.2828 29.1665 17.5003C29.1665 11.057 23.9432 5.83368 17.4998 5.83368ZM17.4998 7.29199C20.7215 7.29199 23.3332 9.90366 23.3332 13.1253C23.3332 16.2493 20.8774 18.7998 17.791 18.9516L17.4998 18.9587C14.2782 18.9587 11.6665 16.347 11.6665 13.1253C11.6665 10.0013 14.1223 7.45079 17.2087 7.2991L17.4998 7.29199ZM17.4998 10.2087C15.889 10.2087 14.5832 11.5145 14.5832 13.1253C14.5832 14.7361 15.889 16.042 17.4998 16.042C19.1106 16.042 20.4165 14.7361 20.4165 13.1253C20.4165 11.5145 19.1106 10.2087 17.4998 10.2087Z"
      fill="#814CEC"
    />
  </svg>
);

const ReviewIcon = () => (
  <svg width="20" height="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5.83333 17.5H10.2813L17.5729 10.2083C17.7917 9.98958 17.956 9.74021 18.0658 9.46021C18.1757 9.18021 18.2301 8.90701 18.2292 8.64062C18.2282 8.37424 18.1674 8.11319 18.0469 7.8575C17.9263 7.60181 17.7683 7.36458 17.5729 7.14583L16.2604 5.76042C16.0417 5.54167 15.7986 5.37785 15.5312 5.26896C15.2639 5.16007 14.9844 5.10514 14.6927 5.10417C14.4253 5.10417 14.1522 5.1591 13.8731 5.26896C13.5941 5.37882 13.3447 5.54264 13.125 5.76042L5.83333 13.0521V17.5ZM8.02083 15.3125V13.9271L11.7031 10.2448L12.4323 10.901L13.0885 11.6302L9.40625 15.3125H8.02083ZM12.4323 10.901L13.0885 11.6302L11.7031 10.2448L12.4323 10.901ZM13.3802 17.5H23.3333V14.5833H16.2969L13.3802 17.5ZM0 29.1667V2.91667C0 2.11458 0.285833 1.42819 0.8575 0.8575C1.42917 0.286806 2.11556 0.000972222 2.91667 0H26.25C27.0521 0 27.739 0.285833 28.3106 0.8575C28.8823 1.42917 29.1676 2.11556 29.1667 2.91667V20.4167C29.1667 21.2187 28.8813 21.9056 28.3106 22.4773C27.7399 23.049 27.0531 23.3343 26.25 23.3333H5.83333L0 29.1667ZM4.59375 20.4167H26.25V2.91667H2.91667V22.0573L4.59375 20.4167Z"
      fill="#4A8ED3"
    />
  </svg>
);

const OfferIcon = () => (
  <svg width="20" height="24" viewBox="0 0 29 35" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5.375 24.3333H12.6667M5.375 18.5H22.875M5.375 12.6667H19.9583M1 6.83333H27.25M27.25 24.3333H18.5V33.0833M1 1V33.0833H19.9583L27.25 25.7917V1H1Z"
      stroke="#0DA95B"
      strokeWidth="2"
    />
  </svg>
);

const ViewedBadge = () => (
  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
    Viewed <HiOutlineEye />
  </span>
);

const OpenProfileButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-50"
  >
    <ProfileIcon />
    Open Profile
  </button>
);

const ReviewButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50"
  >
    <ReviewIcon />
    Review
  </button>
);

const GroupMenu = ({ label, icon, items, onPick, tone = "primary", placement = "bottom" }) => {
  const toneClass =
    tone === "danger"
      ? "border-rose-300 text-rose-600 hover:bg-rose-600 hover:text-white"
      : tone === "solid"
      ? "border-transparent bg-gradient-to-r from-[#324371] to-[#4f6bb8] text-white"
      : "border-blue text-blue hover:bg-blue hover:text-white";
  const placeClass = placement === "top" ? "top-full mt-1" : "bottom-full mb-1";
  return (
    <div className="group relative flex items-center justify-center">
      <button
        type="button"
        className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${toneClass}`}
      >
        {icon}
        {label}
        <FaChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
      </button>
      <div
        className={`absolute left-0 z-50 hidden max-h-60 w-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 text-left shadow-xl group-hover:block ${placeClass}`}
      >
        {items.map((app, idx) => {
          const name = app.name || app.fullName || app.candidateName || "";
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onPick(app)}
              title={name}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-blue"
            >
              <Avatar name={name} />
              <span className="truncate">{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* =========================================================
   Main ViewApplicants Component
   ========================================================= */

const ViewApplicants = ({
  jobId,
  status = "Open",
  jobDescription,
  isPositionLoading = false,
  positionError = null,
  refetchJobDetails,
  isHiringManagerForThisJob = true,
  currentUser,
  username,
  // Pipeline lists
  applied = [],
  selected = [],
  interviews = [],
  onHold = [],
  hired = [],
  rejectArr = [],
  All = [],
  rejectedClosed = [],
  // Loading & error
  loading = {},
  error = {},
  // Tabs & filtering
  activeTab = "Applied",
  onTabChange,
  activeTab2 = "All",
  onTab2Change,
  activeFilter = "Ratings",
  onFilterChange,
  sortConfig = { key: null, direction: "asc" },
  onSortChange,
  // Selection
  selectedRows = [],
  onCheckboxChange,
  onSelectAll,
  selectedCandidates = [],
  // Modals
  selectedApplicant,
  onSelectApplicant,
  showSchedule = false,
  onToggleSchedule,
  showReschedule = false,
  onToggleReschedule,
  selectedInterviewForReschedule,
  showScheduleGD = false,
  onToggleScheduleGD,
  showAutoSchedule = false,
  onToggleAutoSchedule,
  showRejectModel = false,
  onToggleRejectModel,
  showStartConfirm = false,
  onToggleStartConfirm,
  showViewDetail = false,
  onToggleViewDetail,
  showClose = false,
  onToggleClose,
  extendDate = false,
  onToggleExtendDate,
  selectedDate,
  onDateChange,
  isInstructionsModalOpen = false,
  onToggleInstructionsModal,
  selectedCandidateForOffer,
  // Schedule inputs
  mode = "Online",
  onModeChange,
  duration = 30,
  onDurationChange,
  autoInterval = 0,
  onAutoIntervalChange,
  isAutoScheduling = false,
  sendNotification = false,
  onSendNotificationChange,
  hour = "01",
  onHourChange,
  minute = "00",
  onMinuteChange,
  period = "AM",
  onPeriodChange,
  // API Mutations
  onRejectConfirm,
  onScheduleSubmit,
  isSchedulePending = false,
  onScheduleGDSubmit,
  isScheduleGDPending = false,
  onAutoScheduleSubmit,
  onExtendDateSubmit,
  isExtendDatePending = false,
  onCloseJobSubmit,
  isCloseJobPending = false,
  // Navigation
  onBack,
  onDetails,
  onOpenResume,
  onOpenReview,
  onSendOffer,
  // Toast
  toast,
  showToast,
  queryClient,
}) => {
  const isOpen = status === "Open";

  /* ---------- Pure Date/Time format helpers ---------- */
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatMonthYear = (input) => {
    if (!input) return "Unknown Date";
    const dateObj = new Date(input);
    if (Number.isNaN(dateObj.getTime())) return "Unknown Date";
    return dateObj.toLocaleString(undefined, { month: "long", year: "numeric" });
  };

  const formatTimeToAMPM = (time24) => {
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
  };

  const has45MinutesPassedFromSchedule = (row) => {
    if (!row?.interviewDate || !row?.interviewTime) return false;
    const dateStr = row.interviewDate;
    const timeStr = row.interviewTime.trim();
    let hrs;
    let mins;

    if (/am|pm/i.test(timeStr)) {
      const [time, modifier] = timeStr.split(" ");
      let [h, m] = time.split(":").map(Number);
      if (modifier.toLowerCase() === "pm" && h !== 12) h += 12;
      if (modifier.toLowerCase() === "am" && h === 12) h = 0;
      hrs = h;
      mins = m;
    } else {
      [hrs, mins] = timeStr.split(":").map(Number);
    }

    if (isNaN(hrs) || isNaN(mins)) return false;
    const interviewDateTime = new Date(dateStr);
    interviewDateTime.setHours(hrs, mins, 0, 0);

    const now = new Date();
    const diffInMinutes = (now - interviewDateTime) / (1000 * 60);
    return diffInMinutes >= 45;
  };

  const resumeId = (a) => a.id || a.candidateId || a._id;
  const getApplicantId = (a) => a.id || a._id || a.applicationId;

  /* ---------- Sorting Helper ---------- */
  const sortData = (rows) => {
    if (!sortConfig.key) return rows;

    return [...rows].sort((a, b) => {
      let valA;
      let valB;

      if (sortConfig.key === "appliedOn") {
        valA = new Date(a.appliedOn || a.appliedDate || 0);
        valB = new Date(b.appliedOn || b.appliedDate || 0);
      } else {
        valA = a[sortConfig.key];
        valB = b[sortConfig.key];
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const onSortKey = (key) =>
    onSortChange((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));

  const sortableHeader = (c, keyMap, currentSortConfig, onSort) => {
    const key = keyMap[c];
    return (
      <th
        key={c}
        className={`${TH} ${key ? "cursor-pointer select-none hover:text-blue" : ""}`}
        onClick={() => {
          if (!key) return;
          onSort(key);
        }}
      >
        <span className="inline-flex items-center gap-1.5">
          {c}
          {key && (
            <SortIcon
              active={currentSortConfig.key === key}
              direction={currentSortConfig.direction}
            />
          )}
        </span>
      </th>
    );
  };

  /* ---------- Filter for Closed Positions ---------- */
  const filter = All.filter((ele) =>
    activeFilter === "Good fit"
      ? ele.ratings === "Good fit"
      : activeFilter === "Maybe"
      ? ele.ratings === "Maybe"
      : activeFilter === "Not a fit"
      ? ele.ratings === "Not a fit"
      : true
  );

  /* ---------- Open Position Table Configurations ---------- */
  const getTableForOpenTab = (tabName) => {
    switch (tabName) {
      case "Applied":
        return {
          cols: ["Name", "Applied On", "Ratings", "Open Profile", "Reject Profile"],
          rows: applied,
          renderRow: (applicant) => (
            <tr key={applicant.id}>
              <td className="whitespace-nowrap">
                <NameCell
                  name={applicant.name || applicant.fullName || applicant.candidateName || "-"}
                />
              </td>
              <td className="whitespace-nowrap">
                {applicant.appliedOn || applicant.appliedDate
                  ? formatDate(applicant.appliedOn || applicant.appliedDate)
                  : "-"}
              </td>
              <td className="whitespace-nowrap">
                <RatingPill value={applicant.ratings || applicant.rating} />
              </td>
              <td className="whitespace-nowrap">
                {applicant.profile === "Viewed" ? (
                  <ViewedBadge />
                ) : (
                  <OpenProfileButton
                    onClick={() => onOpenResume(applicant, resumeId(applicant))}
                  />
                )}
              </td>
              <td className="whitespace-nowrap">
                {isHiringManagerForThisJob ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectApplicant(applicant);
                      onToggleRejectModel(true);
                    }}
                    className="rounded-lg p-2 transition-colors hover:bg-rose-50 cursor-pointer"
                    aria-label="Reject"
                  >
                    <RxCrossCircled className="text-xl font-bold text-rose-600" />
                  </button>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ),
        };

      case "Selected":
        return {
          cols: [
            "Name",
            "Selected On",
            "Ratings",
            "Interview",
            "Open Profile",
            "Reject Profile",
          ],
          rows: selected,
          renderRow: (applicant) => {
            let submittedOn = "--";
            const rawDate =
              applicant.lastUpdated ||
              applicant.submiitedOn ||
              applicant.submittedOn ||
              applicant.appliedOn;
            if (rawDate) submittedOn = formatDate(rawDate);

            return (
              <tr key={applicant.id}>
                <td className="whitespace-nowrap">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer accent-[#324371]"
                      checked={selectedRows.includes(applicant.applicationId)}
                      onChange={() => onCheckboxChange(applicant.applicationId)}
                    />
                    <NameCell
                      name={
                        applicant.name || applicant.fullName || applicant.candidateName || "-"
                      }
                    />
                  </label>
                </td>
                <td className="whitespace-nowrap">{submittedOn}</td>
                <td className="whitespace-nowrap">
                  <RatingPill value={applicant.ratings || applicant.rating} />
                </td>
                <td className="whitespace-nowrap">
                  {isHiringManagerForThisJob ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectApplicant(applicant);
                        onToggleSchedule((prev) => !prev);
                      }}
                      className="cursor-pointer rounded-lg bg-gradient-to-r from-[#324371] to-[#4f6bb8] px-3 py-1 text-xs font-semibold text-white shadow-sm hover:opacity-90"
                    >
                      {applicant.interview || "Schedule"}
                    </button>
                  ) : (
                    applicant.interview || "-"
                  )}
                </td>
                <td className="whitespace-nowrap">
                  {applicant.profile === "Viewed" ? (
                    <ViewedBadge />
                  ) : (
                    <OpenProfileButton
                      onClick={() => onOpenResume(applicant, resumeId(applicant))}
                    />
                  )}
                </td>
                <td className="whitespace-nowrap">
                  {isHiringManagerForThisJob ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectApplicant(applicant);
                        onToggleRejectModel(true);
                      }}
                      className="rounded-lg p-2 transition-colors hover:bg-rose-50 cursor-pointer"
                      aria-label="Reject"
                    >
                      <RxCrossCircled className="text-xl font-bold text-rose-600" />
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            );
          },
        };

      case "Interview":
        return {
          cols: [
            "Name",
            "Schedule Type",
            "Interview Date",
            "Interview Time",
            "Open Profile",
            "Actions",
            "Status",
          ],
          rows: interviews,
          renderRow: (r) => {
            const groupNames =
              r.scheduleType === "Group Interview" && r.allApplications?.length > 0
                ? (() => {
                    const names = r.allApplications.map(
                      (a) => a.name || a.fullName || a.candidateName
                    );
                    return names.length <= 2
                      ? names.join(", ")
                      : `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
                  })()
                : null;

            return (
              <tr key={r.id}>
                <td className="whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <NameCell
                      name={groupNames || r.name || r.fullName || r.candidateName || "-"}
                    />
                    {r.scheduleType === "Group Interview" && (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 ring-1 ring-inset ring-violet-200">
                        GD
                      </span>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap">
                  <Pill tone="blue">{r.scheduleType}</Pill>
                </td>
                <td className="whitespace-nowrap">
                  {r.interviewDate ? formatDate(r.interviewDate) : "-"}
                </td>
                <td className="whitespace-nowrap">{formatTimeToAMPM(r.interviewTime)}</td>
                <td className="whitespace-nowrap">
                  {r.profile === "Viewed" ? (
                    <ViewedBadge />
                  ) : r.scheduleType === "Group Interview" && r.allApplications?.length > 1 ? (
                    <GroupMenu
                      label="Open Profile"
                      icon={<ProfileIcon />}
                      placement="top"
                      items={r.allApplications}
                      onPick={(app) =>
                        onOpenResume(app, app.id || app.candidateId || app._id)
                      }
                    />
                  ) : (
                    <OpenProfileButton onClick={() => onOpenResume(r, resumeId(r))} />
                  )}
                </td>
                <td className="whitespace-nowrap">
                  {isHiringManagerForThisJob ? (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectApplicant(r);
                          onToggleReschedule((prev) => !prev);
                        }}
                        className="rounded-lg p-1.5 text-indigo-600 transition-colors hover:bg-indigo-50 cursor-pointer"
                        aria-label="Reschedule"
                      >
                        <LuSquarePen className="text-lg" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectApplicant(r);
                          onToggleRejectModel(true);
                        }}
                        className="rounded-lg p-1.5 transition-colors hover:bg-rose-50 cursor-pointer"
                        aria-label="Reject"
                      >
                        <RxCrossCircled className="text-xl font-bold text-rose-600" />
                      </button>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="whitespace-nowrap">
                  <div className="flex flex-col items-start gap-1">
                    {isHiringManagerForThisJob && (
                      <button
                        type="button"
                        disabled={has45MinutesPassedFromSchedule(r)}
                        onClick={() => {
                          if (has45MinutesPassedFromSchedule(r)) return;
                          onSelectApplicant(r);
                          onToggleStartConfirm(true);
                        }}
                        className={`text-xs font-semibold underline ${
                          has45MinutesPassedFromSchedule(r)
                            ? "cursor-not-allowed text-slate-400"
                            : "cursor-pointer text-blue"
                        }`}
                      >
                        Start Interview
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectApplicant(r);
                        onToggleViewDetail(true);
                      }}
                      className="cursor-pointer text-xs font-semibold text-blue underline"
                    >
                      View Details
                    </button>
                  </div>
                </td>
              </tr>
            );
          },
        };

      case "On-Hold":
        return {
          cols: [
            "Name",
            "Interview Date",
            "Interview Time",
            "Open Profile",
            "Review",
            "Action",
          ],
          rows: onHold,
          renderRow: (r) => (
            <tr key={r.id}>
              <td className="whitespace-nowrap">
                <NameCell name={r.name || r.fullName || r.candidateName || "-"} />
              </td>
              <td className="whitespace-nowrap">
                {r.interviewDate || r.date || r.scheduledDate
                  ? formatDate(r.interviewDate || r.date || r.scheduledDate)
                  : "-"}
              </td>
              <td className="whitespace-nowrap">
                {formatTimeToAMPM(r.interviewTime || r.time)}
              </td>
              <td className="whitespace-nowrap">
                <OpenProfileButton onClick={() => onOpenResume(r, resumeId(r))} />
              </td>
              <td className="whitespace-nowrap">
                {r.profile === "Viewed" ? (
                  <ViewedBadge />
                ) : isHiringManagerForThisJob ? (
                  <ReviewButton onClick={() => onOpenReview(r, r.id)} />
                ) : (
                  "-"
                )}
              </td>
              <td className="whitespace-nowrap">
                {isHiringManagerForThisJob ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectApplicant(r);
                      onToggleRejectModel(true);
                    }}
                    className="rounded-lg p-2 transition-colors hover:bg-rose-50 cursor-pointer"
                    aria-label="Reject"
                  >
                    <RxCrossCircled className="text-xl font-bold text-rose-600" />
                  </button>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ),
        };

      case "Hired":
        return {
          cols: [
            "Name",
            "Interview Date",
            "Interview Time",
            "Open Profile",
            "Review",
            "Send Offer",
          ],
          rows: hired,
          renderRow: (r) => (
            <tr key={r.id}>
              <td className="whitespace-nowrap">
                <NameCell name={r.name || r.fullName || r.candidateName || "-"} />
              </td>
              <td className="whitespace-nowrap">
                {r.interviewDate || r.date || r.hiredDate
                  ? formatDate(r.interviewDate || r.date || r.hiredDate)
                  : "-"}
              </td>
              <td className="whitespace-nowrap">
                {formatTimeToAMPM(r.interviewTime || r.time)}
              </td>
              <td className="whitespace-nowrap">
                {r.profile === "Viewed" ? (
                  <ViewedBadge />
                ) : (
                  <OpenProfileButton onClick={() => onOpenResume(r, resumeId(r))} />
                )}
              </td>
              <td className="whitespace-nowrap">
                {r.profile === "Viewed" ? (
                  <ViewedBadge />
                ) : (
                  <ReviewButton onClick={() => onOpenReview(r, r.id)} />
                )}
              </td>
              <td className="whitespace-nowrap">
                {isHiringManagerForThisJob ? (
                  <button
                    type="button"
                    onClick={() => onSendOffer(r)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
                  >
                    <OfferIcon />
                    Send Offer Letter
                  </button>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ),
        };

      case "rejected":
      case "Rejected":
        return {
          cols: ["Name", "Applied On", "Ratings", "Open Profile", "Review"],
          rows: rejectArr,
          renderRow: (r) => (
            <tr key={r.id}>
              <td className="whitespace-nowrap">
                <NameCell name={r.name || r.fullName || r.candidateName || "-"} />
              </td>
              <td className="whitespace-nowrap">
                {r.appliedOn || r.appliedDate
                  ? formatDate(r.appliedOn || r.appliedDate)
                  : "-"}
              </td>
              <td className="whitespace-nowrap">
                <RatingPill value={r.ratings || r.rating} />
              </td>
              <td className="whitespace-nowrap">
                {r.profile === "Viewed" ? (
                  <ViewedBadge />
                ) : (
                  <OpenProfileButton onClick={() => onOpenResume(r, resumeId(r))} />
                )}
              </td>
              <td className="whitespace-nowrap">
                {r.feedbackDescription === "--" ? (
                  <span className="font-bold text-slate-400">--</span>
                ) : (
                  <ReviewButton onClick={() => onOpenReview(r, r.id)} />
                )}
              </td>
            </tr>
          ),
        };

      default:
        return { cols: [], rows: [], renderRow: () => null };
    }
  };

  /* ---------- Closed Position Table Configurations ---------- */
  const getTableForClosedTab = (tabName) => {
    switch (tabName) {
      case "All":
        return {
          cols: ["Name", "Applied On", "Ratings", "Open Profile", "Review"],
          rows: filter,
          renderRow: (applicant) => (
            <tr key={applicant.id}>
              <td className="whitespace-nowrap">
                <NameCell name={applicant.name || "-"} />
              </td>
              <td className="whitespace-nowrap">
                {applicant.appliedOn || applicant.appliedDate
                  ? formatDate(applicant.appliedOn || applicant.appliedDate)
                  : "-"}
              </td>
              <td className="whitespace-nowrap">
                <RatingPill value={applicant.ratings || applicant.rating} />
              </td>
              <td className="whitespace-nowrap">
                {applicant.profile === "Viewed" ? (
                  <ViewedBadge />
                ) : (
                  <OpenProfileButton
                    onClick={() => onOpenResume(applicant, resumeId(applicant))}
                  />
                )}
              </td>
              <td className="whitespace-nowrap">
                <ReviewButton onClick={() => onOpenReview(applicant, applicant.id)} />
              </td>
            </tr>
          ),
        };

      case "Hired":
        return {
          cols: ["Name", "Applied On", "Ratings", "Open Profile", "Review"],
          rows: hired,
          renderRow: (applicant) => (
            <tr key={applicant.id}>
              <td className="whitespace-nowrap">
                <NameCell name={applicant.name || "-"} />
              </td>
              <td className="whitespace-nowrap">
                {applicant.appliedOn || applicant.appliedDate
                  ? formatDate(applicant.appliedOn || applicant.appliedDate)
                  : "-"}
              </td>
              <td className="whitespace-nowrap">
                <RatingPill value={applicant.ratings} />
              </td>
              <td className="whitespace-nowrap">
                {applicant.profile === "Viewed" ? (
                  <ViewedBadge />
                ) : (
                  <OpenProfileButton
                    onClick={() => onOpenResume(applicant, resumeId(applicant))}
                  />
                )}
              </td>
              <td className="whitespace-nowrap">
                <ReviewButton
                  onClick={() => onOpenReview(applicant.candidate, applicant.id)}
                />
              </td>
            </tr>
          ),
        };

      case "Rejected":
        return {
          cols: ["Name", "Applied On", "Ratings", "Open Profile", "Review"],
          rows: rejectedClosed,
          renderRow: (applicant) => (
            <tr key={applicant.id}>
              <td className="whitespace-nowrap">
                <NameCell name={applicant.name || "-"} />
              </td>
              <td className="whitespace-nowrap">
                {applicant.appliedOn ? formatDate(applicant.appliedOn) : "-"}
              </td>
              <td className="whitespace-nowrap">
                <RatingPill value={applicant.ratings} />
              </td>
              <td className="whitespace-nowrap">
                {applicant.profile === "Viewed" ? (
                  <ViewedBadge />
                ) : (
                  <OpenProfileButton
                    onClick={() => onOpenResume(applicant, resumeId(applicant))}
                  />
                )}
              </td>
              <td className="whitespace-nowrap">
                <ReviewButton onClick={() => onOpenReview(applicant, applicant.id)} />
              </td>
            </tr>
          ),
        };

      default:
        return { cols: [], rows: [], renderRow: () => null };
    }
  };

  const currentTable = getTableForOpenTab(activeTab);
  const currentClosedTable = getTableForClosedTab(activeTab2);

  const postedLabel = isPositionLoading
    ? "Loading..."
    : jobDescription?.postedOn
    ? formatMonthYear(jobDescription.postedOn)
    : "Unknown Date";

  const closedLabel = isPositionLoading
    ? "Loading..."
    : jobDescription?.closingDate || jobDescription?.closedOn
    ? formatMonthYear(jobDescription?.closingDate || jobDescription?.closedOn)
    : "Unknown Date";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-sky-50/50">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {toast && <Toast message={toast.message} type={toast.type} />}

        {/* Top bar header */}
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onDetails}
              aria-label="Go back"
              className="rounded-full bg-white p-2 text-slate-500 shadow-sm ring-1 ring-slate-200 transition-colors hover:text-blue cursor-pointer"
            >
              <IoArrowBack className="text-2xl" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                Candidates
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Candidate’s Page
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:ml-auto">
            <button type="button" className={BTN_OUTLINE} onClick={onDetails}>
              <HiOutlineBriefcase className="text-lg" />
              View Job Details
            </button>
            <button type="button" className={BTN_DANGER} onClick={onBack}>
              <RxCrossCircled className="text-lg" />
              Cancel
            </button>
          </div>
        </section>

        {/* Position hero banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 to-indigo-600 p-6 text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                  isOpen
                    ? "bg-emerald-400/20 text-emerald-100 ring-emerald-300/40"
                    : "bg-rose-400/20 text-rose-100 ring-rose-300/40"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${isOpen ? "bg-emerald-300" : "bg-rose-300"}`}
                />
                {status || "-"}
              </span>

              {positionError && (
                <div className="mt-3 rounded-lg bg-rose-500/20 px-3 py-2 text-sm text-rose-100">
                  Error loading position details: {positionError.message}
                </div>
              )}

              <h2 className="mt-3 truncate text-2xl font-bold md:text-3xl">
                {isPositionLoading
                  ? "Loading..."
                  : jobDescription?.jobTitle || "Position Title"}
              </h2>
              <p className="mt-1 text-sm text-white/75">
                {status} | {isOpen ? `Opened on ${postedLabel}` : `Closed on ${closedLabel}`}
              </p>
              {!isOpen && (
                <p className="mt-2 text-sm text-white/75">
                  Sorted by Positions Opened {postedLabel} ·{" "}
                  <span className="font-semibold text-white">{All.length} applicants</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              {!isOpen && (
                <select
                  className="cursor-pointer rounded-xl border border-white/30 bg-white/15 px-3 py-2 text-sm font-semibold text-white backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/50 [&>option]:text-slate-900"
                  value={activeFilter}
                  onChange={(e) => onFilterChange(e.target.value)}
                >
                  <option value="Ratings">Ratings</option>
                  <option value="Good fit">Good fit</option>
                  <option value="Maybe">Maybe</option>
                  <option value="Not a fit">Not a fit</option>
                </select>
              )}

              {activeTab === "Selected" && (
                <>
                  <button
                    type="button"
                    disabled={selectedRows.length < 1}
                    onClick={() => onToggleAutoSchedule(true)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                      selectedRows.length >= 1
                        ? "bg-white text-blue shadow-md hover:bg-amber-100 cursor-pointer"
                        : "cursor-not-allowed bg-white/10 text-white/50"
                    }`}
                  >
                    Schedule
                  </button>
                  <button
                    type="button"
                    disabled={selectedRows.length < 2}
                    onClick={() => onToggleScheduleGD((prev) => !prev)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                      selectedRows.length >= 2
                        ? "bg-amber-300 text-slate-900 shadow-md hover:bg-amber-200 cursor-pointer"
                        : "cursor-not-allowed bg-white/10 text-white/50"
                    }`}
                  >
                    Schedule a GD
                  </button>
                </>
              )}

              {activeTab === "Interview" && selectedRows.length > 0 && (
                <button
                  type="button"
                  className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md hover:bg-amber-200 cursor-pointer"
                  onClick={() => {
                    const firstSelected = interviews.find((i) =>
                      selectedRows.includes(i.applicationId)
                    );
                    if (firstSelected) {
                      onSelectApplicant(firstSelected);
                      onToggleReschedule(true);
                    }
                  }}
                >
                  Reschedule GD
                </button>
              )}
            </div>
          </div>

          {/* Count tiles */}
          <div className="relative mt-6 flex flex-wrap gap-3">
            {isOpen ? (
              <>
                <CountTile
                  label="Applied"
                  count={applied.length}
                  gradient="from-sky-500 to-blue-600"
                />
                <CountTile
                  label="Selected"
                  count={selected.length}
                  gradient="from-emerald-500 to-teal-600"
                />
                <CountTile
                  label="Interviews"
                  count={interviews.length}
                  gradient="from-violet-500 to-purple-600"
                />
                <CountTile
                  label="On Hold"
                  count={onHold.length}
                  gradient="from-amber-400 to-orange-500"
                />
                <CountTile
                  label="Rejected"
                  count={rejectArr.length}
                  gradient="from-rose-500 to-red-600"
                />
              </>
            ) : (
              <>
                <CountTile
                  label="Applied"
                  count={All.length}
                  gradient="from-sky-500 to-blue-600"
                />
                <CountTile
                  label="Hired"
                  count={hired.length}
                  gradient="from-emerald-500 to-teal-600"
                />
                <CountTile
                  label="Rejected"
                  count={rejectArr.length}
                  gradient="from-rose-500 to-red-600"
                />
              </>
            )}
          </div>
        </section>

        {/* Pipeline Tables */}
        {isOpen ? (
          <div className={`${CARD} overflow-hidden`}>
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
                {["Applied", "Selected", "Interview", "On-Hold", "Hired", "Rejected"].map(
                  (t) => (
                    <TabButton
                      key={t}
                      active={activeTab === t}
                      onClick={() => onTabChange(t)}
                    >
                      {t}
                    </TabButton>
                  )
                )}
              </div>
              <p className="text-xs font-semibold text-slate-500">
                No. of Applications:{" "}
                <span className="ml-1 rounded-full bg-blue px-2 py-0.5 text-white">
                  {currentTable?.rows?.length || 0}
                </span>
              </p>
            </div>

            <div className="space-y-3 px-4 pt-4 sm:px-5">
              {loading?.all && (
                <div className="text-sm text-slate-500">Loading applicants...</div>
              )}
              {error?.all && (
                <div className="text-sm text-rose-600">Failed to load applicants.</div>
              )}

              {activeTab === "Selected" && (
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer accent-[#324371]"
                    onChange={() =>
                      onSelectAll(currentTable.rows.map((row) => getApplicantId(row)))
                    }
                    checked={
                      selectedRows.length > 0 &&
                      selectedRows.length === currentTable.rows.length
                    }
                  />
                  Select All
                </label>
              )}
            </div>

            {currentTable.rows && currentTable.rows.length > 0 ? (
              <div className="mt-3 max-h-[32rem] overflow-auto border-t border-slate-200">
                <table className="w-full min-w-[680px]">
                  <thead className="sticky top-0 z-10 bg-gradient-to-r from-indigo-50 via-slate-50 to-sky-50 shadow-[0_1px_0_rgba(15,23,42,0.06)]">
                    <tr>
                      {currentTable.cols.map((c) =>
                        sortableHeader(c, OPEN_SORT_KEYS, sortConfig, onSortKey)
                      )}
                    </tr>
                  </thead>
                  <tbody className={TBODY}>
                    {sortData(currentTable.rows).map((row) => currentTable.renderRow(row))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border-t border-slate-200 py-16 text-center">
                <p className="text-sm font-semibold text-slate-600">
                  No data to show for {activeTab}.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Applicants will appear here as they move through the pipeline.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className={`${CARD} overflow-hidden`}>
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50/50 px-4 py-3 sm:px-5">
              <div className="flex w-fit gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
                {["All", "Hired", "Rejected"].map((t) => (
                  <TabButton
                    key={t}
                    active={activeTab2 === t}
                    onClick={() => onTab2Change(t)}
                  >
                    {t}
                  </TabButton>
                ))}
              </div>
            </div>

            {currentClosedTable.rows && currentClosedTable.rows.length > 0 ? (
              <div className="max-h-[32rem] overflow-auto">
                <table className="w-full min-w-[680px]">
                  <thead className="sticky top-0 z-10 bg-gradient-to-r from-indigo-50 via-slate-50 to-sky-50">
                    <tr>
                      {currentClosedTable.cols.map((c) =>
                        sortableHeader(c, CLOSED_SORT_KEYS, sortConfig, onSortKey)
                      )}
                    </tr>
                  </thead>
                  <tbody className={TBODY}>
                    {sortData(currentClosedTable.rows).map((row) =>
                      currentClosedTable.renderRow(row)
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-sm font-semibold text-slate-600">
                  No data to show for {activeTab2}.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= Modals & Popups ================= */}

      {/* Hired Tab Footer Actions */}
      {activeTab === "Hired" && isOpen && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-500 hover:text-white cursor-pointer"
            onClick={() => onToggleExtendDate((prev) => !prev)}
          >
            <FaCalendarAlt size={12} />
            Extend Date
          </button>
          <button
            type="button"
            className={BTN_DANGER}
            onClick={() => onToggleClose((prev) => !prev)}
          >
            <RxCrossCircled size={16} />
            Close Position
          </button>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModel && (
        <ModalShell width="max-w-2xl">
          <div className="flex flex-col sm:flex-row">
            <div className="flex-1 p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-2xl text-rose-600">
                <RxCrossCircled />
              </div>
              <p className="text-lg font-bold text-slate-900">
                Are you sure you want to Reject this candidate?
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:opacity-90"
                  onClick={onRejectConfirm}
                >
                  Confirm <HiOutlineCheckCircle />
                </button>
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  onClick={() => onToggleRejectModel(false)}
                >
                  Cancel <RxCrossCircled />
                </button>
              </div>
            </div>
            <div className="flex w-full items-center justify-center bg-slate-50 p-4 sm:w-[40%]">
              <img src={Confirm} alt="" className="h-auto w-full object-contain" />
            </div>
          </div>
        </ModalShell>
      )}

      {/* Start Interview Confirm Modal */}
      {showStartConfirm && (
        <ModalShell width="max-w-sm">
          <ModalHeader title="Start interview" tone="from-emerald-500 to-teal-500" />
          <div className="p-6">
            <p className="text-center text-sm font-medium text-slate-800">
              Are you going to start interview ?
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!selectedApplicant) return;
                  let link =
                    selectedApplicant?.meetingLink ||
                    selectedApplicant?.meetLink ||
                    "https://meet.google.com/new";
                  if (typeof link === "string" && link.includes("placeholder")) {
                    link = "https://meet.google.com/new";
                  }
                  showToast("Joining interview...", "success");
                  window.open(link, "_blank", "noopener,noreferrer");
                  onToggleStartConfirm(false);
                }}
                className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 cursor-pointer"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => onToggleStartConfirm(false)}
                className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Extend Date Modal */}
      {extendDate && (
        <ModalShell width="max-w-md">
          <ModalHeader
            title="Choose the Date for Extension"
            tone="from-amber-500 to-orange-500"
          />
          <div className="space-y-3 p-6">
            <label className="block text-sm font-semibold text-slate-700">Date</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => onDateChange(date)}
              dateFormat="dd-MM-yyyy"
              className={INPUT}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                disabled={isExtendDatePending}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#324371] to-[#4f6bb8] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
                onClick={onExtendDateSubmit}
              >
                {isExtendDatePending ? "Saving..." : "Confirm"}{" "}
                <HiOutlineCheckCircle />
              </button>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                onClick={() => onToggleExtendDate(false)}
              >
                Cancel <RxCrossCircled />
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Close Position Modal */}
      {showClose && (
        <ModalShell width="max-w-md">
          <ModalHeader title="Close Position" tone="from-rose-500 to-red-600" />
          <div className="p-6">
            <p className="text-center text-sm font-semibold text-slate-800">
              Are You Sure You Want To Close?
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                disabled={isCloseJobPending}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
                onClick={onCloseJobSubmit}
              >
                {isCloseJobPending ? "Closing..." : "Confirm"}{" "}
                <HiOutlineCheckCircle />
              </button>
              <button
                type="button"
                disabled={isCloseJobPending}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                onClick={() => onToggleClose(false)}
              >
                Cancel <RxCrossCircled />
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Single Interview Scheduling Modal */}
      {showSchedule && selectedApplicant && (
        <ModalShell width="max-w-3xl">
          <ModalHeader
            title="Interview Scheduling"
            onClose={() => onToggleSchedule(false)}
          />
          <div className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="w-full space-y-4 lg:w-[60%]">
                <div className="space-y-1 rounded-xl bg-slate-50 p-4 text-sm">
                  <p>
                    <span className="font-semibold text-slate-700">Candidate:</span>{" "}
                    {selectedApplicant.name}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Position:</span>{" "}
                    {jobDescription?.jobTitle || "Position Title"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Recruiter Name:</span>{" "}
                    {getDisplayName(currentUser)}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Date &amp; Time
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <FaCalendarAlt size={18} className="text-blue" />
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => onDateChange(date)}
                        dateFormat="dd-MM-yyyy"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <FaClock size={15} className="text-blue" />
                      <TimeSelect
                        hour={hour}
                        setHour={onHourChange}
                        minute={minute}
                        setMinute={onMinuteChange}
                        period={period}
                        setPeriod={onPeriodChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Meeting Mode
                  </label>
                  <ModeToggle mode={mode} setMode={onModeChange} />
                </div>

                <div className="flex items-center gap-3">
                  <Calendar size={24} className="text-blue" />
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => onDurationChange(Number(e.target.value) || 30)}
                    className="w-20 rounded-lg border border-slate-200 py-1.5 text-center text-sm focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30"
                  />
                  <span className="text-sm text-slate-600">Minutes</span>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={sendNotification}
                    onChange={(e) => onSendNotificationChange(e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-[#324371]"
                  />
                  Send Notification
                </label>
              </div>

              <div className="hidden lg:flex lg:w-[40%] items-center justify-center">
                <img
                  src={scheduleImg}
                  alt="Schedule"
                  className="h-auto max-w-full object-contain"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onToggleSchedule(false)}
                className="rounded-xl border border-rose-300 px-5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-600 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSchedulePending}
                onClick={onScheduleSubmit}
                className={`rounded-xl bg-gradient-to-r from-[#324371] to-[#4f6bb8] px-6 py-2 text-sm font-semibold text-white shadow-md ${
                  isSchedulePending
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:opacity-90"
                }`}
              >
                {isSchedulePending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Group Discussion (GD) Scheduling Modal */}
      {showScheduleGD && (
        <ModalShell width="max-w-3xl">
          <ModalHeader
            title="Interview Scheduling"
            onClose={() => onToggleScheduleGD(false)}
          />
          <div className="p-6">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="flex-1 space-y-4">
                <div className="space-y-1 rounded-xl bg-slate-50 p-4 text-sm">
                  <p>
                    <span className="font-semibold text-slate-700">Position:</span>{" "}
                    {jobDescription?.jobTitle || "Position Title"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Recruiter Name:</span>{" "}
                    {currentUser?.username || currentUser?.userName || currentUser?.fullName}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 rounded-xl border border-blue/40 bg-blue/5 p-2">
                  {selectedCandidates.map((a) => (
                    <div
                      key={getApplicantId(a)}
                      className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200"
                    >
                      <span>{a.name || a.fullName || a.candidateName}</span>
                      <button
                        type="button"
                        onClick={() => onCheckboxChange(getApplicantId(a))}
                        className="rounded-full p-0.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <IoClose />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Date &amp; Time
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <FaCalendarAlt size={18} className="text-blue" />
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => onDateChange(date)}
                        dateFormat="dd-MM-yyyy"
                        className="w-full cursor-pointer bg-transparent text-sm font-medium text-slate-700 outline-none"
                      />
                    </div>
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <FaClock size={16} className="text-blue" />
                      <TimeSelect
                        hour={hour}
                        setHour={onHourChange}
                        minute={minute}
                        setMinute={onMinuteChange}
                        period={period}
                        setPeriod={onPeriodChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Meeting Mode
                  </label>
                  <ModeToggle mode={mode} setMode={onModeChange} />
                </div>

                <div className="flex items-center gap-3">
                  <Calendar size={24} className="text-blue" />
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => onDurationChange(Number(e.target.value) || 30)}
                    className="w-20 rounded-lg border border-slate-200 px-3 py-1.5 text-center text-sm focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30"
                  />
                  <span className="text-sm text-slate-600">Minutes</span>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer accent-[#324371]"
                  />
                  Send Notification
                </label>
              </div>

              <div className="flex flex-1 items-center justify-center md:w-[35%]">
                <img
                  src={scheduleGDImg}
                  alt="GD"
                  className="h-auto w-full object-contain"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isScheduleGDPending}
                onClick={() => onToggleScheduleGD(false)}
                className="rounded-xl border border-rose-300 px-5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-600 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isScheduleGDPending}
                onClick={onScheduleGDSubmit}
                className={`rounded-xl bg-gradient-to-r from-[#324371] to-[#4f6bb8] px-6 py-2 text-sm font-semibold text-white shadow-md ${
                  isScheduleGDPending
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:opacity-90"
                }`}
              >
                {isScheduleGDPending ? "Save..." : "Save"}
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Auto-Schedule Modal */}
      {showAutoSchedule && (
        <ModalShell width="max-w-3xl">
          <ModalHeader
            title="Auto Schedule Interviews"
            onClose={() => onToggleAutoSchedule(false)}
          />
          <div className="p-6">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="flex-1 space-y-4">
                <div className="space-y-1 rounded-xl bg-slate-50 p-4 text-sm">
                  <p>
                    <span className="font-semibold text-slate-700">Position:</span>{" "}
                    {jobDescription?.jobTitle || "Position Title"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Recruiter Name:</span>{" "}
                    {currentUser?.username || currentUser?.userName || currentUser?.fullName}
                  </p>
                </div>

                <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto rounded-xl border border-blue/40 bg-blue/5 p-2">
                  {selectedCandidates.map((a) => (
                    <div
                      key={getApplicantId(a)}
                      className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200"
                    >
                      <span>{a.name || a.fullName || a.candidateName}</span>
                      <button
                        type="button"
                        onClick={() => onCheckboxChange(getApplicantId(a))}
                        className="rounded-full p-0.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <IoClose />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Start Date &amp; Time
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <FaCalendarAlt size={18} className="text-blue" />
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => onDateChange(date)}
                        dateFormat="dd-MM-yyyy"
                        className="w-full cursor-pointer bg-transparent text-sm font-medium text-slate-700 outline-none"
                      />
                    </div>
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <FaClock size={16} className="text-blue" />
                      <TimeSelect
                        hour={hour}
                        setHour={onHourChange}
                        minute={minute}
                        setMinute={onMinuteChange}
                        period={period}
                        setPeriod={onPeriodChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Meeting Mode
                  </label>
                  <ModeToggle mode={mode} setMode={onModeChange} />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Duration
                    </label>
                    <HrsMinsInput total={duration} onChange={onDurationChange} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Interval
                    </label>
                    <HrsMinsInput total={autoInterval} onChange={onAutoIntervalChange} />
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={sendNotification}
                    onChange={(e) => onSendNotificationChange(e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-[#324371]"
                  />
                  Send Notification
                </label>
              </div>

              <div className="flex flex-1 items-center justify-center md:w-[35%]">
                <img
                  src={scheduleImg}
                  alt="Schedule"
                  className="w-2/3 max-w-[200px] object-contain md:w-3/4"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isAutoScheduling}
                onClick={() => onToggleAutoSchedule(false)}
                className="rounded-xl border border-rose-300 px-5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-600 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isAutoScheduling || selectedCandidates.length === 0}
                onClick={onAutoScheduleSubmit}
                className={`rounded-xl bg-gradient-to-r from-[#324371] to-[#4f6bb8] px-6 py-2 text-sm font-semibold text-white shadow-md ${
                  isAutoScheduling || selectedCandidates.length === 0
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:opacity-90"
                }`}
              >
                {isAutoScheduling ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Reschedule Modal */}
      {showReschedule && selectedInterviewForReschedule && (
        <Reschedule
          interview={selectedInterviewForReschedule}
          onCancel={() => onToggleReschedule(false)}
          onSuccess={() => {
            onToggleReschedule(false);
            queryClient.invalidateQueries({ queryKey: ["schedules"] });
            queryClient.invalidateQueries({ queryKey: ["candidates", jobId] });
          }}
        />
      )}

      {/* View Application Details Modal */}
      {showViewDetail && selectedApplicant && (
        <ModalShell width="max-w-lg md:max-w-xl">
          <ModalHeader
            title={`Application Number : ${selectedApplicant.id?.slice(-6) ?? "-"}`}
            onClose={() => onToggleViewDetail(false)}
          />

          <div className="bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-5 sm:p-6">
            <div className="mb-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-indigo-600" />
                <h3 className="text-base font-bold text-slate-800">
                  Application Details
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  ["Candidate Name", selectedApplicant.name],
                  ["Position Applied", jobDescription?.jobTitle],
                  [
                    "Interview Date",
                    selectedApplicant.interviewDate
                      ? new Date(selectedApplicant.interviewDate).toLocaleDateString("en-GB")
                      : "-",
                  ],
                  [
                    "Interview Time",
                    formatTimeToAMPM(selectedApplicant.interviewTime),
                  ],
                  ["Interview Mode", selectedApplicant.meetingMode],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="group rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
                  >
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {label}
                    </p>
                    <p className="break-words text-sm font-semibold text-slate-800">
                      {value || "-"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Application Actions
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* View Resume button */}
                <div className="w-full sm:w-auto">
                  {selectedApplicant.scheduleType === "Group Interview" &&
                  selectedApplicant.allApplications?.length > 1 ? (
                    <GroupMenu
                      label="View Profiles"
                      tone="solid"
                      items={selectedApplicant.allApplications}
                      onPick={(app) =>
                        onOpenResume(app, app.id || app.candidateId || app._id)
                      }
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenResume(
                          selectedApplicant,
                          selectedApplicant.id ||
                            selectedApplicant.candidateId ||
                            selectedApplicant._id
                        )
                      }
                      className="w-full cursor-pointer rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg sm:w-auto"
                    >
                      View Resume
                    </button>
                  )}
                </div>

                {/* Complete & Reject buttons */}
                <div className="flex flex-col gap-2 sm:flex-row">
                  {selectedApplicant.scheduleType === "Group Interview" &&
                  selectedApplicant.allApplications?.length > 1 ? (
                    <GroupMenu
                      label="Mark as Complete"
                      items={selectedApplicant.allApplications}
                      onPick={(app) =>
                        onOpenReview(
                          app,
                          app.id || app.candidateId || app._id,
                          false
                        )
                      }
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenReview(
                          selectedApplicant,
                          selectedApplicant.id,
                          false
                        )
                      }
                      className="cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-all duration-200 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
                    >
                      Mark as Complete
                    </button>
                  )}

                  {selectedApplicant.scheduleType === "Group Interview" &&
                  selectedApplicant.allApplications?.length > 1 ? (
                    <GroupMenu
                      label="Reject Profile"
                      tone="danger"
                      items={selectedApplicant.allApplications}
                      onPick={(app) => {
                        onSelectApplicant(app);
                        onToggleRejectModel(true);
                        onToggleViewDetail(false);
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onToggleRejectModel(true);
                        onToggleViewDetail(false);
                      }}
                      className="cursor-pointer rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition-all duration-200 hover:border-rose-600 hover:bg-rose-600 hover:text-white"
                    >
                      Reject Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Joining Instructions Modal for Offer */}
      <JoiningInstructionsModal
        isOpen={isInstructionsModalOpen}
        onClose={() => onToggleInstructionsModal(false)}
        jobId={jobId}
        isDraft={jobDescription?.isDraft}
        initialInstructions={jobDescription?.joiningInstructions}
        onSaveSuccess={async () => {
          onToggleInstructionsModal(false);
          if (typeof refetchJobDetails === "function") {
            await refetchJobDetails();
          }
          onSendOffer(selectedCandidateForOffer);
        }}
      />
    </div>
  );
};

export default ViewApplicants;