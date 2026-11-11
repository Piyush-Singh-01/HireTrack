import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CiCirclePlus, CiFileOn } from "react-icons/ci";
import { IoArrowBack } from "react-icons/io5";
import JobCard from "../../component/JobCard";
import DeletePopup from "../../component/jobPost/Drafts/DeletePopup";
import { useJobpost } from "../../hooks/useJobpost";
import {
  setIsNewTemplate,
  setTemplate,
} from "../../store/slice/Jobpostslice";

/**
 * DraftsPage
 * Main page for viewing, editing, and deleting saved job description drafts.
 */
const DraftsPage = () => {
  const [selectedDraftId, setSelectedDraftId] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { drafts = [], isLoadingDrafts, getTemplate } = useJobpost();

  useEffect(() => {
    document.title = "Saved Job Drafts | Talent OS";
  }, []);

  const handleBack = () => {
    navigate("/jobpost");
  };

  const handleCreateNew = () => {
    localStorage.removeItem("jobDraftId");
    localStorage.removeItem("jobApplicationDraft");
    dispatch(setIsNewTemplate(true));
    dispatch(setTemplate(null));
    navigate("/jobapplication");
  };

  const handleEditDraft = (draftId) => {
    localStorage.removeItem("jobApplicationDraft");
    localStorage.setItem("jobDraftId", draftId);
    dispatch(setIsNewTemplate(false));
    dispatch(setTemplate(null));
    getTemplate.mutate(draftId, {
      onSuccess: () => {
        navigate("/jobapplication");
      },
    });
  };

  const handleOpenDeleteModal = (draftId) => {
    setSelectedDraftId(draftId);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  return (
    <main className="min-h-screen bg-slate-50/80 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <header className="mb-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="relative px-5 py-6 sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-indigo-100/80 blur-3xl" />
            <div className="pointer-events-none absolute right-28 top-8 h-28 w-28 rounded-full bg-violet-100/70 blur-2xl" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  aria-label="Back to job templates"
                  className="mt-0 flex h-10 w-10 shrink-0 items-center justify-center cursor-pointer rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                >
                  <IoArrowBack className="text-xl" />
                </button>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
                  <CiFileOn className="text-3xl" />
                </div>

                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                    Recruitment workspace
                  </p>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Job Description Drafts
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                    Continue editing saved job descriptions or create a fresh template.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center cursor-pointer gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-100"
                onClick={handleCreateNew}
              >
                <CiCirclePlus className="text-2xl" />
                Create New Template
              </button>
            </div>
          </div>
        </header>

        {/* Draft list heading */}
        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Saved work
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Draft Applications
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Pick up where you left off on a job description.
              </p>
            </div>

            {!isLoadingDrafts && drafts?.length > 0 && (
              <span className="inline-flex w-fit items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700">
                {drafts.length} {drafts.length === 1 ? "draft" : "drafts"}
              </span>
            )}
          </div>

          {isLoadingDrafts ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 shadow-sm">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
              <p className="mt-4 text-sm font-semibold text-slate-700">
                Loading your drafts…
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Fetching your saved job descriptions
              </p>
            </div>
          ) : drafts?.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                <CiFileOn className="text-4xl" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900">
                No drafts found
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Your saved job descriptions will appear here. Create a new template to start an application.
              </p>
              <button
                type="button"
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-100"
                onClick={handleCreateNew}
              >
                <CiCirclePlus className="text-2xl" />
                Create New Template
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {drafts?.map((draft, index) => (
                <div
                  key={draft._id || index}
                  className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/70"
                >
                  <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500" />
                  <div className="p-1">
                    <JobCard
                      role={draft.jobTitle}
                      manager={draft.hiringManager}
                      opening={draft.numberOfOpenings}
                      openDate={
                        draft.publishedAt
                          ? new Date(draft.publishedAt).toLocaleDateString()
                          : "--"
                      }
                      closeDate={
                        draft.closingDate
                          ? new Date(draft.closingDate).toLocaleDateString()
                          : "--"
                      }
                      count={draft.applicantsCount || 0}
                      post={draft.postedOn || "--"}
                      buttonText="Edit Draft"
                      onButtonClick={() => handleEditDraft(draft._id)}
                      onDeleteClick={() => handleOpenDeleteModal(draft._id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <DeletePopup
        id={selectedDraftId}
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
      />
    </main>
  );
};

export default DraftsPage;
