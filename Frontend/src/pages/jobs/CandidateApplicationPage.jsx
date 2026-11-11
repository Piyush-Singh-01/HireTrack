import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../utils/AxiosInstance";
import ApiRoutes from "../../utils/ApiRoutes";
import QuestionRenderer from "../../component/jobPost/Application/ui/QuestionRenderer";
import InputLabel from "../../component/jobPost/Application/ui/InputLabel";
import { useToast } from "../../utils/ToastContext";
import CandidateJobDetails from "../../component/jobPost/Application/CandidateJobDetails";
import { User, GraduationCap, Briefcase, FileText, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";

const emptyEducation = () => ({
  institution: "",
  degreeLevel: "",
  program: "",
  startDate: "",
  endDate: "",
  yearOfGraduation: "",
  gpaOrPercent: "",
  pursuing: false,
});

const emptyExperience = () => ({
  companyName: "",
  role: "",
  expStart: "",
  expEnd: "",
  responsibility: "",
  currentCTC: "",
  expectedCTC: "",
  noticePeriod: "",
});

const CandidateApplicationPage = ({ slug: propSlug, ...props }) => {
  const routeParams = useParams();
  const slug = propSlug || routeParams?.slug;
  const [step, setStep] = useState(0);
  const [job, setJob] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [screeningFields, setScreeningFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dynamicAnswers, setDynamicAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();
  const [personal, setPersonal] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    postalCode: "",
    state: "",
    country: "",
    email: "",
    contactNumber: "",
    gender: "",
    experienceLevel: "",
  });
  const [education, setEducation] = useState([emptyEducation()]);
  const [experience, setExperience] = useState([emptyExperience()]);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [referralSource, setReferralSource] = useState("");
  const [subscribe, setSubscribe] = useState("");
  const [consent, setConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);
  const [submitLocked, setSubmitLocked] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axiosInstance.get(`/api/jobs/slug/${slug}`);
        const data = res?.data?.data || null;
        if (!data?.formId) {
          setError("Application form not found for this job.");
          setJob(data || null);
          setFormFields([]);
          setScreeningFields([]);
          return;
        }
        setJob(data || null);
        if (data?.applicationSlug && slug !== data.applicationSlug) {
          window.history.replaceState(null, "", `/apply/${data.applicationSlug}`);
        }
        setFormFields(data?.formId?.fields || []);
        if (data?.screeningId) {
          try {
            const screeningRes = await axiosInstance.get(
              ApiRoutes.SCREENING.GET_BY_ID(data.screeningId)
            );
            const screeningData =
              screeningRes?.data?.data || screeningRes?.data;
            const normalizeType = (type) => {
              if (type === "multipleChoice") return "checkbox";
              if (type === "choice") return "radio";
              return type;
            };
            const normalizeOptions = (q) => {
              if (Array.isArray(q.options)) return q.options;
              if (Array.isArray(q.choices)) return q.choices;
              return [];
            };
            const mapped = (screeningData?.screen || []).map((q) => ({
              ...q,
              label: q.question,
              type: normalizeType(q.type),
              options: normalizeOptions(q),
              correctAnswer: q.correctAnswer,
            }));
            setScreeningFields(mapped);
          } catch (screenErr) {
            showToast("Failed to load screening questions", "error");
          }
        } else {
          setScreeningFields([]);
        }
      } catch (err) {
        const msg = err?.response?.data?.message || "Failed to load application";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchJob();
  }, [slug]);

  const isClosed = useMemo(() => {
    if (!job?.closingDate) return false;
    const closing = new Date(job.closingDate);
    closing.setHours(23, 59, 59, 999);
    return closing < new Date();
  }, [job]);

  const selectedModules = job?.formId?.selectedModules || {};
  const showEducation = selectedModules.education !== false;
  const showExperience = selectedModules.experience !== false;
  const showSkills = selectedModules.skills !== false;
  const showAttachments = selectedModules.attachments !== false;
  const showAddInfo = selectedModules.addInfo !== false;
  const screeningFromForm = (formFields || []).filter(
    (f) => f?.meta?.isScreening === true
  );
  const screeningStepFromForm = screeningFromForm.filter((f) => {
    const module = f?.module || f?.meta?.module || "screening";
    return module === "screening";
  });
  const showScreening =
    (screeningFields || []).length > 0 ||
      (screeningStepFromForm || []).length > 0
      ? selectedModules.screening !== false
      : false;
  const totalSteps = showScreening ? 4 : 3;
  const reviewStep = showScreening ? 4 : 3;

  const fieldsByModule = useMemo(() => {
    const groups = {
      personalInfo: [],
      education: [],
      experience: [],
      skills: [],
      attachments: [],
      addInfo: [],
      screening: [],
    };

    const allFormFields = formFields || [];
    const baseFormFields = allFormFields.filter(
      (f) => f?.meta?.isScreening !== true
    );
    const merged = [
      ...baseFormFields,
      ...screeningFromForm,
      ...(showScreening ? screeningFields || [] : []),
    ];
    const seen = new Set();
    const allFields = merged.filter((f, idx) => {
      const key = f?.fieldId || f?.id || `idx-${idx}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    allFields.forEach((field) => {
      const module = field?.module || field?.meta?.module || "screening";
      if (!groups[module]) groups[module] = [];
      groups[module].push(field);
    });

    return groups;
  }, [formFields, screeningFields, showScreening]);

  const handleDynamicAnswerChange = (fieldId, value) => {
    setDynamicAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const uploadFile = async (file, folder, slug) => {
    const formData = new FormData();
    formData.append("file", file);
    if (folder) {
      formData.append("folder", folder);
    }
    const res = await axiosInstance.post(ApiRoutes.UPLOADS.FILE(slug), formData, {
      headers: {},
      transformRequest: (data, headers) => {
        if (headers) {
          delete headers["Content-Type"];
          delete headers["content-type"];
        }
        return data;
      },
    });
    return res?.data?.file || res?.data?.data || res?.data;
  };

  const handleDynamicFileChange = async (fieldId, file) => {
    if (!file) return;
    try {
      setIsUploading(true);
      const uploaded = await uploadFile(file, "candidate_dynamic_fields", slug);
      setDynamicAnswers((prev) => ({
        ...prev,
        [fieldId]: uploaded,
      }));
    } catch (err) {
      showToast("Failed to upload file", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const allowMultipleEducation =
    job?.formId?.moduleConfig?.education?.allowMultipleEntries || false;
  const allowMultipleExperience =
    job?.formId?.moduleConfig?.experience?.allowMultipleEntries || false;

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value || skills.includes(value)) return;
    setSkills((prev) => [...prev, value]);
    setSkillInput("");
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.skills;
      return newErrors;
    });
  };

  const removeSkill = (value) =>
    setSkills((prev) => prev.filter((s) => s !== value));

  const handleAttachmentChange = async (files) => {
    setIsUploading(true);
    const newFiles = Array.from(files || []);
    const uploaded = [];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE) {
        showToast(`File "${file.name}" exceeds the maximum allowed size of 5MB`, "error");
        continue;
      }
      try {
        const result = await uploadFile(file, "candidate_attachments", slug);
        if (result) {
          uploaded.push(result);
          showToast(`File "${file.name}" uploaded successfully`, "success");
        }
      } catch (err) {
        const msg = err?.response?.data?.message || `Failed to upload ${file.name}`;
        showToast(msg, "error");
      }
    }
    setAttachments((prev) => [...prev, ...uploaded]);
    setIsUploading(false);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const buildAnswersPayload = () => {
    const sanitizedDynamic = Object.fromEntries(
      Object.entries(dynamicAnswers).map(([key, value]) => [key, value])
    );

    return {
      ...personal,
      education,
      experience,
      skills,
      attachments,
      referralSource,
      subscribe,
      consent,
      termsAccepted,
      ...sanitizedDynamic,
    };
  };

  const resetApplication = () => {
    setStep(1);
    setDynamicAnswers({});
    setErrors({});
    setPersonal({
      firstName: "",
      middleName: "",
      lastName: "",
      address1: "",
      address2: "",
      city: "",
      postalCode: "",
      state: "",
      country: "",
      email: "",
      contactNumber: "",
      gender: "",
      experienceLevel: "",
    });
    setEducation([emptyEducation()]);
    setExperience([emptyExperience()]);
    setSkills([]);
    setSkillInput("");
    setAttachments([]);
    setReferralSource("");
    setSubscribe("");
    setConsent(false);
    setTermsAccepted(false);
    setSubmitLocked(false);
    setShowSubmitSuccess(false);
  };

  const calculateScreeningScore = () => {
    const screeningQuestions = fieldsByModule.screening || [];

    let correctCount = 0;
    let scoredCount = 0;

    screeningQuestions.forEach((q) => {
      const answer = dynamicAnswers[q.fieldId];

      if (
        q.correctAnswer !== undefined &&
        q.correctAnswer !== null &&
        q.correctAnswer !== ""
      ) {
        scoredCount++;

        let isCorrect = false;

        if (q.type === "shortAnswer" || q.type === "short") {
          const answerText = String(answer || "").toLowerCase().trim();

          const keywords = Array.isArray(q.correctAnswer)
            ? q.correctAnswer
            : String(q.correctAnswer)
              .split(",")
              .map((k) => k.trim());

          const matchCount = keywords.filter((k) =>
            answerText.includes(k.toLowerCase())
          ).length;

          isCorrect = matchCount > 0;
        } else if (q.type === "radio" || q.type === "choice") {
          const expected = Array.isArray(q.correctAnswer)
            ? q.correctAnswer
            : [q.correctAnswer];

          isCorrect = expected.some(
            (ans) =>
              String(ans).trim().toLowerCase() ===
              String(answer || "").trim().toLowerCase()
          );
        } else if (q.type === "checkbox" || q.type === "multipleChoice") {
          const expected = Array.isArray(q.correctAnswer)
            ? q.correctAnswer
            : [q.correctAnswer];

          const actual = Array.isArray(answer) ? answer : [answer];

          const expectedSorted = expected.map(String).sort();
          const actualSorted = actual.map(String).sort();

          isCorrect =
            expectedSorted.length === actualSorted.length &&
            expectedSorted.every((v, i) => v === actualSorted[i]);
        }

        if (isCorrect) correctCount++;
      }
    });

    const percentage =
      scoredCount > 0 ? (correctCount / scoredCount) * 100 : 0;

    return {
      correctCount,
      scoredCount,
      percentage: Number(percentage.toFixed(2)),
    };
  };

  const validateStep = (currentStep, silent = false) => {
    const nextErrors = {};

    if (currentStep === 1 || currentStep === "ALL") {
      if (!personal.firstName) nextErrors.firstName = "First name is required";
      if (!personal.lastName) nextErrors.lastName = "Last name is required";
      if (!personal.email) {
        nextErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email)) {
        nextErrors.email = "Please enter a valid email address";
      }
      if (!personal.contactNumber)
        nextErrors.contactNumber = "Contact number is required";
      if (!personal.address1)
        nextErrors.address1 = "Address (Line 1) is required";
      if (!personal.city) nextErrors.city = "City is required";
      if (!personal.state) nextErrors.state = "State is required";
      if (!personal.country) nextErrors.country = "Country is required";
      if (!personal.postalCode)
        nextErrors.postalCode = "Postal code is required";
      if (!personal.gender) nextErrors.gender = "Gender is required";
      if (!personal.experienceLevel)
        nextErrors.experienceLevel = "Experience level is required";

      if (showEducation) {
        education.forEach((edu, idx) => {
          if (!edu.institution)
            nextErrors[`edu_${idx}_institution`] = "Institution is required";
          if (!edu.degreeLevel)
            nextErrors[`edu_${idx}_degreeLevel`] = "Degree level is required";
          if (!edu.program)
            nextErrors[`edu_${idx}_program`] = "Program is required";
          if (!edu.startDate)
            nextErrors[`edu_${idx}_startDate`] = "Start date is required";
          if (!edu.endDate)
            nextErrors[`edu_${idx}_endDate`] = "End date is required";
          if (!edu.yearOfGraduation)
            nextErrors[`edu_${idx}_yearOfGraduation`] =
              "Year of graduation is required";
          if (!edu.gpaOrPercent)
            nextErrors[`edu_${idx}_gpaOrPercent`] = "GPA/Percentage is required";
        });
      }

      (fieldsByModule.personalInfo || []).forEach((field) => {
        if (field.required) {
          const value = dynamicAnswers[field.fieldId];
          if (!value || (Array.isArray(value) && value.length === 0)) {
            nextErrors[field.fieldId] = `${field.label} is required`;
          }
        }
      });

      (fieldsByModule.education || []).forEach((field) => {
        if (field.required) {
          const value = dynamicAnswers[field.fieldId];
          if (!value || (Array.isArray(value) && value.length === 0)) {
            nextErrors[field.fieldId] = `${field.label} is required`;
          }
        }
      });
    }

    if (currentStep === 2 || currentStep === "ALL") {
      if (showExperience) {
        experience.forEach((exp, idx) => {
          if (!exp.companyName)
            nextErrors[`exp_${idx}_companyName`] = "Company name is required";
          if (!exp.role) nextErrors[`exp_${idx}_role`] = "Role is required";
          if (!exp.expStart)
            nextErrors[`exp_${idx}_expStart`] = "Start date is required";
          if (!exp.expEnd)
            nextErrors[`exp_${idx}_expEnd`] = "End date is required";
        });
      }

      if (showAttachments && attachments.length === 0)
        nextErrors.attachments = "Resume is required";

      if (showSkills && skills.length === 0)
        nextErrors.skills = "At least one skill is required";

      if (!consent)
        nextErrors.consent = "You must consent to share your details";
      if (!termsAccepted)
        nextErrors.termsAccepted = "You must agree to the terms and conditions";

      ["experience", "skills", "attachments", "addInfo"].forEach((module) => {
        (fieldsByModule[module] || []).forEach((field) => {
          if (field.required) {
            const value = dynamicAnswers[field.fieldId];
            if (!value || (Array.isArray(value) && value.length === 0)) {
              nextErrors[field.fieldId] = `${field.label} is required`;
            }
          }
        });
      });
    }

    if ((currentStep === 3 && showScreening) || (currentStep === "ALL" && showScreening)) {
      (fieldsByModule.screening || []).forEach((field) => {
        if (field.required) {
          const value = dynamicAnswers[field.fieldId];
          if (!value || (Array.isArray(value) && value.length === 0)) {
            nextErrors[field.fieldId] = `${field.label} is required`;
          }
        }
      });
    }

    setErrors(nextErrors);
    const isValid = Object.keys(nextErrors).length === 0;
    if (!isValid && !silent) {
      const errorMessages = Object.values(nextErrors);
      if (errorMessages.length > 0) {
        showToast(errorMessages[0], "error");
      } else {
        showToast("Please complete all required fields", "error");
      }
    }
    return isValid;
  };

  const handleSubmit = async () => {
    if (!job?.formId?._id) return;

    if (!validateStep("ALL")) return;

    const answers = buildAnswersPayload();
    const screeningResult = calculateScreeningScore();

    try {
      await axiosInstance.post("/api/applications", {
        jobId: job._id,
        formId: job.formId._id,
        answers,
        consent,
        termsAccepted,
      });

      const publishSubmissionEvent = {
        type: "candidate-submitted",
        jobId: job._id,
        timestamp: Date.now(),
      };

      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("view-applicants");
        channel.postMessage(publishSubmissionEvent);
        channel.close();
      }

      localStorage.setItem(
        "view-applicants",
        JSON.stringify(publishSubmissionEvent)
      );

      queryClient.invalidateQueries(["candidates", job._id]);
      showToast("Application submitted successfully", "success");
      setSubmitLocked(true);
      setShowSubmitSuccess(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to submit application";
      showToast(msg, "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center space-y-3">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Error Loading Application</h2>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const formatAnswer = (value) => {
    if (Array.isArray(value)) return value.join(", ");
    if (value && typeof value === "object") {
      return value.fileName || value.name || JSON.stringify(value);
    }
    return value ?? "";
  };

  const renderDynamicReview = (moduleKey, title) => {
    const fields = fieldsByModule[moduleKey] || [];
    if (fields.length === 0) return null;
    return (
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h4 className="text-xs uppercase font-semibold tracking-wider text-indigo-600">{title}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/60 p-4 rounded-xl border border-gray-200/60 text-sm">
          {fields.map((f) => (
            <div key={f.fieldId} className="flex justify-between sm:justify-start gap-4">
              <span className="text-gray-500 w-44">{f.label}:</span>
              <span className="font-semibold text-gray-800">
                {formatAnswer(dynamicAnswers[f.fieldId]) || "-"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (step === 0) {
    return (
      <>
        {isClosed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100 space-y-4">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-red-50 text-red-600 mb-2">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Application Closed</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                We're sorry, but the application for this position has closed. We are no longer accepting new submissions.
              </p>
            </div>
          </div>
        )}
        <CandidateJobDetails job={job} onApply={() => !isClosed && setStep(1)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-6 md:p-8 rounded-2xl shadow-sm border border-indigo-700/50">
          <span className="inline-block bg-white/10 px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider text-indigo-200 backdrop-blur-sm mb-3">
            Job Application Portal
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
            {job?.jobTitle || "Job Application"}
          </h1>
          <p className="text-sm text-indigo-200 font-medium">
            {job?.jobLocation} {job?.companyInfo || job?.companyName ? `• ${job.companyInfo || job.companyName}` : ""}
          </p>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
            <span>Step {step} of {totalSteps}</span>
            <span className="text-indigo-600">
              {step === 1 ? "Personal Info & Education" : step === 2 ? "Experience & Skills" : step === 3 && showScreening ? "Screening Questions" : "Review Application"}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full w-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Success State View */}
        {showSubmitSuccess ? (
          <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-100 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Application Submitted Successfully!</h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                Thank you for applying. We have received your application details and will review your profile shortly.
              </p>
            </div>
            <button
              onClick={resetApplication}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-md shadow-indigo-600/20 transition-all text-sm cursor-pointer"
            >
              Submit Another Application
            </button>
          </div>
        ) : (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
            {/* Step 1: Personal Information & Education */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <User className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">
                    Personal Information
                  </h2>
                </div>

                <QuestionRenderer
                  mode="FILL"
                  module="personalInfo"
                  questions={fieldsByModule.personalInfo}
                  answers={dynamicAnswers}
                  onAnswerChange={handleDynamicAnswerChange}
                  onFileChange={handleDynamicFileChange}
                  errors={errors}
                  setEditingQuestionId={() => { }}
                  onQuestionChange={() => { }}
                  onDelete={() => { }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputLabel
                    label="First Name"
                    value={personal.firstName}
                    onChange={(e) =>
                      setPersonal((p) => ({ ...p, firstName: e.target.value }))
                    }
                    placeholder="First Name"
                    error={errors.firstName}
                  />
                  <InputLabel
                    label="Middle Name"
                    required={false}
                    value={personal.middleName}
                    onChange={(e) =>
                      setPersonal((p) => ({ ...p, middleName: e.target.value }))
                    }
                    placeholder="Middle Name"
                  />
                  <InputLabel
                    label="Last Name"
                    value={personal.lastName}
                    onChange={(e) =>
                      setPersonal((p) => ({ ...p, lastName: e.target.value }))
                    }
                    placeholder="Last Name"
                    error={errors.lastName}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputLabel
                    label="Email"
                    value={personal.email}
                    onChange={(e) =>
                      setPersonal((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="Email Address"
                    error={errors.email}
                  />
                  <InputLabel
                    label="Contact Number"
                    value={personal.contactNumber}
                    onChange={(e) =>
                      setPersonal((p) => ({ ...p, contactNumber: e.target.value }))
                    }
                    placeholder="Contact Number"
                    error={errors.contactNumber}
                  />
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${errors.gender ? 'border-red-500 bg-red-50/20' : 'border-gray-300'}`}
                      value={personal.gender}
                      onChange={(e) =>
                        setPersonal((p) => ({ ...p, gender: e.target.value }))
                      }
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && <p className="text-xs text-red-600 mt-1">{errors.gender}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputLabel
                    label="Address (Line 1)"
                    value={personal.address1}
                    onChange={(e) =>
                      setPersonal((p) => ({ ...p, address1: e.target.value }))
                    }
                    placeholder="Address Line 1"
                    error={errors.address1}
                  />
                  <InputLabel
                    label="Address (Line 2)"
                    required={false}
                    value={personal.address2}
                    onChange={(e) =>
                      setPersonal((p) => ({ ...p, address2: e.target.value }))
                    }
                    placeholder="Address Line 2"
                  />
                  <InputLabel
                    label="City"
                    value={personal.city}
                    onChange={(e) =>
                      setPersonal((p) => ({ ...p, city: e.target.value }))
                    }
                    placeholder="City"
                    error={errors.city}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputLabel
                    label="State"
                    value={personal.state}
                    onChange={(e) =>
                      setPersonal((p) => ({ ...p, state: e.target.value }))
                    }
                    placeholder="State"
                    error={errors.state}
                  />
                  <InputLabel
                    label="Country"
                    value={personal.country}
                    onChange={(e) =>
                      setPersonal((p) => ({ ...p, country: e.target.value }))
                    }
                    placeholder="Country"
                    error={errors.country}
                  />
                  <InputLabel
                    label="Postal Code"
                    value={personal.postalCode}
                    onChange={(e) =>
                      setPersonal((p) => ({ ...p, postalCode: e.target.value }))
                    }
                    placeholder="Postal Code"
                    error={errors.postalCode}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">
                      Experience Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${errors.experienceLevel ? 'border-red-500 bg-red-50/20' : 'border-gray-300'}`}
                      value={personal.experienceLevel}
                      onChange={(e) =>
                        setPersonal((p) => ({
                          ...p,
                          experienceLevel: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Experience</option>
                      <option value="Fresher">Fresher</option>
                      <option value="Entry Level">Entry Level</option>
                      <option value="Mid Level">Mid Level</option>
                      <option value="Senior Level">Senior Level</option>
                      <option value="Executive Level">Executive Level</option>
                    </select>
                    {errors.experienceLevel && <p className="text-xs text-red-600 mt-1">{errors.experienceLevel}</p>}
                  </div>
                </div>

                {showEducation && (
                  <div className="space-y-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <h2 className="text-lg md:text-xl font-bold text-gray-900">
                        Education
                      </h2>
                    </div>

                    <QuestionRenderer
                      mode="FILL"
                      module="education"
                      questions={fieldsByModule.education}
                      answers={dynamicAnswers}
                      onAnswerChange={handleDynamicAnswerChange}
                      onFileChange={handleDynamicFileChange}
                      errors={errors}
                      setEditingQuestionId={() => { }}
                      onQuestionChange={() => { }}
                      onDelete={() => { }}
                    />

                    {education.map((edu, idx) => (
                      <div key={idx} className="bg-gray-50/60 p-5 rounded-2xl border border-gray-200/60 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <InputLabel
                            label="Institution"
                            value={edu.institution}
                            onChange={(e) => {
                              const updated = [...education];
                              updated[idx] = {
                                ...updated[idx],
                                institution: e.target.value,
                              };
                              setEducation(updated);
                            }}
                            placeholder="Institution Name"
                            error={errors[`edu_${idx}_institution`]}
                          />
                          <div>
                            <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">
                              Degree Level <span className="text-red-500">*</span>
                            </label>
                            <select
                              className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${errors[`edu_${idx}_degreeLevel`] ? 'border-red-500 bg-red-50/20' : 'border-gray-300'}`}
                              value={edu.degreeLevel}
                              onChange={(e) => {
                                const updated = [...education];
                                updated[idx] = {
                                  ...updated[idx],
                                  degreeLevel: e.target.value,
                                };
                                setEducation(updated);
                              }}
                            >
                              <option value="">Select Degree Level</option>
                              <option value="Diploma">Diploma</option>
                              <option value="Bachelor's level Degree">
                                Bachelor's level Degree
                              </option>
                              <option value="Master's level Degree">
                                Master's level Degree
                              </option>
                              <option value="Other">Other</option>
                            </select>
                            {errors[`edu_${idx}_degreeLevel`] && <p className="text-xs text-red-600 mt-1">{errors[`edu_${idx}_degreeLevel`]}</p>}
                          </div>
                          <InputLabel
                            label="Program"
                            value={edu.program}
                            onChange={(e) => {
                              const updated = [...education];
                              updated[idx] = {
                                ...updated[idx],
                                program: e.target.value,
                              };
                              setEducation(updated);
                            }}
                            placeholder="Program / Major"
                            error={errors[`edu_${idx}_program`]}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <InputLabel
                            label="Start Date"
                            type="date"
                            value={edu.startDate}
                            onChange={(e) => {
                              const updated = [...education];
                              updated[idx] = {
                                ...updated[idx],
                                startDate: e.target.value,
                              };
                              setEducation(updated);
                            }}
                            error={errors[`edu_${idx}_startDate`]}
                          />
                          <InputLabel
                            label="End Date"
                            type="date"
                            value={edu.endDate}
                            onChange={(e) => {
                              const updated = [...education];
                              updated[idx] = {
                                ...updated[idx],
                                endDate: e.target.value,
                              };
                              setEducation(updated);
                            }}
                            error={errors[`edu_${idx}_endDate`]}
                          />
                          <InputLabel
                            label="Graduation Year"
                            value={edu.yearOfGraduation}
                            onChange={(e) => {
                              const updated = [...education];
                              updated[idx] = {
                                ...updated[idx],
                                yearOfGraduation: e.target.value,
                              };
                              setEducation(updated);
                            }}
                            placeholder="YYYY"
                            error={errors[`edu_${idx}_yearOfGraduation`]}
                          />
                          <InputLabel
                            label="GPA / Percentage"
                            value={edu.gpaOrPercent}
                            onChange={(e) => {
                              const updated = [...education];
                              updated[idx] = {
                                ...updated[idx],
                                gpaOrPercent: e.target.value,
                              };
                              setEducation(updated);
                            }}
                            placeholder="GPA or %"
                            error={errors[`edu_${idx}_gpaOrPercent`]}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Experience, Skills & Attachments */}
            {step === 2 && (
              <div className="space-y-8">
                {showExperience && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <h2 className="text-lg md:text-xl font-bold text-gray-900">
                        Experience
                      </h2>
                    </div>

                    <QuestionRenderer
                      mode="FILL"
                      module="experience"
                      questions={fieldsByModule.experience}
                      answers={dynamicAnswers}
                      onAnswerChange={handleDynamicAnswerChange}
                      onFileChange={handleDynamicFileChange}
                      errors={errors}
                      setEditingQuestionId={() => { }}
                      onQuestionChange={() => { }}
                      onDelete={() => { }}
                    />

                    {experience.map((exp, idx) => (
                      <div key={idx} className="bg-gray-50/60 p-5 rounded-2xl border border-gray-200/60 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <InputLabel
                            label="Company Name"
                            value={exp.companyName}
                            onChange={(e) => {
                              const updated = [...experience];
                              updated[idx] = {
                                ...updated[idx],
                                companyName: e.target.value,
                              };
                              setExperience(updated);
                            }}
                            placeholder="Company Name"
                            error={errors[`exp_${idx}_companyName`]}
                          />
                          <InputLabel
                            label="Role"
                            value={exp.role}
                            onChange={(e) => {
                              const updated = [...experience];
                              updated[idx] = {
                                ...updated[idx],
                                role: e.target.value,
                              };
                              setExperience(updated);
                            }}
                            placeholder="Job Title / Role"
                            error={errors[`exp_${idx}_role`]}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <InputLabel
                            label="Start Date"
                            type="date"
                            value={exp.expStart}
                            onChange={(e) => {
                              const updated = [...experience];
                              updated[idx] = {
                                ...updated[idx],
                                expStart: e.target.value,
                              };
                              setExperience(updated);
                            }}
                            error={errors[`exp_${idx}_expStart`]}
                          />
                          <InputLabel
                            label="End Date"
                            type="date"
                            value={exp.expEnd}
                            onChange={(e) => {
                              const updated = [...experience];
                              updated[idx] = {
                                ...updated[idx],
                                expEnd: e.target.value,
                              };
                              setExperience(updated);
                            }}
                            error={errors[`exp_${idx}_expEnd`]}
                          />
                        </div>

                        <InputLabel
                          label="Responsibilities"
                          value={exp.responsibility}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[idx] = {
                              ...updated[idx],
                              responsibility: e.target.value,
                            };
                            setExperience(updated);
                          }}
                          placeholder="Briefly describe your responsibilities"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {showSkills && (
                  <div className="space-y-4 pt-6 border-t border-gray-100">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Skills</h2>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                        placeholder="Type a skill and press Add"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                    {errors.skills && <p className="text-xs text-red-600">{errors.skills}</p>}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-xl text-sm font-medium"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-indigo-400 hover:text-indigo-700 cursor-pointer font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {showAttachments && (
                  <div className="space-y-4 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h2 className="text-lg md:text-xl font-bold text-gray-900">
                        Resume & Attachments <span className="text-red-500">*</span>
                      </h2>
                    </div>
                    <div className="border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-2xl p-6 text-center bg-gray-50/50 transition-all">
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        id="resume-upload"
                        onChange={(e) => handleAttachmentChange(e.target.files)}
                      />
                      <label htmlFor="resume-upload" className="cursor-pointer space-y-2 block">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto">
                          <FileText className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</p>
                      </label>
                    </div>
                    {errors.attachments && <p className="text-xs text-red-600">{errors.attachments}</p>}
                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        {attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm">
                            <span className="font-medium text-gray-700 truncate max-w-xs">{file.fileName || file.name || "Uploaded File"}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(idx)}
                              className="text-red-500 hover:text-red-700 cursor-pointer font-semibold text-xs px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {showAddInfo && (
                  <div className="space-y-4 pt-6 border-t border-gray-100">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Additional Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputLabel
                        label="Referral Source"
                        required={false}
                        value={referralSource}
                        onChange={(e) => setReferralSource(e.target.value)}
                        placeholder="e.g. LinkedIn, Referral, Google"
                      />
                      <InputLabel
                        label="Subscribe to updates"
                        required={false}
                        value={subscribe}
                        onChange={(e) => setSubscribe(e.target.value)}
                        placeholder="Yes / No"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-6 border-t border-gray-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 cursor-pointer rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      I consent to share my details with the hiring team <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.consent && <p className="text-xs text-red-600 ml-7">{errors.consent}</p>}

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 cursor-pointer rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      I agree to the terms and conditions <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.termsAccepted && <p className="text-xs text-red-600 ml-7">{errors.termsAccepted}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Screening Questions (If enabled) */}
            {step === 3 && showScreening && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">
                    Screening Questions
                  </h2>
                </div>

                <QuestionRenderer
                  mode="FILL"
                  module="screening"
                  questions={fieldsByModule.screening}
                  answers={dynamicAnswers}
                  onAnswerChange={handleDynamicAnswerChange}
                  onFileChange={handleDynamicFileChange}
                  errors={errors}
                  setEditingQuestionId={() => { }}
                  onQuestionChange={() => { }}
                  onDelete={() => { }}
                />
              </div>
            )}

            {/* Review Step */}
            {step === reviewStep && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">
                    Review Your Application
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase font-semibold tracking-wider text-indigo-600">Personal Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/60 p-4 rounded-xl border border-gray-200/60 text-sm">
                      <div className="flex justify-between sm:justify-start gap-4">
                        <span className="text-gray-500 w-44">Full Name:</span>
                        <span className="font-semibold text-gray-800">{`${personal.firstName} ${personal.middleName ? personal.middleName + ' ' : ''}${personal.lastName}`}</span>
                      </div>
                      <div className="flex justify-between sm:justify-start gap-4">
                        <span className="text-gray-500 w-44">Email:</span>
                        <span className="font-semibold text-gray-800">{personal.email}</span>
                      </div>
                      <div className="flex justify-between sm:justify-start gap-4">
                        <span className="text-gray-500 w-44">Contact Number:</span>
                        <span className="font-semibold text-gray-800">{personal.contactNumber}</span>
                      </div>
                      <div className="flex justify-between sm:justify-start gap-4">
                        <span className="text-gray-500 w-44">Location:</span>
                        <span className="font-semibold text-gray-800">{`${personal.city}, ${personal.state}, ${personal.country}`}</span>
                      </div>
                    </div>
                  </div>

                  {renderDynamicReview("personalInfo", "Additional Personal Info")}
                  {renderDynamicReview("education", "Education Details")}
                  {renderDynamicReview("experience", "Experience Details")}

                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h4 className="text-xs uppercase font-semibold tracking-wider text-indigo-600">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s, i) => (
                        <span key={i} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-xl text-sm font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {showScreening && renderDynamicReview("screening", "Screening Questions")}
                </div>
              </div>
            )}

            {/* Navigation Buttons Row */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className={`border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 px-6 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${step === 1 ? 'invisible' : ''}`}
              >
                Back
              </button>

              {step < reviewStep ? (
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep(step)) {
                      setStep((s) => s + 1);
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitLocked || isUploading}
                  onClick={handleSubmit}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium px-8 py-2.5 rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                  {submitLocked ? "Submitting..." : "Submit Application"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateApplicationPage;