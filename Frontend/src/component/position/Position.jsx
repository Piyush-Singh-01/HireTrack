import React from "react";
import { FiPlusCircle, FiInbox } from "react-icons/fi";
import DeletePopup from "../userAndRole/DeletePopup.jsx";
import Toast from "../ui/Toast";
import PositionKPIs from "./PositionKPIs";
import PositionFilters from "./PositionFilters";
import PositionCard from "./PositionCard";

/**
 * Position Component
 * Focused presentational component rendering the Position Overview UI:
 * header actions, KPI metrics, role/status filter toolbars, position cards, and delete modal.
 */
const Position = ({
  kpiData = [],
  activeFilter = "All",
  onFilterChange,
  selectedRole = "All Position",
  onRoleChange,
  roles = ["All Position"],
  filteredPositions = [],
  isLoading = false,
  isError = false,
  error = null,
  analyticsLoading = false,
  analyticsError = false,
  analyticsErrorData = null,
  isInterviewer = false,
  onNavigateJobPost,
  onNavigateDetails,
  onNavigateEdit,
  onOpenDelete,
  deletePopupOpen = false,
  onConfirmDelete,
  onCloseDelete,
  deletingJobId = null,
  toast = { show: false, type: "success", message: "" },
  onCloseToast,
}) => {
  return (
    <>
      <div className="min-h-screen bg-slate-50/60">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ================= Header ================= */}
          <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Position Page
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Track open roles, hiring managers, and applicant activity.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 hover:shadow cursor-pointer"
              onClick={onNavigateJobPost}
            >
              <FiPlusCircle className="text-base" />
              <span>Post a Job</span>
            </button>
          </section>

          {/* ================= KPI Cards ================= */}
          <PositionKPIs kpiData={kpiData} />

          {/* ================= Toolbar: Status Filter + Role Filter ================= */}
          <PositionFilters
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            selectedRole={selectedRole}
            onRoleChange={onRoleChange}
            roles={roles}
          />

          {/* ================= Loading & Error States ================= */}
          {(isLoading || analyticsLoading) && (
            <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
              <div className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-blue animate-spin" />
              Loading {isLoading ? "positions" : "analytics"}...
            </div>
          )}

          {(isError || analyticsError) && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
              <div className="text-sm font-semibold text-rose-700 mb-1">
                Failed to load {isError ? "positions" : "analytics"}
              </div>
              <div className="text-xs text-rose-600/80 break-all">
                {String(
                  (isError
                    ? error?.message || error
                    : analyticsErrorData?.message || analyticsErrorData) || "Unknown error"
                )}
              </div>
            </div>
          )}

          {/* ================= Positions Card Grid ================= */}
          {!isLoading && !isError && !analyticsLoading && !analyticsError && (
            <div className="max-h-[70vh] overflow-y-auto hide-scrollbar pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredPositions.map((job) => (
                  <PositionCard
                    key={job.id}
                    job={job}
                    canManage={!isInterviewer || job.isHiringManagerForThisJob}
                    onDetails={onNavigateDetails}
                    onEdit={onNavigateEdit}
                    onDelete={onOpenDelete}
                    isDeleting={deletingJobId === job.id}
                  />
                ))}

                {filteredPositions.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-xl">
                      <FiInbox />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">No positions found.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      <DeletePopup
        isOpen={deletePopupOpen}
        onConfirm={onConfirmDelete}
        onCancel={onCloseDelete}
        isLoading={deletingJobId !== null}
      />

      {/* Toast Notification */}
      {toast?.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={onCloseToast}
        />
      )}
    </>
  );
};

export default Position;