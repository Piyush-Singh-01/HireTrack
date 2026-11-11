import InputWithLabel from "./InputWithLable";
import { CiCirclePlus, CiFileOn } from "react-icons/ci";
import { useLocation, useNavigate } from "react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useJobpost } from "../../../hooks/useJobpost";
import { useToast } from "../../../utils/ToastContext";
import axiosInstance from "../../../utils/AxiosInstance";
import ApiRoutes from "../../../utils/ApiRoutes";
import getDisplayName from "../../../utils/getDisplayName";
import { FaRegCopy } from "react-icons/fa";

const AdditionalInfo = ({ applicationDetails, setApplicationDetails }) => {
  const posterFile =
    applicationDetails.additionalInfo.posterVisuals?.[0] || null;
  const fileInputRef = useRef(null);
  const applicationLink =
    applicationDetails.additionalInfo.applicationLink || "";
  const displayLink =
    applicationLink && applicationLink.startsWith("/")
      ? `${window.location.origin}${applicationLink}`
      : applicationLink;
  const [copied, setCopied] = useState(false);
  const [posterUploading, setPosterUploading] = useState(false);
  const { createJob, updatejobdraft, updatejobpost } = useJobpost();
  const { showToast } = useToast();
  const MAX_POSTER_BYTES = 10 * 1024 * 1024;

  // Sync canonical slug application link if currently set to raw ObjectId
  useEffect(() => {
    const syncSlugLink = async () => {
      const cachedJobId = localStorage.getItem("jobDraftId");
      const currentLink = applicationDetails.additionalInfo.applicationLink || "";
      const targetId = cachedJobId || (currentLink.match(/\/apply\/([0-9a-fA-F]{24})$/)?.[1]);
      if (!targetId) return;

      try {
        const res = await axiosInstance.get(`/api/jobs/slug/${targetId}`);
        const job = res?.data?.data;
        if (job?.applicationLink && job.applicationLink !== currentLink) {
          setApplicationDetails((prev) => ({
            ...prev,
            additionalInfo: {
              ...prev.additionalInfo,
              applicationLink: job.applicationLink,
            },
          }));
        }
      } catch {
        // Ignore background sync errors
      }
    };
    syncSlugLink();
  }, [setApplicationDetails]);

  // Get current user info from Redux store
  const authUser = useSelector((state) => state.auth.user);
  const storedUsername = useSelector((state) => state.auth.username);
  const userId = useSelector((state) => state.auth.userId);
  const authRole = useSelector((state) => state.auth.role) || authUser?.role;

  const displayName = getDisplayName(authUser);
  const username =
    displayName === "Unknown" ? storedUsername || "Unknown" : displayName;

  const currentUser = userId || authUser?.id || storedUsername || "User";

  console.log("=== USER CHECK ===");
  console.log("storedUsername:", storedUsername);
  console.log("currentUser:", currentUser);

  const handleCopyLink = async () => {
    if (!displayLink) return;
    try {
      await navigator.clipboard.writeText(displayLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleChangeInfo = useCallback(
    (field, value) => {
      setApplicationDetails((prev) => ({
        ...prev,
        additionalInfo: {
          ...prev.additionalInfo,
          [field]: value,
        },
      }));
    },
    [setApplicationDetails],
  );
  const navigate = useNavigate();

  const uploadPoster = async (file) => {
    const rawLink = applicationDetails.additionalInfo.applicationLink || "";
    // Clean up the slug from the application link
    const slug = rawLink.replace(/^\/(apply\/|apply)/, "") || "undefined";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "job_posters");
    const res = await axiosInstance.post(ApiRoutes.UPLOADS.HR_POSTER(slug), formData, {
      // Remove default JSON content-type so browser sets multipart boundary.
      headers: {},
      transformRequest: (data, headers) => {
        if (headers) {
          delete headers["Content-Type"];
          delete headers["content-type"];
        }
        return data;
      },
    });
    return res?.data?.data;
  };

  const handleRemovePoster = () => {
    handleChangeInfo("posterVisuals", []);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex w-full flex-col items-start justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-[28px]">
            Additional Information
          </h3>
          <p className="mt-1.5 text-sm text-slate-500">
            Review your job post, generate its application link, and add a poster.
          </p>
        </div>
        <button
          onClick={() => navigate("/drafts")}
          type="button"
          className="inline-flex min-h-10 items-center justify-center cursor-pointer gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
        >
          <CiFileOn /> Drafts
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2 xl:gap-8">
        {/* Left Column */}
        <div className="min-w-0 space-y-5">
          {/* Application Link */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900">Application link</h2>
              <p className="mt-1 text-sm text-slate-500">Create or copy the link candidates will use to apply.</p>
            </div>
            <div className="flex w-full flex-col items-stretch gap-3">
              <div className="w-full min-w-0">
                <InputWithLabel
                  label="Application Link"
                  value={displayLink}
                  placeholder="Application link will be generated automatically after publish"
                  readOnly
                  disabled
                  inputClassName="w-full"
                  inputWidthClass="w-full"
                  onChange={() => {}}
                />
              </div>
              <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-600 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition duration-200 cursor-pointer hover:border-blue-700 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                  onClick={() => {
                    const basePayload = {
                      isDraft: true, // Always create as draft first
                      jobTitle: applicationDetails.basic.jobTitle,
                      jobRole: applicationDetails.basic.jobRole || applicationDetails.basic.jobTitle,
                      department: applicationDetails.basic.department,
                      jobLocation: applicationDetails.basic.jobLocation,
                      jobType: applicationDetails.basic.jobType,
                      experience: applicationDetails.basic.experience,
                      // jobCode: applicationDetails.basic.jobCode,
                      hiringManager: {
                        name: applicationDetails.basic.hiringManager || username,
                        userId: applicationDetails.basic.hiringManagerId || userId || authUser?.id,
                        onModel: applicationDetails.basic.hiringManagerOnModel || (authRole === "SuperAdmin" ? "User" : "UserAndRole"),
                      },
                      numberOfOpenings: applicationDetails.basic.numberOfOpenings ? Number(applicationDetails.basic.numberOfOpenings) : undefined,
                      jobStatus: applicationDetails.basic.jobStatus,
                      closingDate: applicationDetails.basic.closingDate,
                      about: applicationDetails.description.about,
                      responsibilities: applicationDetails.description.responsibilities,
                      requirements: applicationDetails.description.requirements,
                      preferredQualifications: applicationDetails.description.preferredQualifications,
                      lookingFor: applicationDetails.description.lookingFor,
                      applicationLink: applicationDetails.additionalInfo.applicationLink,
                      // companyInfo: applicationDetails.additionalInfo.companyInfo,
                      posterVisuals: applicationDetails.additionalInfo.posterVisuals || [],
                      formId: applicationDetails.formId,
                      screeningId: applicationDetails.screeningId,
                    };
 
                    const createPayload = {
                      ...basePayload,
                    };

                    // console.log("=== PAYLOAD DEBUG ===");
                    // console.log("Application details:", applicationDetails);
                    // console.log("Description section:", applicationDetails.description);
                    // console.log("About field value:", applicationDetails.description?.about);
                    // console.log("LookingFor field value:", applicationDetails.description?.lookingFor);
                    // console.log("Payload hiringManager:", basePayload.hiringManager);
                    // console.log("Create payload hiringManager:", createPayload.hiringManager);
                    // console.log("Full payload keys:", Object.keys(basePayload));

                    const cachedJobId = localStorage.getItem("jobDraftId");
                    const resolveJobFromLink = async () => {
                      const rawLink =
                        applicationDetails.additionalInfo.applicationLink || "";
                      const linkPath = rawLink.startsWith("http")
                        ? new URL(rawLink).pathname
                        : rawLink;
                      const slug = linkPath.replace(/^\/apply\//, "");
                      if (!slug) return null;
                      try {
                        const res = await axiosInstance.get(
                          `/api/jobs/slug/${slug}`,
                        );
                        return res?.data?.data || null;
                      } catch (err) {
                        return null;
                      }
                    };

                    const navigateToModules = (job) => {
                      if (job?._id) {
                        localStorage.setItem("jobDraftId", job._id);
                      }
                      localStorage.setItem(
                        "jobApplicationDraft",
                        JSON.stringify(applicationDetails),
                      );
                      navigate("/selectionModule", {
                        state: { jobDetails: job, mode: "HR" },
                      });
                    };

                    const shouldUpdate = cachedJobId || applicationDetails.additionalInfo.applicationLink;
                    
                    if (shouldUpdate) {
                      if (cachedJobId) {
                        updatejobdraft.mutate(
                          {
                            jobId: cachedJobId,
                            updatedData: basePayload,
                          },
                          {
                            onSuccess: (jobData) => {
                              const job =
                                jobData?.data?.data || jobData?.data || jobData;
                              navigateToModules(job);
                            },
                            onError: (err) => {
                              if (err?.response?.status === 404) {
                                updatejobpost.mutate(
                                  {
                                    jobId: cachedJobId,
                                    updatedData: basePayload,
                                  },
                                  {
                                    onSuccess: (jobData) => {
                                      const job =
                                        jobData?.data?.data ||
                                        jobData?.data ||
                                        jobData;
                                      navigateToModules(job);
                                    },
                                    onError: (postErr) => {
                                      const msg =
                                        postErr?.response?.data?.message ||
                                        postErr.message;
                                      showToast(
                                        `Error updating job: ${msg}`,
                                        "error",
                                      );
                                    },
                                  },
                                );
                                return;
                              }

                              if (err?.response?.status === 500) {
                                console.warn(
                                  "Draft update failed with 500, falling back to create job",
                                  err,
                                );
                                createJob.mutate(createPayload, {
                                  onSuccess: (jobData) => {
                                    const job =
                                      jobData?.data?.data ||
                                      jobData?.data ||
                                      jobData;
                                    navigateToModules(job);
                                  },
                                  onError: (createErr) => {
                                    console.error(
                                      "Fallback create job also failed:",
                                      createErr,
                                    );
                                    const msg =
                                      createErr?.response?.data?.message ||
                                      createErr.message;
                                    showToast(
                                      `Error creating job: ${msg}`,
                                      "error",
                                    );
                                  },
                                });
                                return;
                              }

                              console.error("Error updating draft job:", err);
                              const msg =
                                err?.response?.data?.message || err.message;
                              showToast(`Error updating job: ${msg}`, "error");
                            },
                          },
                        );
                        return;
                      }

                      if (applicationDetails.additionalInfo.applicationLink) {
                        resolveJobFromLink().then((job) => {
                          if (job?._id) {
                            const updater = job.isDraft
                              ? updatejobdraft
                              : updatejobpost;
                            updater.mutate(
                              { jobId: job._id, updatedData: basePayload },
                              {
                                onSuccess: (jobData) => {
                                  const updatedJob =
                                    jobData?.data?.data ||
                                    jobData?.data ||
                                    jobData;
                                  navigateToModules(updatedJob);
                                },
                                onError: (err) => {
                                  const msg =
                                    err?.response?.data?.message || err.message;
                                  showToast(
                                    `Error updating job: ${msg}`,
                                    "error",
                                  );
                                },
                              },
                            );
                            return;
                          }
                          createJob.mutate(createPayload, {
                            onSuccess: (jobData) => {
                              const createdJob =
                                jobData?.data?.data || jobData?.data || jobData;
                              navigateToModules(createdJob);
                            },
                            onError: (err) => {
                              console.error("Error creating draft job:", err);
                              const msg =
                                err?.response?.data?.message || err.message;
                              showToast(`Error creating job: ${msg}`, "error");
                            },
                          });
                        });
                        return;
                      }
                    }

                    createJob.mutate(createPayload, {
                      onSuccess: (jobData) => {
                        const job =
                          jobData?.data?.data || jobData?.data || jobData;
                        navigateToModules(job);
                      },
                      onError: (err) => {
                        console.error("Error creating draft job:", err);
                        const msg = err?.response?.data?.message || err.message;
                        showToast(`Error creating job: ${msg}`, "error");
                      },
                    });
                  }}
                >
                  <CiCirclePlus /> Edit/Create
                </button>
                <button
                  type="button"
                  className={`inline-flex min-h-11 items-center justify-center cursor-pointer gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
                    displayLink
                      ? "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                  onClick={handleCopyLink}
                  disabled={!displayLink}
                >
                  {copied ? "Copied" : "Copy Link"}
                </button>
              </div>
            </div>
          </section>

          {/* Structured Job Description Preview */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-4 sm:px-6">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">Job post preview</h2>
              <p className="mt-1 text-sm text-slate-500">This is a summary of the information candidates will see.</p>
            </div>
            <div className="p-4 sm:p-6">
            
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:col-span-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Position :</span>
                <span className="break-words text-sm font-semibold text-slate-800">{applicationDetails.basic.jobTitle || "—"}</span>
              </div>
              <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role :</span>
                <span className="break-words text-sm text-slate-800">{applicationDetails.basic.jobRole || "—"}</span>
              </div>
              <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Department :</span>
                <span className="break-words text-sm text-slate-800">{applicationDetails.basic.department || "—"}</span>
              </div>
              <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location :</span>
                <span className="break-words text-sm text-slate-800">{applicationDetails.basic.jobLocation || "—"}</span>
              </div>
              <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Type :</span>
                <span className="break-words text-sm text-slate-800">{applicationDetails.basic.jobType || "—"}</span>
              </div>
              <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hiring Manager :</span>
                <span className="break-words text-sm text-slate-800">{applicationDetails.basic.hiringManager || username || "—"}</span>
              </div>
              <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Openings :</span>
                <span className="break-words text-sm text-slate-800">{applicationDetails.basic.numberOfOpenings || "—"}</span>
              </div>
              <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Application Link :</span>
                {displayLink ? (
                   <div className="flex items-center gap-2 group">
                      <a href={displayLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                        {displayLink}
                      </a>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                        onClick={handleCopyLink}
                        title="Copy Link"
                        aria-label="Copy application link"
                      >
                        <FaRegCopy />
                      </button>
                   </div>
                ) : (
                  <span className="text-gray-400 italic">Will be generated after publish</span>
                )}
              </div>
            </div>

            <div className="space-y-6 text-sm leading-6 text-slate-700">
              {applicationDetails.description.about && (
                <div>
                   <h3 className="mb-2 text-sm font-semibold text-slate-900">About the Role</h3>
                   <p className="whitespace-pre-wrap">{applicationDetails.description.about}</p>
                </div>
              )}

              {applicationDetails.description.responsibilities && (
                <div>
                   <h3 className="mb-2 text-sm font-semibold text-slate-900">Key Responsibilities</h3>
                   <ul className="list-disc ml-5 space-y-1">
                      {applicationDetails.description.responsibilities.split('\n').filter(t => t.trim()).map((line, idx) => (
                        <li key={idx} className="pl-1">{line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*') ? line.trim().substring(1).trim() : line.trim()}</li>
                      ))}
                   </ul>
                </div>
              )}

              {applicationDetails.description.requirements && (
                <div>
                   <h3 className="mb-2 text-sm font-semibold text-slate-900">Requirements / Skills Needed</h3>
                   <ul className="list-disc ml-5 space-y-1">
                      {applicationDetails.description.requirements.split('\n').filter(t => t.trim()).map((line, idx) => (
                        <li key={idx} className="pl-1">{line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*') ? line.trim().substring(1).trim() : line.trim()}</li>
                      ))}
                   </ul>
                </div>
              )}

              {applicationDetails.description.preferredQualifications && (
                <div>
                   <h3 className="mb-2 text-sm font-semibold text-slate-900">Preferred Qualifications</h3>
                   <ul className="list-disc ml-5 space-y-1">
                      {applicationDetails.description.preferredQualifications.split('\n').filter(t => t.trim()).map((line, idx) => (
                        <li key={idx} className="pl-1">{line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*') ? line.trim().substring(1).trim() : line.trim()}</li>
                      ))}
                   </ul>
                </div>
              )}

              {applicationDetails.description.lookingFor && (
                <div>
                   <h3 className="mb-2 text-sm font-semibold text-slate-900">What We're Looking For</h3>
                   <ul className="list-disc ml-5 space-y-1">
                      {applicationDetails.description.lookingFor.split('\n').filter(t => t.trim()).map((line, idx) => (
                        <li key={idx} className="pl-1">{line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*') ? line.trim().substring(1).trim() : line.trim()}</li>
                      ))}
                   </ul>
                </div>
              )}

              {applicationDetails.additionalInfo.companyInfo && (
                <div>
                   <h3 className="mb-2 text-sm font-semibold text-slate-900">Company Information</h3>
                   <ul className="list-disc ml-5 space-y-1">
                      {applicationDetails.additionalInfo.companyInfo.split('\n').filter(t => t.trim()).map((line, idx) => (
                        <li key={idx} className="pl-1">{line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*') ? line.trim().substring(1).trim() : line.trim()}</li>
                      ))}
                   </ul>
                </div>
              )}
            </div>
            </div>
          </section>
        </div>

        {/* Right Column - File Upload */}
        <div className="min-w-0">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900 sm:text-lg">Poster / Visual</h2>
              <p className="mt-1 text-sm text-slate-500">Add a visual asset to make your job post stand out.</p>
            </div>

          <label
            htmlFor="file-upload"
            className="group flex min-h-64 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-center transition duration-200 hover:border-blue-400 hover:bg-blue-50/50 sm:min-h-80"
          >
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0] || null;
                if (!file) return;
                if (file.size > MAX_POSTER_BYTES) {
                  showToast("File too large. Max allowed is 10 MB.", "error");
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                  return;
                }
                try {
                  setPosterUploading(true);
                  const uploaded = await uploadPoster(file);
                  if (!uploaded?.fileUrl) {
                    throw new Error("Upload failed");
                  }
                  handleChangeInfo("posterVisuals", [uploaded]);
                } catch (err) {
                  console.error("Poster upload failed:", err);
                  showToast("Failed to upload poster", "error");
                } finally {
                  setPosterUploading(false);
                }
              }}
            />

            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200 transition group-hover:scale-105">
              <CiFileOn className="h-7 w-7" />
            </span>
            <p className="mb-2 text-sm font-semibold text-slate-800">
              Click to choose a file
            </p>
            <p className="mb-4 max-w-xs text-xs leading-5 text-slate-500">
              JPG, PNG, or PDF. Maximum file size: 10 MB.
            </p>
            <span className="inline-flex min-h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition group-hover:bg-indigo-700">
              <CiCirclePlus className="mr-1 h-4 w-4" /> Upload file
            </span>
          </label>

          {(posterUploading || posterFile) && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span className="min-w-0 truncate text-sm font-medium text-slate-700">
                {posterUploading
                  ? "Uploading..."
                  : posterFile?.fileName || "Uploaded file"}
              </span>

              {!posterUploading && (
                <button
                  type="button"
                  onClick={handleRemovePoster}
                  className="flex-shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
                >
                  Remove
                </button>
              )}
            </div>
          )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdditionalInfo;