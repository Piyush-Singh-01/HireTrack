import { useCallback, useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import getDisplayName from "../../../utils/getDisplayName";
import InputWithLabel from "./InputWithLable";
import { useGetHiringManagers, useGetAllUsers } from "../../../hooks/useUserAndRole";

/* ---------- UI-only helpers (no business logic) ---------- */

// One shared look for every input / select / dropdown trigger on this page.
// InputWithLable.jsx uses the same tokens so everything matches.
const fieldBase =
  "w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 " +
  "placeholder:text-gray-400 shadow-sm transition-colors duration-200 hover:border-gray-400 " +
  "focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

const Chevron = ({ open }) => (
  <svg
    className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
      open ? "rotate-180" : ""
    }`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

const CloseIcon = () => (
  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
  </svg>
);

const initialsOf = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

// A titled group of fields inside the card
const Section = ({ title, description, children }) => (
  <section className="py-6 first:pt-0 last:pb-0">
    <div className="mb-4">
      <h4 className="text-base font-semibold text-gray-900">{title}</h4>
      {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
    </div>
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">{children}</div>
  </section>
);

const Field = ({ label, hint, children, className = "", innerRef }) => (
  <div className={`flex w-full flex-col ${className}`} ref={innerRef}>
    <label className="mb-1.5 text-sm font-medium text-gray-700">
      {label}
      {hint && <span className="ml-1 font-normal text-gray-400">{hint}</span>}
    </label>
    {children}
  </div>
);

const BasicJobDetails = ({ applicationDetails, setApplicationDetails }) => {
  const today = new Date().toISOString().split("T")[0];
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const deptDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target)) {
        setIsDeptDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get user data from Redux store
  const authUser = useSelector((state) => state.auth.user);
  const storedUsername = useSelector((state) => state.auth.username);
  const userId = useSelector((state) => state.auth.userId);
  const role = useSelector((state) => state.auth.role);
  const displayName = getDisplayName(authUser);
  const username =
    displayName === "Unknown" ? storedUsername || "Unknown" : displayName;

  const { data: hiringManagers = [] } = useGetHiringManagers();
  const { data: allUsers = [] } = useGetAllUsers();
  const uniquePositions = [...new Set(allUsers.map((u) => u.Position).filter(Boolean))];

  const handleChangeBasic = useCallback(
    (field, value) => {
      setApplicationDetails((prev) => ({
        ...prev,
        basic: {
          ...prev.basic,
          [field]: value,
        },
      }));
    },
    [setApplicationDetails]
  );

  const hasInitializedHM = useRef(false);

  // Initialize hiring manager if not set
  useEffect(() => {
    if (applicationDetails.basic.hiringManagerId) {
      hasInitializedHM.current = true;
    }

    if (
      !hasInitializedHM.current &&
      !applicationDetails.basic.hiringManagerId &&
      (authUser?.id || userId)
    ) {
      handleChangeBasic("hiringManager", username);
      handleChangeBasic("hiringManagerId", authUser?.id || userId);
      const isSuperAdmin =
        role === "SuperAdmin" || (!role && authUser?.role === "SuperAdmin");
      const onModelVal = isSuperAdmin ? "User" : "UserAndRole";
      handleChangeBasic("hiringManagerOnModel", onModelVal);

      if (
        !applicationDetails.basic.hiringManagers ||
        applicationDetails.basic.hiringManagers.length === 0
      ) {
        handleChangeBasic("hiringManagers", [
          {
            name: username,
            userId: authUser?.id || userId,
            onModel: onModelVal,
          },
        ]);
      }
      hasInitializedHM.current = true;
    }
  }, [
    applicationDetails.basic.hiringManagerId,
    username,
    authUser?.id,
    userId,
    role,
    handleChangeBasic,
  ]);

  const currentHiringManagers = applicationDetails.basic.hiringManagers || [];
  const availableManagers = hiringManagers.filter(
    (m) => m.role !== "SuperAdmin" && m.role !== "Admin"
  );

  return (
    <div className="max-w-5xl rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h3 className="text-xl font-bold text-gray-900 md:text-2xl">
          Basic Job Details
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Provide the essential information for this job posting.
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {/* ---------- About the role ---------- */}
        <Section title="About the role" description="The title and team candidates will see.">
          <InputWithLabel
            inputWidthClass="md:w-full"
            label="Job Title"
            placeholder="e.g. Software Developer"
            value={applicationDetails.basic.jobTitle}
            onChange={(value) => handleChangeBasic("jobTitle", value)}
          />

          <InputWithLabel
            inputWidthClass="md:w-full"
            label="Job Role / Position"
            placeholder="e.g. Frontend Developer"
            value={applicationDetails.basic.jobRole}
            onChange={(value) => handleChangeBasic("jobRole", value)}
          />

          {/* Department Dropdown / Input */}
          <Field label="Department / Team" innerRef={deptDropdownRef}>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="e.g. IT / Engineering"
                autoComplete="off"
                value={applicationDetails.basic.department || ""}
                onChange={(e) => {
                  handleChangeBasic("department", e.target.value);
                  setIsDeptDropdownOpen(true);
                }}
                onFocus={() => setIsDeptDropdownOpen(true)}
                className={`${fieldBase} pr-10`}
              />
              <button
                type="button"
                aria-label="Toggle department list"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
              >
                <Chevron open={isDeptDropdownOpen} />
              </button>

              {isDeptDropdownOpen && uniquePositions.length > 0 && (
                <div className="absolute z-20 mt-1.5 max-h-48 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
                  {uniquePositions
                    .filter((pos) =>
                      pos.toLowerCase().includes(applicationDetails.basic.department?.toLowerCase() || "")
                    )
                    .map((pos) => {
                      const isSelected = pos === applicationDetails.basic.department;
                      return (
                        <div
                          key={pos}
                          className={`flex cursor-pointer items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-indigo-50 hover:text-indigo-600 ${
                            isSelected ? "bg-indigo-50 font-medium text-indigo-600" : "text-gray-700"
                          }`}
                          onClick={() => {
                            handleChangeBasic("department", pos);
                            setIsDeptDropdownOpen(false);
                          }}
                        >
                          <span className="truncate">{pos}</span>
                          {isSelected && <CheckIcon />}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </Field>

          <InputWithLabel
            inputWidthClass="md:w-full"
            label="Job Location"
            placeholder="e.g. Mumbai, India"
            value={applicationDetails.basic.jobLocation}
            onChange={(value) => handleChangeBasic("jobLocation", value)}
          />
        </Section>

        {/* ---------- Work setup ---------- */}
        <Section title="Work setup" description="How the work is done and the experience you expect.">
          {/* Job Type */}
          <Field label="Job Type">
            <select
              value={
                ["Remote", "Office"].includes(applicationDetails.basic.jobType)
                  ? applicationDetails.basic.jobType
                  : applicationDetails.basic.jobType
                  ? "Others"
                  : ""
              }
              onChange={(e) => {
                const val = e.target.value;
                handleChangeBasic("jobType", val === "Others" ? "" : val);
              }}
              className={`${fieldBase} cursor-pointer`}
            >
              <option value="">Select Job Type</option>
              <option value="Remote">Remote</option>
              <option value="Office">Office</option>
              <option value="Others">Others</option>
            </select>

            {/* Conditional Input for Job Type */}
            {(!["Remote", "Office"].includes(applicationDetails.basic.jobType) &&
              applicationDetails.basic.jobType !== "") ||
            (applicationDetails.basic.jobType === "" &&
              !["Remote", "Office"].includes(applicationDetails.basic.jobType)) ? (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Specify Job Type"
                  value={
                    ["Remote", "Office"].includes(applicationDetails.basic.jobType)
                      ? ""
                      : applicationDetails.basic.jobType
                  }
                  onChange={(e) => handleChangeBasic("jobType", e.target.value)}
                  className={fieldBase}
                />
              </div>
            ) : null}
          </Field>

          {/* Experience Required */}
          <Field label="Experience Required" hint="(Optional)">
            <select
              value={
                ["Fresher", "1 year", "2+ year"].includes(
                  applicationDetails.basic.experience
                )
                  ? applicationDetails.basic.experience
                  : applicationDetails.basic.experience
                  ? "Others"
                  : ""
              }
              onChange={(e) => {
                const val = e.target.value;
                handleChangeBasic("experience", val === "Others" ? "" : val);
              }}
              className={`${fieldBase} cursor-pointer`}
            >
              <option value="">Select Experience</option>
              <option value="Fresher">Fresher</option>
              <option value="1 year">1 year</option>
              <option value="2+ year">2+ year</option>
              <option value="Others">Others</option>
            </select>

            {/* Conditional Input for Experience */}
            {(!["Fresher", "1 year", "2+ year"].includes(
              applicationDetails.basic.experience
            ) &&
              applicationDetails.basic.experience !== "") ||
            (applicationDetails.basic.experience === "" &&
              !["Fresher", "1 year", "2+ year"].includes(
                applicationDetails.basic.experience
              )) ? (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Specify Experience"
                  value={
                    ["Fresher", "1 year", "2+ year"].includes(
                      applicationDetails.basic.experience
                    )
                      ? ""
                      : applicationDetails.basic.experience
                  }
                  onChange={(e) => handleChangeBasic("experience", e.target.value)}
                  className={fieldBase}
                />
              </div>
            ) : null}
          </Field>
        </Section>

        {/* ---------- Hiring ---------- */}
        <Section title="Hiring" description="Who owns this hire and how many people you need.">
          {/* Hiring Manager Multi-Select */}
          <Field label="Hiring Manager(s)" className="md:col-span-2" innerRef={dropdownRef}>
            <div className="relative w-full">
              <div
                role="button"
                tabIndex={0}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                className={`${fieldBase} flex min-h-[44px] cursor-pointer items-center justify-between gap-2 ${
                  isDropdownOpen ? "border-indigo-500 ring-2 ring-indigo-500/20" : ""
                }`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onKeyDown={(e) => {
                  if (e.target !== e.currentTarget) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsDropdownOpen(!isDropdownOpen);
                  }
                }}
              >
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                  {currentHiringManagers.length > 0 ? (
                    currentHiringManagers.map((hm) => (
                      <span
                        key={hm.userId}
                        className="inline-flex max-w-full items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 py-0.5 pl-2.5 pr-1 text-xs font-medium text-indigo-700"
                      >
                        <span className="truncate">{hm.name}</span>
                        <button
                          type="button"
                          aria-label={`Remove ${hm.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const updated = currentHiringManagers.filter(
                              (item) => item.userId !== hm.userId
                            );
                            setApplicationDetails((prev) => ({
                              ...prev,
                              basic: {
                                ...prev.basic,
                                hiringManagers: updated,
                                hiringManager: updated.length > 0 ? updated[0].name : "",
                                hiringManagerId: updated.length > 0 ? updated[0].userId : "",
                                hiringManagerOnModel: updated.length > 0 ? updated[0].onModel : "",
                              },
                            }));
                          }}
                          className="flex h-4 w-4 items-center justify-center rounded-full text-indigo-500 transition-colors hover:bg-indigo-100 hover:text-indigo-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                        >
                          <CloseIcon />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">Select Hiring Manager(s)</span>
                  )}
                </div>
                <Chevron open={isDropdownOpen} />
              </div>

              {isDropdownOpen && (
                <div className="absolute z-20 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
                  {availableManagers.map((m) => {
                    const isChecked =
                      currentHiringManagers.some((hm) => hm.userId === m._id) ||
                      (!currentHiringManagers.length &&
                        applicationDetails.basic.hiringManagerId === m._id);

                    return (
                      <label
                        key={m._id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                          isChecked ? "bg-indigo-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            let newHMs;
                            if (e.target.checked) {
                              newHMs = [
                                ...currentHiringManagers,
                                { name: m.name, userId: m._id, onModel: m.onModel },
                              ];
                            } else {
                              newHMs = currentHiringManagers.filter(
                                (hm) => hm.userId !== m._id
                              );
                            }
                            setApplicationDetails((prev) => ({
                              ...prev,
                              basic: {
                                ...prev.basic,
                                hiringManagers: newHMs,
                                hiringManager: newHMs.length > 0 ? newHMs[0].name : "",
                                hiringManagerId: newHMs.length > 0 ? newHMs[0].userId : "",
                                hiringManagerOnModel: newHMs.length > 0 ? newHMs[0].onModel : "",
                              },
                            }));
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                          {initialsOf(m.name)}
                        </span>
                        <span className="truncate text-sm font-medium text-gray-700">{m.name}</span>
                      </label>
                    );
                  })}
                  {availableManagers.length === 0 && (
                    <div className="p-3 text-center text-sm italic text-gray-400">
                      No hiring managers available
                    </div>
                  )}
                </div>
              )}
            </div>
          </Field>

          {/* Number of Openings */}
          <InputWithLabel
            inputWidthClass="md:w-full"
            label="Number Of Openings"
            type="number"
            placeholder="e.g. 5"
            value={applicationDetails.basic.numberOfOpenings}
            onChange={(value) => handleChangeBasic("numberOfOpenings", value)}
          />
        </Section>

        {/* ---------- Timeline ---------- */}
        <Section title="Timeline" description="When the posting went up and when applications close.">
          {/* Closing Date */}
          <InputWithLabel
            inputWidthClass="md:w-full"
            label="Closing Date"
            type="date"
            min={today}
            value={applicationDetails.basic.closingDate}
            onChange={(value) => handleChangeBasic("closingDate", value)}
          />

          {/* Posted On */}
          <InputWithLabel
            inputWidthClass="md:w-full"
            label="Posted On"
            type="date"
            value={applicationDetails.basic.postedOn}
            disabled
          />
        </Section>
      </div>
    </div>
  );
};

export default BasicJobDetails;