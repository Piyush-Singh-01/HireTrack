import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TbArrowBack } from "react-icons/tb";
import { IoIosCheckmarkCircleOutline, IoMdClose } from "react-icons/io";
import { useNavigate, useLocation, useBlocker } from "react-router-dom";
import { useSelector } from "react-redux";

import BasicJobDetails from "../../component/jobPost/ReuseTemplate/BasicJobDetails";
import JobDescription from "../../component/jobPost/ReuseTemplate/JobDescription";
import AdditionalInfo from "../../component/jobPost/ReuseTemplate/AdditionalInfo";
import SaveDraftPopUp from "../../component/jobPost/ReuseTemplate/SaveDraftPopUp";
import { useJobpost } from "../../hooks/useJobpost";
import axiosInstance from "../../utils/AxiosInstance";
import { useToast } from "../../utils/ToastContext";
import useForm from "../../hooks/useForm";
import ApiRoutes from "../../utils/ApiRoutes";

const today = new Date().toISOString().split("T")[0];

const applicationTabs = [
  { id: 1, value: "basic" },
  { id: 2, value: "description" },
  { id: 3, value: "additionalInfo" },
];

const stepWidths = {
  1: "w-1/3",
  2: "w-2/3",
  3: "w-full",
};

const stepLabels = {
  1: "Basic details",
  2: "Job description",
  3: "Additional info",
};

