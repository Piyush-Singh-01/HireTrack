import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import usePositions from "../../hooks/usePosition";
import { axiosInstance } from "../../utils/AxiosInstance.js";
import { ApiRoutes } from "../../utils/ApiRoutes.js";
import Position from "../../component/position/Position";

/**
 * PositionsPage Controller
 * Route: /positions
 * Manages position overview, data fetching, tab synchronization,
 * role/status filtering, job deletion API, and route navigation.
 */
const PositionsPage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Determine initial filter from query params or route state
  const statusParam =
    searchParams.get("status") ||
    searchParams.get("filter") ||
    location.state?.filter ||
    "All";

  const [activeFilter, setActiveFilter] = useState(statusParam);
  const [selectedRole, setSelectedRole] = useState("All Position");
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    document.title = "Positions Overview | Talent OS";
  }, []);

  // Update activeFilter when URL params change
  useEffect(() => {
    if (statusParam && statusParam !== activeFilter) {
      setActiveFilter(statusParam);
    }
  }, [statusParam]);

  // Auth state for role-based access & filtering
  const role = useSelector(
    (state) => state.auth.role || state.auth.user?.role || state.auth.user?.Role || ""
  );
  const authUserId = useSelector(
    (state) => state.auth.userId || state.auth.user?.id || state.auth.user?._id || ""
  );
  const authUserPosition = useSelector(
    (state) => state.auth.user?.Position || state.auth.user?.position || ""
  );
  const isInterviewer = role === "Interviewer";

  // Position & analytics data fetching hook
  const {
    positions,
    isLoading,
    isError,
    error,
    refetch,
    analyticsLoading,
    analyticsError,
    analyticsErrorData,
    kpiAnalytics,
    removePositionLocally,
  } = usePositions(activeFilter);

  const kpiData = [
    kpiAnalytics.totalPositions,
    kpiAnalytics.openPositions,
    kpiAnalytics.applications,
    kpiAnalytics.hiredThisMonth,
    kpiAnalytics.AvgTimetoHire,
    kpiAnalytics.closedPositions,
  ];

  /* ---------- Toast Notification Helper ---------- */
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  /* ---------- Closing Date Status Helper ---------- */
  const computeStatusFromClosingDate = (closingDate) => {
    if (!closingDate) return null;
    const date = new Date(closingDate);
    if (Number.isNaN(date.getTime())) return null;

    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const closingOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    return todayOnly > closingOnly ? "Closed" : "Open";
  };

  /* ---------- Normalize & Filter Positions ---------- */
  const rawPositions = Array.isArray(positions) ? positions : [];

  const normalizedPositions = rawPositions
    .filter((p) => {
      // Exclude draft jobs from the Position Overview
      if (p.isDraft) return false;

      // Admins and superadmins see everything
      if (!isInterviewer) return true;

      const isHM =
        (p.hiringManagers || []).some(
          (hm) => String(hm.userId || hm) === String(authUserId)
        ) || String(p.hiringManager?.userId || p.hiringManager) === String(authUserId);

      const isSamePosition =
        (p.department || "").toLowerCase() === (authUserPosition || "").toLowerCase();

      return isHM || isSamePosition;
    })
    .map((p) => {
      const rawStatus = ((p.jobStatus ?? p.status ?? "") + "").trim();
      const computedStatus = computeStatusFromClosingDate(p.closingDate ?? p.closedOn);
      const statusFromData = rawStatus
        ? rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase()
        : "";

      const isHM = isInterviewer
        ? (p.hiringManagers || []).some(
            (hm) => String(hm.userId || hm) === String(authUserId)
          ) || String(p.hiringManager?.userId) === String(authUserId)
        : true;

      return {
        id: p.id ?? p._id ?? p.positionId ?? Math.random().toString(36).slice(2),
        _id: p._id ?? p.id,
        title: p.jobTitle ?? p.title ?? p.name ?? "Untitled",
        role: p.jobRole ?? p.role ?? null,
        status: statusFromData || computedStatus || "Open",
        hiringManager:
          p.hiringManagers && p.hiringManagers.length > 0
            ? p.hiringManagers.map((hm) => hm.name).join(", ")
            : typeof p.hiringManager === "object"
            ? p.hiringManager?.name
            : (p.hiringManager ?? p.manager ?? "-"),
        openings: p.numberOfOpenings ?? p.openings ?? p.vacancies ?? "-",
        openedOn: p.openedOn ?? p.createdAt ?? p.postedOn ?? "-",
        closedOn: p.closingDate ?? p.closedOn ?? "-",
        applicantsCount: p.applicantsCount ?? p.applicants?.length ?? 0,
        postedOn: p.postedOn ?? p.source ?? "-",
        isHiringManagerForThisJob: isHM,
      };
    });

  const filteredPositions = normalizedPositions.filter((position) => {
    if (activeFilter !== "All" && position.status !== activeFilter) return false;
    if (
      selectedRole !== "All Position" &&
      (position.role?.toLowerCase() ?? "") !== selectedRole.toLowerCase()
    ) {
      return false;
    }
    return true;
  });

  const roles = [
    "All Position",
    ...Array.from(
      new Set(
        normalizedPositions
          .map((p) => p.role)
          .filter((r) => r && typeof r === "string")
      )
    ),
  ];

  /* ---------- Delete Job Modal Handlers ---------- */
  const openDeletePopup = (jobId, jobTitle) => {
    setJobToDelete({ id: jobId, title: jobTitle });
    setDeletePopupOpen(true);
  };

  const closeDeletePopup = () => {
    setDeletePopupOpen(false);
    setJobToDelete(null);
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      setDeletingJobId(jobToDelete.id);
      const jobIdToDelete = jobToDelete._id || jobToDelete.id || jobToDelete.jobId;
      const response = await axiosInstance.delete(
        ApiRoutes.POSITION.DELETEJOB(jobIdToDelete)
      );

      if (response.data.success) {
        closeDeletePopup();
        showToast("success", `Job "${jobToDelete.title}" deleted successfully!`);
        removePositionLocally(jobIdToDelete);
        setDeletingJobId(null);
        refetch();
      } else {
        showToast("error", response.data.message || "Failed to delete job");
        closeDeletePopup();
        setDeletingJobId(null);
      }
    } catch (err) {
      console.error("Error deleting job:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete job. Please try again.";

      if (
        err.response?.status === 400 &&
        errorMessage.includes("existing applications")
      ) {
        showToast(
          "error",
          "This job has applications and cannot be deleted. Please close the job instead of deleting it."
        );
      } else {
        showToast("error", errorMessage);
      }
      closeDeletePopup();
      setDeletingJobId(null);
    }
  };

  /* ---------- Navigation Actions ---------- */
  const handleNavigateJobPost = () => {
    navigate("/jobpost");
  };

  const handleNavigateDetails = (position) => {
    navigate("/viewDetails", {
      state: {
        status: position.status,
        jobId: position._id || position.id || position.jobId,
      },
    });
  };

  const handleNavigateEdit = (jobId) => {
    navigate("/editjobpost", { state: { jobId } });
  };

  return (
    <Position
      kpiData={kpiData}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      selectedRole={selectedRole}
      onRoleChange={setSelectedRole}
      roles={roles}
      filteredPositions={filteredPositions}
      isLoading={isLoading}
      isError={isError}
      error={error}
      analyticsLoading={analyticsLoading}
      analyticsError={analyticsError}
      analyticsErrorData={analyticsErrorData}
      isInterviewer={isInterviewer}
      onNavigateJobPost={handleNavigateJobPost}
      onNavigateDetails={handleNavigateDetails}
      onNavigateEdit={handleNavigateEdit}
      onOpenDelete={openDeletePopup}
      deletePopupOpen={deletePopupOpen}
      onConfirmDelete={handleDeleteJob}
      onCloseDelete={closeDeletePopup}
      deletingJobId={deletingJobId}
      toast={toast}
      onCloseToast={handleCloseToast}
      {...props}
    />
  );
};

export default PositionsPage;
