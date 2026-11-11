import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";
import { useQuery } from "@tanstack/react-query";

export function useFeedback() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const state = location.state || {};
  const jobId = state.jobId || sessionStorage.getItem("jobId");
  const candidate = state.candidate || null;
  const candidateId =
    state?.candidate?.applicationId || sessionStorage.getItem("applicationId");

  const [showFeedback, setShowFeedback] = useState(
    location?.state?.showFeedback || false,
  );

  useEffect(() => {
    if (candidateId) {
      sessionStorage.setItem("applicationId", candidateId);
    }
  }, [candidateId]);

  const [ratings, setRatings] = useState({
    communication: "",
    technical: "",
    programming: "",
    problemSolving: "",
  });

  const [comments, setComments] = useState("");

  const updateRating = (key, value) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const feedbackQuery = useQuery({
    queryKey: ["candidateFeedback", candidateId],
    enabled: !!candidateId,
    queryFn: async () => {
      const res = await axiosInstance.get(
        ApiRoutes.SCHEDULE.GET_FEEDBACK(candidateId),
      );
      return res.data.data;
    },
  });
  const resumeUrl = feedbackQuery.data?.answers?.resume || null;

  useEffect(() => {
    const fb = feedbackQuery.data?.candidateFeedback;

    if (fb) {
      setRatings({
        communication: fb.communication || "",
        technical: fb.technical || "",
        programming: fb.programming || "",
        problemSolving: fb.problemSolving || "",
      });

      setComments(fb.feedbackDescription || "");
      setShowFeedback(true);
    }
  }, [feedbackQuery.data]);

  const feedbackMutate = useMutation({
    mutationFn: ({ ratings, comments, newStatus }) =>
      axiosInstance.post(ApiRoutes.POSITION.FEEDBACK(jobId), {
        applicationId: candidateId,
        candidateFeedback: {
          ...ratings,
          feedbackDescription: comments,
        },
        candidateRating: newStatus === "rejected" ? "Not a fit" : "Good fit",
        updateStatus: true,
        newStatus,
      }),

    onSuccess: (_data, variables) => {
      const { newStatus } = variables;
      let tab = "";
      if (newStatus === "hired") {
        tab = "Hired";
      } else if (newStatus === "onhold") {
        tab = "On-Hold";
      } else {
        tab = "Rejected";
      }
      queryClient.invalidateQueries({
        queryKey: ["candidates"],
      });
      // Invalidate schedule queries to refresh the schedule page
      queryClient.invalidateQueries({
        queryKey: ["schedules"],
      });
      queryClient.invalidateQueries({
        queryKey: ["schedules"],
      });
      // Also invalidate list queries to be safe
      queryClient.invalidateQueries({
        queryKey: ["schedules", "list"],
      });
    },
  });

  const shortlist = useMutation({
    mutationFn: () =>
      axiosInstance.post(ApiRoutes.POSITION.SHORTLIST(jobId), {
        applicationId: candidateId,
        action: "shortlist"
      }),
    onSuccess: () => {
      navigate("/viewApplicants", {
        state: { status: "Open", jobId, tab: "Selected" },
      });
    },
  });

  const reject = useMutation({
    mutationFn: (reason) =>
      axiosInstance.post(ApiRoutes.POSITION.REJECT(jobId), {
        applicationId: candidateId,
        action: "reject",
        rejectionReason: reason,
      }),
    onSuccess: () => {
      navigate("/viewApplicants", {
        state: { status: "Open", jobId, tab: "Rejected" },
      });
    },
  });

  return {
    candidate,
    ratings,
    comments,
    setComments,
    updateRating,
    submitFeedback: feedbackMutate.mutateAsync,
    shortlistCandidate: shortlist.mutateAsync,
    rejectCandidate: reject.mutateAsync,
    showFeedback,
    resumeUrl, 
  };
}

export default useFeedback;
