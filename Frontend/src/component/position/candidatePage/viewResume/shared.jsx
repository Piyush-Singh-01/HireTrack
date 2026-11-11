import React from "react";

/* =========================================================
   Design Tokens
   ========================================================= */

export const AVATAR_TONES = [
  "from-indigo-500 to-blue-400",
  "from-violet-500 to-purple-400",
  "from-emerald-500 to-teal-400",
  "from-amber-400 to-orange-400",
  "from-rose-500 to-pink-400",
  "from-sky-500 to-cyan-400",
];

/* =========================================================
   Shared Presentational Primitives
   ========================================================= */

export const Avatar = ({ name, size = "lg" }) => {
  const label = (name || "?").trim() || "?";
  const tone = AVATAR_TONES[label.charCodeAt(0) % AVATAR_TONES.length];
  const sizeClass = size === "lg" ? "h-16 w-16 text-2xl" : "h-10 w-10 text-sm";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} ${sizeClass} font-bold text-white shadow-lg ring-4 ring-white/30`}
    >
      {label.charAt(0).toUpperCase()}
    </div>
  );
};

export const SectionCard = ({
  title,
  subtitle,
  icon,
  accent = "from-indigo-500 to-blue-500",
  children,
}) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)]">
    <div className={`h-1 w-full bg-gradient-to-r ${accent}`} />
    <div className="p-5 md:p-7">
      <div className="mb-6 flex items-start gap-3">
        {icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-md`}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-slate-900 md:text-xl">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  </section>
);

export const SubHeading = ({ children }) => (
  <div className="mb-4 flex items-center gap-3">
    <span className="h-5 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-sky-400" />
    <h4 className="text-base font-bold text-slate-800">{children}</h4>
  </div>
);

export const AnswerField = ({ label, value, className = "" }) => (
  <div
    className={`rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 transition-shadow hover:shadow-sm ${className}`}
  >
    <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-500/80">
      {label}
    </div>
    <div className="mt-1.5 break-words text-sm font-medium text-slate-800 md:text-[15px]">
      {value || "-"}
    </div>
  </div>
);

export const EmptyNote = ({ children }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-500">
    {children}
  </div>
);

export const ChipList = ({ items, tone = "indigo", emptyText = "-" }) => {
  const tones = {
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
  };
  if (!items || items.length === 0)
    return <span className="text-xs text-slate-500">{emptyText}</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, idx) => (
        <span
          key={`${item}-${idx}`}
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
};

export const ModalShell = ({ children, width = "max-w-2xl" }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-[2px]">
    <div
      className={`relative flex w-full ${width} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`}
    >
      {children}
    </div>
  </div>
);

export const IconCircle = ({ tone = "bg-amber-500", children }) => (
  <div
    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tone} text-white shadow-md`}
  >
    {children}
  </div>
);

/* =========================================================
   Inline SVG Icons
   ========================================================= */

export const UserIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

export const BriefcaseIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
  </svg>
);

export const SparkIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
  </svg>
);

export const FileIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z" />
    <path d="M14 3v6h6" />
  </svg>
);

export const CheckIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

export const XIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const WarningIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
  </svg>
);

export const ResumeEmptyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="28px"
    viewBox="0 -960 960 960"
    width="28px"
    fill="currentColor"
  >
    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm80-80h280v-80H280v80Zm0-160h400v-80H280v80Zm0-160h400v-80H280v80Zm221.5-198.5Q510-807 510-820t-8.5-21.5Q493-850 480-850t-21.5 8.5Q450-833 450-820t8.5 21.5Q467-790 480-790t21.5-8.5ZM200-200v-560 560Z" />
  </svg>
);

export const formatDateValue = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
