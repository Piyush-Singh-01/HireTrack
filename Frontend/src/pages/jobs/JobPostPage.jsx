import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CiCirclePlus, CiFileOn } from "react-icons/ci";
import { useJobpost } from "../../hooks/useJobpost";
import { setIsNewTemplate, setTemplate } from "../../store/slice/Jobpostslice";
import JobTemplateCard from "../../component/jobPost/JobTemplateCard";

/**
 * JobPostPage
 * Main page for viewing and selecting job description templates,
 * viewing drafts, or initiating a new job description template.
 */
const JobPostPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getTemplate } = useJobpost();

  const jobPost = useSelector((state) => state.jobPost) || {};
  const templates = jobPost.post || [];
  const isLoadingTemplate = getTemplate?.isPending || false;

  useEffect(() => {
    document.title = "Job Templates | Talent OS";
  }, []);

  const handleUseTemplate = (id) => {
    localStorage.removeItem("jobApplicationDraft");
    localStorage.removeItem("jobDraftId");
    dispatch(setIsNewTemplate(false));
    dispatch(setTemplate(null));

    // Navigate only after template is loaded into Redux to prevent race condition
    getTemplate.mutate(id, {
      onSuccess: () => {
        navigate("/jobapplication");
      },
    });
  };

  const handleCreateNewTemplate = () => {
    localStorage.removeItem("jobApplicationDraft");
    localStorage.removeItem("jobDraftId");
    dispatch(setIsNewTemplate(true));
    dispatch(setTemplate(null));
    navigate("/jobapplication");
  };

  const handleViewDrafts = () => {
    navigate("/drafts");
  };

  return (
    <main className="min-h-screen bg-slate-50/80 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <header className="mb-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="relative px-6 py-7 sm:px-8 sm:py-9">
            <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-indigo-100/70 blur-3xl" />
            <div className="pointer-events-none absolute right-36 top-10 h-28 w-28 rounded-full bg-violet-100/70 blur-2xl" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
                  <CiFileOn className="text-3xl" />
                </div>
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                    Recruitment workspace
                  </p>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Create a Job Description
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                    Manage your existing job templates or start a new job description.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleViewDrafts}
                  className="inline-flex min-h-11 items-center justify-center cursor-pointer gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                >
                  <CiFileOn className="text-xl" />
                  View Drafts
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewTemplate}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl cursor-pointer bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-100"
                >
                  <CiCirclePlus className="text-2xl" />
                  Create New Template
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Existing templates section */}
        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Your library
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Existing Job Templates
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose a template to reuse its job description details.
              </p>
            </div>
            <span className="inline-flex w-fit items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700">
              {templates.length} {templates.length === 1 ? "template" : "templates"}
            </span>
          </div>

          {/* Job cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((job, index) => (
              <JobTemplateCard
                key={job._id || index}
                job={job}
                onUseTemplate={handleUseTemplate}
                isLoading={isLoadingTemplate}
              />
            ))}
          </div>

          {templates.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <CiFileOn className="text-3xl" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No job templates yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Create your first job description template to make future job postings faster.
              </p>
              <button
                type="button"
                onClick={handleCreateNewTemplate}
                className="mt-5 inline-flex items-center justify-center cursor-pointer gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-100"
              >
                <CiCirclePlus className="text-2xl" />
                Create New Template
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default JobPostPage;
