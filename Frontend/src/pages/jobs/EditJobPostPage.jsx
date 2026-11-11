import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useJobpost } from "../../hooks/useJobpost.js";
import { useGetHiringManagers, useGetAllUsers } from "../../hooks/useUserAndRole.js";
import { axiosInstance } from "../../utils/AxiosInstance.js";
import { ApiRoutes } from "../../utils/ApiRoutes.js";
import Toast from "../../component/ui/Toast";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileText,
  MapPin,
  Save,
  Sparkles,
  Users,
  X,
} from "lucide-react";

/**
 * EditJobPostPage
 * Main page for editing an existing job posting.
 * Manages job details fetching, department/hiring manager dropdowns,
 * bullet point formatting, and saving updates to the backend.
 */
const EditJobPostPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const jobId = location.state?.jobId;

  const { updatejobpost } = useJobpost();
  const { data: hiringManagers = [] } = useGetHiringManagers();
  const { data: allUsers = [] } = useGetAllUsers();
  const uniquePositions = [...new Set(allUsers.map((u) => u.Position).filter(Boolean))];

  const [jobData, setJobData] = useState({
    jobTitle: "",
    jobRole: "",
    department: "",
    jobLocation: "",
    jobType: "",
    experience: "",
    hiringManager: "",
    hiringManagerId: "",
    hiringManagerOnModel: "",
    numberOfOpenings: "",
    jobStatus: "",
    closingDate: "",
    about: "",
    responsibilities: "",
    requirements: "",
    preferredQualifications: "",
    lookingFor: "",
    companyInfo: "",
    applicationLink: "",
    jobCode: "",
    isDraft: false,
    hiringManagers: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const deptDropdownRef = useRef(null);

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    document.title = "Edit Job Post | Talent OS";
  }, []);

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

  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message,
    });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const getUserId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user._id || user.id || null;
      }
      return null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  const fetchJobData = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(ApiRoutes.POSITION.JOBS.SCREEN(jobId));
      const jobDataFromApi = response.data.data;
      const job = jobDataFromApi?.job || jobDataFromApi;

      let hiringManagerName = "";
      if (job.hiringManager) {
        if (typeof job.hiringManager === "object") {
          hiringManagerName = job.hiringManager.name || "";
        } else {
          hiringManagerName = job.hiringManager;
        }
      }

      let initialHiringManagers = job.hiringManagers || [];
      if (
        initialHiringManagers.length === 0 &&
        job.hiringManager &&
        job.hiringManager.userId
      ) {
        initialHiringManagers = [
          {
            name: hiringManagerName,
            userId: job.hiringManager.userId,
            onModel: job.hiringManager.onModel,
          },
        ];
      }

      setJobData({
        jobTitle: job.jobTitle || "",
        jobRole: job.jobRole || "",
        department: job.department || "",
        jobLocation: job.jobLocation || "",
        jobType: job.jobType || "",
        experience: job.experience || "",
        hiringManager: hiringManagerName,
        hiringManagerId: job.hiringManager?.userId || "",
        hiringManagerOnModel: job.hiringManager?.onModel || "",
        numberOfOpenings:
          job.numberOfOpenings != null ? String(job.numberOfOpenings) : "",
        jobStatus: job.jobStatus || "",
        closingDate: job.closingDate
          ? new Date(job.closingDate).toISOString().split("T")[0]
          : "",
        about: job.about || "",
        responsibilities: job.responsibilities || "",
        requirements: job.requirements || "",
        preferredQualifications: job.preferredQualifications || "",
        lookingFor: job.lookingFor || "",
        applicationLink: job.applicationLink || "",
        isDraft: job.isDraft || false,
        hiringManagers: initialHiringManagers,
      });
    } catch (error) {
      console.error("Error fetching job data:", error);
      showToast(
        "error",
        `Failed to load job data: ${error.response?.data?.message || error.message}`
      );
      navigate("/positions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!jobId) {
      showToast("error", "No job ID provided");
      navigate("/positions");
      return;
    }
    fetchJobData();
  }, [jobId]);

  const handleInputChange = (e) => {
    const { name, value, selectionStart } = e.target;
    let normalizedValue =
      name === "numberOfOpenings" ? value.replace(/\D/g, "") : value;

    // Auto-bullet logic: replace ". " with ".\n• " for multiline fields
    const bulletFields = [
      "about",
      "responsibilities",
      "requirements",
      "preferredQualifications",
      "lookingFor",
      "companyInfo",
    ];

    if (bulletFields.includes(name) && selectionStart > 1) {
      const lastTwo = normalizedValue.substring(
        selectionStart - 2,
        selectionStart
      );
      if (lastTwo === ". ") {
        const lastFive = normalizedValue
          .substring(Math.max(0, selectionStart - 5), selectionStart)
          .toLowerCase();
        if (lastFive !== "e.g. " && lastFive !== "i.e. ") {
          const before = normalizedValue.substring(0, selectionStart - 1);
          const after = normalizedValue.substring(selectionStart);
          normalizedValue = before + "\n• " + after;

          setTimeout(() => {
            const target = e.target;
            if (target) {
              const newPos = selectionStart + 2;
              target.setSelectionRange(newPos, newPos);
            }
          }, 0);
        }
      }
    }

    setJobData((prev) => ({
      ...prev,
      [name]: normalizedValue,
    }));
  };

  const handleSaveChanges = async () => {
    if (!jobData.jobTitle || !jobData.jobRole) {
      showToast("error", "Please fill in required fields (Job Title and Role)");
      return;
    }

    const userId = getUserId();
    let userRole = null;
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        userRole = user.role || user.Role || null;
      }
    } catch (e) {
      console.error(e);
    }

    const { jobCode, companyInfo, ...restData } = jobData;
    const preparedData = {
      ...restData,
      hiringManager: {
        name: jobData.hiringManager,
        userId: jobData.hiringManagerId || userId,
        onModel:
          jobData.hiringManagerOnModel ||
          (userRole === "SuperAdmin" ? "User" : "UserAndRole"),
      },
      hiringManagers: jobData.hiringManagers || [],
      numberOfOpenings: jobData.numberOfOpenings
        ? Number(jobData.numberOfOpenings)
        : jobData.numberOfOpenings,
      isDraft: false,
    };

    const filteredData = Object.fromEntries(
      Object.entries(preparedData).filter(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          return Object.keys(value).length > 0;
        }
        return value !== "" && value !== null && value !== undefined;
      })
    );

    try {
      setIsSaving(true);
      await updatejobpost.mutateAsync({
        jobId,
        updatedData: filteredData,
      });

      showToast("success", "Job updated successfully!");
      setTimeout(() => {
        navigate("/positions");
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }, 1500);
    } catch (error) {
      console.error("Error updating job:", error);
      showToast(
        "error",
        `Failed to update job: ${
          error.response?.data?.message || error.message || "Please try again."
        }`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/positions");
  };

  const fieldClassName =
    "w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 hover:border-indigo-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10";
  const labelClassName =
    "mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-600";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white px-4">
        <div className="rounded-3xl border border-white bg-white/90 px-10 py-9 text-center shadow-xl shadow-indigo-100/60">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-200">
            <BriefcaseBusiness className="h-8 w-8 text-white" />
          </div>
          <div className="mx-auto mb-4 h-7 w-7 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-600" />
          <p className="text-base font-semibold text-slate-800">
            Loading job details
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Preparing your job post for editing...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white px-3 py-5 sm:px-5 md:px-7 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl">
          {/* Page header */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                Position management
              </div>
              <p className="text-sm text-slate-500">
                Jobs <span className="mx-2 text-slate-300">/</span>
                <span className="font-semibold text-slate-700">
                  Edit job post
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              aria-label="Close and return to positions"
              className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-md"
            >
              <X className="h-5 w-5 cursor-pointer transition-transform duration-200 group-hover:rotate-90" />
            </button>
          </div>

          {/* Main form */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {/* Basic information */}
              <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/40 sm:p-7">
                <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                      Basic Information
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      The core details candidates see first.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className={labelClassName}>
                      Job Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={jobData.jobTitle}
                      onChange={handleInputChange}
                      className={fieldClassName}
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>

                  <div>
                    <label className={labelClassName}>
                      Role <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="jobRole"
                      value={jobData.jobRole}
                      onChange={handleInputChange}
                      className={fieldClassName}
                      placeholder="e.g. Engineering"
                    />
                  </div>

                  <div className="relative" ref={deptDropdownRef}>
                    <label className={labelClassName}>Department</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="department"
                        autoComplete="off"
                        value={jobData.department}
                        onChange={(e) => {
                          handleInputChange(e);
                          setIsDeptDropdownOpen(true);
                        }}
                        onFocus={() => setIsDeptDropdownOpen(true)}
                        className={`${fieldClassName} pr-11`}
                        placeholder="e.g. Technology"
                      />
                      <button
                        type="button"
                        aria-label="Toggle department suggestions"
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={() =>
                          setIsDeptDropdownOpen(!isDeptDropdownOpen)
                        }
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isDeptDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                    {isDeptDropdownOpen && uniquePositions.length > 0 && (
                      <div className="absolute z-30 mt-2 max-h-52 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-200/70">
                        {uniquePositions
                          .filter((pos) =>
                            pos
                              .toLowerCase()
                              .includes(
                                jobData.department?.toLowerCase() || ""
                              )
                          )
                          .map((pos) => (
                            <div
                              key={pos}
                              className="cursor-pointer rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                              onClick={() => {
                                setJobData((prev) => ({
                                  ...prev,
                                  department: pos,
                                }));
                                setIsDeptDropdownOpen(false);
                              }}
                            >
                              {pos}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={labelClassName}>Location</label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        name="jobLocation"
                        value={jobData.jobLocation}
                        onChange={handleInputChange}
                        className={`${fieldClassName} pl-11`}
                        placeholder="e.g. New York, NY"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClassName}>Experience</label>
                    <input
                      type="text"
                      name="experience"
                      value={jobData.experience}
                      onChange={handleInputChange}
                      className={fieldClassName}
                      placeholder="e.g. 3-5 years"
                    />
                  </div>
                </div>
              </section>

              {/* Job details */}
              <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/40 sm:p-7">
                <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                      Job Details
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Assign the hiring team and manage the opening.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className={labelClassName}>Hiring Manager</label>
                    <div className="relative w-full" ref={dropdownRef}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-left text-sm text-slate-700 outline-none transition hover:border-indigo-200 hover:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Users className="h-4 w-4 shrink-0 text-slate-400" />
                          <span className="truncate">
                            {jobData.hiringManagers?.length > 0
                              ? jobData.hiringManagers
                                  .map((hm) => hm.name)
                                  .join(", ")
                              : "Select Hiring Manager"}
                          </span>
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                            isDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isDropdownOpen && (
                        <div className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/70">
                          <div className="mb-2 px-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Select hiring managers
                          </div>
                          {(() => {
                            const apiManagers = hiringManagers.filter(
                              (m) =>
                                m.role !== "SuperAdmin" && m.role !== "Admin"
                            );
                            const currentHMs = jobData.hiringManagers || [];

                            const combinedManagers = [...apiManagers];
                            currentHMs.forEach((hm) => {
                              if (
                                !combinedManagers.some(
                                  (m) => m._id === hm.userId
                                )
                              ) {
                                combinedManagers.unshift({
                                  _id: hm.userId,
                                  name: hm.name || hm.userId,
                                  onModel: hm.onModel || "User",
                                });
                              }
                            });

                            return combinedManagers.map((m) => {
                              const isChecked =
                                currentHMs.some(
                                  (hm) => hm.userId === m._id
                                ) ||
                                (!currentHMs.length &&
                                  jobData.hiringManagerId === m._id);
                              return (
                                <label
                                  key={m._id}
                                  className="mb-1 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-indigo-50"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      let newHMs;
                                      if (e.target.checked) {
                                        newHMs = [
                                          ...currentHMs,
                                          {
                                            name: m.name,
                                            userId: m._id,
                                            onModel: m.onModel,
                                          },
                                        ];
                                      } else {
                                        newHMs = currentHMs.filter(
                                          (hm) => hm.userId !== m._id
                                        );
                                      }
                                      setJobData((prev) => ({
                                        ...prev,
                                        hiringManagers: newHMs,
                                        hiringManager:
                                          newHMs.length > 0
                                            ? newHMs[0].name
                                            : "",
                                        hiringManagerId:
                                          newHMs.length > 0
                                            ? newHMs[0].userId
                                            : "",
                                        hiringManagerOnModel:
                                          newHMs.length > 0
                                            ? newHMs[0].onModel
                                            : "",
                                      }));
                                    }}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span className="text-sm font-medium text-slate-700">
                                    {m.name}
                                  </span>
                                </label>
                              );
                            });
                          })()}
                          {hiringManagers.filter(
                            (m) =>
                              m.role !== "SuperAdmin" && m.role !== "Admin"
                          ).length === 0 && (
                            <div className="px-3 py-4 text-center text-sm italic text-slate-500">
                              No hiring managers available
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      You can select more than one hiring manager.
                    </p>
                  </div>

                  <div>
                    <label className={labelClassName}>Number of Openings</label>
                    <div className="relative">
                      <Users className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        name="numberOfOpenings"
                        value={jobData.numberOfOpenings}
                        onChange={handleInputChange}
                        className={`${fieldClassName} pl-11`}
                        placeholder="e.g. 2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClassName}>Job Status</label>
                      <div className="relative">
                        <select
                          name="jobStatus"
                          value={jobData.jobStatus}
                          onChange={handleInputChange}
                          className={`${fieldClassName} appearance-none pr-10`}
                        >
                          <option value="">Select status</option>
                          <option value="Open">Open</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>

                    <div>
                      <label className={labelClassName}>Closing Date</label>
                      <div className="relative">
                        <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="date"
                          name="closingDate"
                          value={jobData.closingDate}
                          onChange={handleInputChange}
                          className={`${fieldClassName} pl-11`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Job description */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/40 sm:p-7">
              <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                      Role Description & Expectations
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Help candidates understand the opportunity and what success
                      looks like.
                    </p>
                  </div>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Clear details attract great candidates
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <label className={labelClassName}>About the Role</label>
                  <textarea
                    name="about"
                    value={jobData.about}
                    onChange={handleInputChange}
                    rows={4}
                    className={`${fieldClassName} min-h-[124px] resize-y leading-6`}
                    placeholder="Provide a brief overview of the role..."
                  />
                </div>

                <div>
                  <label className={labelClassName}>Responsibilities</label>
                  <textarea
                    name="responsibilities"
                    value={jobData.responsibilities}
                    onChange={handleInputChange}
                    rows={4}
                    className={`${fieldClassName} min-h-[150px] resize-y leading-6`}
                    placeholder="List the key responsibilities..."
                  />
                </div>

                <div>
                  <label className={labelClassName}>Requirements</label>
                  <textarea
                    name="requirements"
                    value={jobData.requirements}
                    onChange={handleInputChange}
                    rows={4}
                    className={`${fieldClassName} min-h-[150px] resize-y leading-6`}
                    placeholder="List the required qualifications..."
                  />
                </div>

                <div>
                  <label className={labelClassName}>
                    Preferred Qualifications
                  </label>
                  <textarea
                    name="preferredQualifications"
                    value={jobData.preferredQualifications}
                    onChange={handleInputChange}
                    rows={4}
                    className={`${fieldClassName} min-h-[150px] resize-y leading-6`}
                    placeholder="List preferred qualifications..."
                  />
                </div>

                <div>
                  <label className={labelClassName}>What We're Looking For</label>
                  <textarea
                    name="lookingFor"
                    value={jobData.lookingFor}
                    onChange={handleInputChange}
                    rows={4}
                    className={`${fieldClassName} min-h-[150px] resize-y leading-6`}
                    placeholder="Describe the ideal candidate..."
                  />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-xs leading-5 text-sky-800">
                <ClipboardList className="h-4 w-4 shrink-0" />
                Tip: After typing a sentence followed by a period and a space,
                the editor automatically starts a new bullet in these description
                fields.
              </div>
            </section>

            {/* Actions */}
            <div className="sticky bottom-3 z-20 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-xl shadow-slate-300/40 backdrop-blur-xl sm:flex-row sm:justify-end sm:p-4">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center justify-center cursor-pointer gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="inline-flex items-center justify-center cursor-pointer gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition duration-200 hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isSaving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
    </>
  );
};

export default EditJobPostPage;
