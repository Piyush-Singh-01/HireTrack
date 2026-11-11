import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ViewTask from "../../component/position/candidatePage/ViewTask";

/**
 * ViewTaskPage Controller
 * Route: /viewTask
 * Manages applicant task submissions, grading dates, shortlist actions, and route navigation.
 */
const ViewTaskPage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const candidate = props.candidate || state.candidate || state || {};

  const candidateName =
    candidate?.name || candidate?.fullName || candidate?.candidateName || "--";
  const taskTitle = candidate?.task || "Aptitude Round-1";
  const position = candidate?.position || candidate?.role || "--";
  const jobId = candidate?.jobId;
  const status = candidate?.status || "Open";

  useEffect(() => {
    document.title =
      candidateName && candidateName !== "--"
        ? `Task Submission: ${candidateName} | Talent OS`
        : "Candidate Task Submission | Talent OS";
  }, [candidateName]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return "--";
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const assignedDate = useMemo(() => formatDate(candidate.assignedOn), [candidate.assignedOn]);
  const submittedDate = useMemo(
    () => formatDate(candidate.submiitedOn || candidate.submittedOn),
    [candidate.submiitedOn, candidate.submittedOn]
  );

  const handleShortlist = () => {
    navigate("/viewApplicants", {
      state: {
        status,
        jobId,
      },
    });
  };

  const handleCancel = () => {
    if (jobId) {
      navigate("/viewApplicants", {
        state: { status, jobId },
      });
    } else {
      navigate(-1);
    }
  };

  return (
    <ViewTask
      candidate={candidate}
      candidateName={candidateName}
      taskTitle={taskTitle}
      position={position}
      assignedDate={assignedDate}
      submittedDate={submittedDate}
      onShortlist={handleShortlist}
      onCancel={handleCancel}
      {...props}
    />
  );
};

export default ViewTaskPage;
