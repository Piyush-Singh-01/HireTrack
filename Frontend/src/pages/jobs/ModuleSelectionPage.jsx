import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApplicationModules } from "../../utils/AppModulesContext";
import { MdLocationOn } from "react-icons/md";
import { FileUser } from "lucide-react";

const CheckIcon = () => (
  <svg
    className="h-3.5 w-3.5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    className="h-3.5 w-3.5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
      d="M12 5v14M5 12h14"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 12h14m0 0l-5-5m5 5l-5 5"
    />
  </svg>
);

const sectionMeta = [
  {
    no: 1,
    label: "01",
    title: "Basic information",
    description: "Essential candidate details",
  },
  {
    no: 2,
    label: "02",
    title: "Candidate profile",
    description: "Experience, skills, and supporting files",
  },
  {
    no: 3,
    label: "03",
    title: "Screening",
    description: "Additional questions for applicants",
  },
];

const ModuleGroup = ({ label, title, description, children }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">
        {label}
      </span>
      <div className="min-w-0">
        <h3 className="font-semibold leading-tight text-gray-900">{title}</h3>
        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{description}</p>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  </section>
);

/**
 * ModuleSelectionPage
 * Page for selecting active sections for the job application form (/selectionModule).
 * Recruiters can toggle Personal Info (required), Education, Experience, Skills, Attachments, and Screening.
 */
const ModuleSelectionPage = () => {
  const location = useLocation();
  const jobDetails = location.state?.jobDetails || {};
  const navigate = useNavigate();

  const { selectedModules, setAllModules, resetFormData } =
    useApplicationModules();
  const [tempSelection, setTempSelection] = useState(selectedModules);

  useEffect(() => {
    document.title = "Select Application Modules | Talent OS";
  }, []);

  const modules = [
    {
      id: "personal",
      name: "Personal Information",
      required: true,
      section: 1,
    },
    {
      id: "education",
      name: "Education",
      required: false,
      section: 1,
    },
    {
      id: "experience",
      name: "Experience",
      required: false,
      section: 2,
    },
    {
      id: "skills",
      name: "Skills",
      required: false,
      section: 2,
    },
    {
      id: "attachments",
      name: "Attachments",
      required: false,
      section: 2,
    },
    {
      id: "screening",
      name: "Screening Questions",
      required: false,
      section: 3,
    },
  ];

  const handleToggle = (moduleId) => {
    if (moduleId === "personal") return;
    setTempSelection((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleContinue = () => {
    setAllModules(tempSelection);
    navigate("/mainApp", { state: { jobDetails } });
  };

  useEffect(() => {
    const currentJobId = jobDetails?._id || null;
    if (!currentJobId) return;
    const cachedJobId = localStorage.getItem("activeJobId");
    if (currentJobId !== cachedJobId) {
      resetFormData();
      localStorage.setItem("activeJobId", currentJobId);
    }
  }, [jobDetails?._id, resetFormData]);

  useEffect(() => {
    setTempSelection(selectedModules);
  }, [selectedModules]);

  const groupedModules = {
    1: modules.filter((m) => m.section === 1),
    2: modules.filter((m) => m.section === 2),
    3: modules.filter((m) => m.section === 3),
  };

  const selectedCount = modules.filter(
    (m) => m.required || tempSelection[m.id]
  ).length;

  const renderModuleCard = (module) => {
    const isSelected = Boolean(module.required || tempSelection[module.id]);

    return (
      <button
        key={module.id}
        type="button"
        aria-pressed={Boolean(tempSelection[module.id] || module.required)}
        aria-disabled={module.required}
        onClick={() => !module.required && handleToggle(module.id)}
        className={`group flex min-h-[68px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
          isSelected
            ? "border-indigo-500 bg-indigo-50 shadow-sm"
            : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50"
        } ${module.required ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            isSelected
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-gray-300 bg-white text-gray-400 group-hover:border-indigo-400 group-hover:text-indigo-500"
          }`}
          aria-hidden="true"
        >
          {isSelected ? <CheckIcon /> : <PlusIcon />}
        </span>

        <span
          className={`min-w-0 flex-1 text-sm font-semibold sm:text-base ${
            isSelected ? "text-indigo-950" : "text-gray-800"
          }`}
        >
          {module.name}
        </span>

        <span
          className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isSelected
              ? "bg-indigo-100 text-indigo-700"
              : "bg-gray-100 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
          }`}
        >
          {module.required ? "Required" : isSelected ? "Selected" : "Optional"}
        </span>
      </button>
    );
  };

  return (
    <main className="min-h-screen w-full bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page heading */}
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <FileUser className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
              Application Setup
            </h1>
            <p className="text-xs text-gray-500 sm:text-sm">
              Customize the sections candidates will complete.
            </p>
          </div>
        </div>

        {/* Job details summary */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 bg-indigo-50/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="min-w-0">
              <p className="mb-1 text-xs font-medium text-indigo-600">
                Job details
              </p>
              <h2 className="text-xl font-bold leading-snug text-gray-900 sm:text-2xl">
                {jobDetails.jobTitle || "Junior Frontend Developer"}
              </h2>
            </div>
            <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700">
              <MdLocationOn className="shrink-0 text-base text-gray-500" />
              {jobDetails.jobLocation || "Chennai"}
            </span>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_2fr] sm:gap-8 sm:p-7">
            <div>
              <p className="text-xs font-medium text-gray-500">
                Experience required
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {jobDetails.experience || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">
                Job description
              </p>
              <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-600">
                {jobDetails.about ||
                  jobDetails.description ||
                  "No description provided."}
              </p>
            </div>
          </div>
        </section>

        {/* Module selection */}
        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                Build your application form
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                Select the sections you want candidates to complete. Personal
                Information is required; the other sections are optional.
              </p>
            </div>
            <div className="w-fit shrink-0 rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700">
              {selectedCount} of {modules.length} sections selected
            </div>
          </div>

          <div className="space-y-5">
            {sectionMeta.map(({ no, label, title, description }) => (
              <ModuleGroup
                key={no}
                label={label}
                title={title}
                description={description}
              >
                {groupedModules[no].map((module) => renderModuleCard(module))}
              </ModuleGroup>
            ))}
          </div>

          {/* Navigation actions */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center cursor-pointer rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
              onClick={() =>
                navigate("/jobapplication", { state: { step: 3 } })
              }
            >
              Back
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 cursor-pointer rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
              onClick={handleContinue}
            >
              Save and Continue
              <ArrowIcon />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ModuleSelectionPage;