const Stepper = ({ current }) => (
  <ol className="flex items-center gap-2 lg:gap-3">
    {applicationTabs.map(({ id }, index) => {
      const isDone = id < current;
      const isCurrent = id === current;
      return (
        <li
          key={id}
          className="flex items-center gap-2 lg:gap-3"
          aria-current={isCurrent ? "step" : undefined}
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200 ${
              isDone
                ? "bg-indigo-600 text-white"
                : isCurrent
                ? "border-2 border-indigo-600 bg-white text-indigo-600"
                : "border border-gray-300 bg-white text-gray-400"
            }`}
          >
            {isDone ? (
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
            ) : (
              id
            )}
          </span>
          <span
            className={`text-sm ${
              isCurrent
                ? "font-semibold text-gray-900"
                : isDone
                ? "font-medium text-gray-700"
                : "text-gray-400"
            }`}
          >
            {stepLabels[id]}
          </span>
          {index < applicationTabs.length - 1 && (
            <span
              aria-hidden="true"
              className={`ml-1 h-px w-6 lg:w-10 transition-colors duration-200 ${
                isDone ? "bg-indigo-600" : "bg-gray-300"
              }`}
            />
          )}
        </li>
      );
    })}
  </ol>
);

const Spinner = () => (
  <svg
    className="h-4 w-4 animate-spin"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-90"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

const initialData = {
  basic: {
    jobTitle: "",
    jobRole: "",
    department: "",
    jobLocation: "",
    jobType: "",
    experience: "",
    jobCode: "",
    hiringManager: "",
    hiringManagerId: "",
    numberOfOpenings: "",
    jobStatus: "Open",
    closingDate: "",
    postedOn: today,
    applicantsCount: "",
  },
  description: {
    about: "",
    responsibilities: "",
    requirements: "",
    preferredQualifications: "",
    lookingFor: "",
  },
  Questions: {
    questions: "",
    rounds: "",
    round1: "",
    round2: "",
  },
  additionalInfo: {
    applicationLink: "",
    companyInfo: "",
    posterVisuals: [],
  },
  formId: null,
  screeningId: null,
  templateFormFields: null,
  isTemplateApplied: false,
};

/**
 * JobApplicationPage
 * Wizard controller for creating or editing job descriptions/templates across 3 steps:
 * 1. Basic details (title, department, role, location, openings, dates)
 * 2. Job description (about, responsibilities, requirements, qualifications)
 * 3. Additional info (application links, attachments/posters, summary)
 */
const JobApplicationPage = () => {
  const [stepId, setStepId] = useState(1);
  const jobPost = useSelector((state) => state.jobPost) || {};
  const { isNewTemplate, template } = jobPost;

  const [applicationDetails, setApplicationDetails] = useState(() => {
    const cached = localStorage.getItem("jobApplicationDraft");
    if (cached) {
      try {
        return { ...initialData, ...JSON.parse(cached) };
      } catch {
        return initialData;
      }
    }
    return initialData;
  });

  const { createJob, updatejobdraft, updatejobpost } = useJobpost();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const location = useLocation();
  const { createForm } = useForm();
  const authUser = useSelector((state) => state.auth.user);
  const userId = useSelector((state) => state.auth.userId) || authUser?.id;
  const authRole = useSelector((state) => state.auth.role) || authUser?.role;

  const [isDirty, setIsDirty] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = isNewTemplate
      ? "Create Job Description | Talent OS"
      : "Edit Job Application | Talent OS";
  }, [isNewTemplate]);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (!isDirty || isSubmitting) return false;

    const internalPaths = [
      "/selectionModule",
      "/screening",
      "/screeningPerModule",
      "/mainApp",
      "/applicationLink",
      "/applicationLinkPage2",
    ];

    const isInternal = internalPaths.some((path) =>
      nextLocation.pathname.startsWith(path)
    );
    const isSamePath = currentLocation.pathname === nextLocation.pathname;
    const isJobDetails = nextLocation.pathname.startsWith("/jobdetails");

    return !isSamePath && !isInternal && !isJobDetails;
  });

  useEffect(() => {
    if (isDirty) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = "";
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () =>
        window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [isDirty]);

  const validateStep1 = (data = applicationDetails) => {
    const { basic } = data;
    const missing = [];
    if (!basic.jobTitle) missing.push("Job Title");
    if (!basic.jobRole) missing.push("Job Role");
    if (!basic.department) missing.push("Department");
    if (!basic.jobLocation) missing.push("Job Location");
    if (!basic.jobType) missing.push("Job Type");
    if (!basic.experience) missing.push("Experience");
    if (!basic.numberOfOpenings) missing.push("Number Of Openings");
    if (!basic.closingDate) missing.push("Closing Date");

    if (missing.length > 0) {
      showToast(`Step 1 missing: ${missing.join(", ")}`, "error");
      return false;
    }
    return true;
  };

  const validateStep2 = (data = applicationDetails) => {
    const { description } = data;
    const missing = [];
    if (!description.about) missing.push("About");
    if (!description.responsibilities) missing.push("Responsibilities");
    if (!description.requirements) missing.push("Requirements");
    if (!description.preferredQualifications)
      missing.push("Preferred Qualifications");
    if (!description.lookingFor) missing.push("What We're Looking For");

    if (missing.length > 0) {
      showToast(`Step 2 missing: ${missing.join(", ")}`, "error");
      return false;
    }
    return true;
  };

  const validateStep3 = (data = applicationDetails) => {
    const { additionalInfo } = data;
    if (!additionalInfo.applicationLink) {
      showToast("Step 3 missing: Application Link", "error");
      return false;
    }
    return true;
  };

  const handleUpdate = async (
    skipNavigate = false,
    isDraft = false,
    detailsOverride = null
  ) => {
    const details = detailsOverride || applicationDetails;
    const finalIsDraft = isDraft;

    if (!skipNavigate) {
      if (
        !validateStep1(details) ||
        !validateStep2(details) ||
        !validateStep3(details)
      )
        return;
    }

    const payload = {
      isDraft: finalIsDraft,
      jobTitle: details.basic.jobTitle,
      jobRole: details.basic.jobRole,
      department: details.basic.department,
      jobLocation: details.basic.jobLocation,
      jobType: details.basic.jobType,
      experience: details.basic.experience,
      hiringManager: {
        name: details.basic.hiringManager,
        userId: details.basic.hiringManagerId || userId,
        onModel:
          details.basic.hiringManagerOnModel ||
          (authRole === "SuperAdmin" ? "User" : "UserAndRole"),
      },
      numberOfOpenings: Number(details.basic.numberOfOpenings),
      jobStatus: details.basic.jobStatus || "Open",
      closingDate: details.basic.closingDate,
      applicantsCount: Number(details.basic.applicantsCount || 0),
      postedOn: details.basic.postedOn || today,
      about: details.description.about,
      responsibilities: details.description.responsibilities,
      requirements: details.description.requirements,
      preferredQualifications: details.description.preferredQualifications,
      lookingFor: details.description.lookingFor,
      applicationLink: details.additionalInfo.applicationLink,
      posterVisuals: details.additionalInfo.posterVisuals || [],
      formId: details.formId,
      screeningId: details.screeningId,
    };

    const cachedJobId = localStorage.getItem("jobDraftId");
    const extractJob = (res) => {
      if (res?.success && res?.data) return res.data;
      return res?.data?.data || res?.data || res;
    };

    const ensureFormId = async (jobId, currentFormId, initialFields = null) => {
      if (currentFormId) return currentFormId;
      try {
        const fallbackId = `f-${crypto.randomUUID()}`;
        const formPayload = {
          jobId,
          title: `Application Form for ${details.basic.jobTitle || "Job"}`,
          description: "Please fill out the following details.",
          fields: initialFields || [
            {
              fieldId: fallbackId,
              label: "Full Name",
              type: "text",
              required: true,
              placeholder: "Full name",
              meta: { module: "personalInfo", isScreening: false },
            },
          ],
        };
        const formResponse = await createForm(formPayload);
        const createdForm = formResponse?.data;
        return createdForm?._id || null;
      } catch (err) {
        const message = err?.response?.data?.message || err.message || "";
        if (message.includes("Active form already exists")) {
          try {
            const existing = await axiosInstance.get(
              ApiRoutes.FORM.GET_ALL_FORM,
              {
                params: { jobId },
              }
            );
            const forms = existing?.data?.data || [];
            const activeForm = forms.find((f) => f.isActive) || forms[0];
            return activeForm?._id || null;
          } catch (fetchErr) {
            console.error("Failed to fetch existing form:", fetchErr);
          }
        }
        throw err;
      }
    };

    try {
      setIsSubmitting(true);
      let jobId = cachedJobId;
      let jobFromCreate = null;

      if (!jobId) {
        const created = await new Promise((resolve, reject) => {
          createJob.mutate(
            { ...payload, isDraft: true },
            {
              onSuccess: resolve,
              onError: reject,
            }
          );
        });
        jobFromCreate = extractJob(created);
        jobId = jobFromCreate?._id;
        if (jobId) {
          localStorage.setItem("jobDraftId", jobId);
        }
      }

      if (!jobId) {
        showToast("Failed to create draft job", "error");
        return;
      }

      let formId = jobFromCreate?.formId || details.formId;
      if (!formId) {
        formId = await ensureFormId(jobId, formId, details.templateFormFields);
      }

      const updatedData = {
        ...payload,
        ...(formId ? { formId } : {}),
      };

      const updated = await new Promise((resolve, reject) => {
        const updater = finalIsDraft ? updatejobdraft : updatejobpost;
        updater.mutate(
          { jobId, updatedData },
          { onSuccess: resolve, onError: reject }
        );
      });

      const finalJob = extractJob(updated) || { _id: jobId, ...updatedData };
      const finalLink =
        finalJob?.applicationLink || updatedData.applicationLink;
      if (finalLink) {
        const cachedDraft = localStorage.getItem("jobApplicationDraft");
        if (cachedDraft) {
          try {
            const parsed = JSON.parse(cachedDraft);
            const nextDraft = {
              ...parsed,
              isDraft: finalIsDraft,
              additionalInfo: {
                ...parsed.additionalInfo,
                applicationLink: finalLink,
              },
            };
            localStorage.setItem(
              "jobApplicationDraft",
              JSON.stringify(nextDraft)
            );
          } catch {
            // ignore cache parse errors
          }
        }
      }

      if (!skipNavigate) {
        localStorage.removeItem("jobApplicationDraft");
        localStorage.removeItem("jobDraftId");
        setIsDirty(false);
        showToast(
          finalIsDraft
            ? "Draft saved successfully!"
            : "Job posted successfully!",
          "success"
        );
        navigate(finalIsDraft ? "/drafts" : "/positions");
      } else if (finalIsDraft) {
        setApplicationDetails((prev) => ({
          ...prev,
          isDraft: true,
        }));
      }
      return finalJob;
    } catch (err) {
      console.error("Error creating job:", err);
      const errMsg = err?.response?.data?.message || err.message;
      showToast(`Error creating job: ${errMsg}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const hasGeneratedLink = Boolean(location.state?.generatedLink);
    const cachedDraft = localStorage.getItem("jobApplicationDraft");

    if (isNewTemplate && !hasGeneratedLink && !cachedDraft) {
      localStorage.removeItem("jobApplicationDraft");
      localStorage.removeItem("jobDraftId");
      setApplicationDetails({ ...initialData, isTemplateApplied: false });
      return;
    }

    if (!template || applicationDetails.isTemplateApplied) {
      return;
    }

    const templateData = {
      ...initialData,
      basic: {
        ...initialData.basic,
        jobTitle: template.jobTitle,
        jobRole: template.jobRole,
        department: template.department,
        jobLocation: template.jobLocation,
        jobType: template.jobType,
        experience: template.experience,
        hiringManager:
          template.hiringManager?.name || template.hiringManager || "",
        hiringManagerId: template.hiringManager?.userId || "",
        numberOfOpenings: template.numberOfOpenings
          ? String(template.numberOfOpenings)
          : "",
        jobStatus: template.jobStatus || "Open",
        closingDate: "",
        postedOn: today,
        applicantsCount: template.applicantsCount,
      },
      description: {
        ...initialData.description,
        about: template.about,
        responsibilities: template.responsibilities,
        requirements: template.requirements,
        preferredQualifications: template.preferredQualifications,
        lookingFor: template.lookingFor,
      },
      additionalInfo: {
        applicationLink: "",
        posterVisuals: template.posterVisuals || [],
      },
      formId: null,
      screeningId: null,
      templateFormFields: template.formId?.fields || null,
      isTemplateApplied: true,
    };

    localStorage.setItem("jobApplicationDraft", JSON.stringify(templateData));
    setApplicationDetails(templateData);
  }, [
    isNewTemplate,
    template,
    location.state?.generatedLink,
    applicationDetails.isTemplateApplied,
  ]);

  useEffect(() => {
    if (location.state?.step) {
      setStepId(location.state.step);
    }
  }, [location.state?.step]);

  useEffect(() => {
    const generatedLink = location.state?.generatedLink;
    if (generatedLink) {
      setApplicationDetails((prev) => ({
        ...prev,
        additionalInfo: {
          ...prev.additionalInfo,
          applicationLink: generatedLink,
        },
      }));
      setStepId(3);
    }
  }, [location.state?.generatedLink]);

  useEffect(() => {
    const hasContent =
      applicationDetails.basic.jobTitle ||
      applicationDetails.basic.jobRole ||
      applicationDetails.basic.department ||
      applicationDetails.basic.jobLocation ||
      applicationDetails.basic.jobType ||
      applicationDetails.basic.experience ||
      applicationDetails.basic.hiringManager ||
      applicationDetails.basic.numberOfOpenings ||
      applicationDetails.basic.jobStatus ||
      applicationDetails.basic.closingDate ||
      applicationDetails.description.about ||
      applicationDetails.description.responsibilities ||
      applicationDetails.description.requirements ||
      applicationDetails.description.preferredQualifications ||
      applicationDetails.description.lookingFor ||
      applicationDetails.additionalInfo.companyInfo ||
      applicationDetails.additionalInfo.applicationLink ||
      (applicationDetails.additionalInfo.posterVisuals || []).length > 0;

    if (hasContent) {
      localStorage.setItem(
        "jobApplicationDraft",
        JSON.stringify(applicationDetails)
      );
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [applicationDetails]);

  const applicationDetail = useMemo(
    () => applicationTabs.find((detail) => detail.id === stepId),
    [stepId]
  );

  const handleClickPrev = useCallback(
    () => setStepId((prev) => Math.max(prev - 1, 1)),
    []
  );

  const handleClickNext = useCallback(() => {
    if (stepId === 1) {
      if (!validateStep1(applicationDetails)) return;
    }
    if (stepId === 2) {
      if (!validateStep2(applicationDetails)) return;
    }
    setStepId((prev) => prev + 1);
  }, [stepId, applicationDetails]);

  const ApplicationFactory = useMemo(() => {
    const { value } = applicationDetail;

    switch (value) {
      case "basic":
        return (
          <BasicJobDetails
            applicationDetails={applicationDetails}
            setApplicationDetails={setApplicationDetails}
          />
        );
      case "description":
        return (
          <JobDescription
            applicationDetails={applicationDetails}
            setApplicationDetails={setApplicationDetails}
          />
        );
      case "additionalInfo":
        return (
          <AdditionalInfo
            applicationDetails={applicationDetails}
            setApplicationDetails={setApplicationDetails}
          />
        );
      default:
        return null;
    }
  }, [applicationDetail, applicationDetails]);

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header: title, stepper and progress bar */}
      <header className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-6">
          <div>
            <h1 className="text-xl font-bold text-[#120D1C] sm:text-2xl lg:text-3xl">
              New Job Application
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 md:hidden">
              {`Step ${stepId} of 3: ${stepLabels[stepId]}`}
            </p>
          </div>
          <nav aria-label="Progress" className="hidden md:block">
            <Stepper current={stepId} />
          </nav>
        </div>
        <div className="h-1 bg-gray-100">
          <div
            className={`h-1 rounded-r-full bg-indigo-600 transition-all duration-300 ${stepWidths[stepId]}`}
          />
        </div>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-7xl">{ApplicationFactory}</div>
        </div>
      </div>

      {/* Footer with buttons */}
      <footer className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-3">
          {/* Go Back */}
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 rounded-lg border cursor-pointer px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 md:text-base ${
              stepId === 3
                ? "border-red-300 text-red-600 hover:bg-red-50 focus-visible:ring-red-500/30"
                : "border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-indigo-500/30"
            }`}
            onClick={
              stepId === 3
                ? () => setStepId(1)
                : stepId === 1
                ? () => navigate("/drafts")
                : handleClickPrev
            }
          >
            {stepId === 3 ? (
              <>
                <IoMdClose className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <TbArrowBack className="h-4 w-4" />
                Go Back
              </>
            )}
          </button>

          {/* Save/Next */}
          <button
            type="button"
            className="inline-flex items-center cursor-pointer gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60 md:text-base"
            disabled={isSubmitting}
            onClick={() => {
              if (stepId === 3) {
                handleUpdate(false, false);
              } else {
                handleClickNext();
              }
            }}
          >
            {stepId === 3
              ? isSubmitting
                ? "Posting..."
                : "Save/Post"
              : "Save/Next"}
            {isSubmitting ? (
              <Spinner />
            ) : (
              <IoIosCheckmarkCircleOutline className="h-5 w-5" />
            )}
          </button>
        </div>
      </footer>

      <SaveDraftPopUp
        isOpen={blocker.state === "blocked"}
        isSaving={isSavingDraft}
        onClose={() => blocker.reset()}
        onSave={async () => {
          setIsSavingDraft(true);
          try {
            await handleUpdate(true, true, applicationDetails);
            setIsDirty(false);
            navigate("/drafts");
          } catch (err) {
            console.error("Save Draft Error:", err);
            setIsSavingDraft(false);
          }
        }}
        onDiscard={() => {
          localStorage.removeItem("jobApplicationDraft");
          localStorage.removeItem("jobDraftId");
          setIsDirty(false);
          if (blocker.state === "blocked") {
            blocker.proceed();
          }
        }}
      />
    </div>
  );
};

export default JobApplicationPage;
