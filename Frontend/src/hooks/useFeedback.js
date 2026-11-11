import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";

export function useFeedback() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const state = location.state || {};

  const persistedJobId =
    typeof window !== "undefined" ? sessionStorage.getItem("jobId") : null;

  const jobId = state.jobId || persistedJobId || null;
  const candidate = state.candidate || null;

  const candidateId =
    state.candidateId ||
    candidate?.candidateId ||
    candidate?._id ||
    state.id ||
    null;

  const showFeedback = Boolean(state.showFeedback);
  const directReject = Boolean(state.directReject);

  /* ---------------- Persist jobId ---------------- */
  useEffect(() => {
    if (jobId) sessionStorage.setItem("jobId", jobId);
  }, [jobId]);

  const { data: serverFeedback, isLoading: isFeedbackLoading } = useQuery({
    queryKey: ["candidate-feedback", candidateId],
    enabled: !!candidateId,
    queryFn: async () => {
      const res = await axiosInstance.get(ApiRoutes.SCHEDULE.GET_FEEDBACK(candidateId));
      return res.data?.data?.candidateFeedback || res.data?.data || null;
    },
    staleTime: 30000,
  });

  /* ---------------- Ratings ---------------- */
  const [ratings, setRatings] = useState({
    communication: "Excellent",
    technical: "Excellent",
    programming: "Excellent",
    problemSolving: "Excellent",
  });

  useEffect(() => {
    const fb = serverFeedback || candidate?.candidateFeedback || candidate?.candidate?.candidateFeedback;
    if (fb) {
      setRatings({
        communication: fb.communication || (directReject ? "Inadequate" : "Excellent"),
        technical: fb.technical || (directReject ? "Inadequate" : "Excellent"),
        programming: fb.programming || (directReject ? "Inadequate" : "Excellent"),
        problemSolving: fb.problemSolving || (directReject ? "Inadequate" : "Excellent"),
      });
    } else if (directReject) {
      setRatings({
        communication: "Inadequate",
        technical: "Inadequate",
        programming: "Inadequate",
        problemSolving: "Inadequate",
      });
    }
  }, [serverFeedback, candidate, directReject]);

  const updateRating = (key, value) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  /* ---------------- Comments ---------------- */
  const [comments, setComments] = useState("");

  useEffect(() => {
    const fb = serverFeedback || candidate?.candidateFeedback || candidate?.candidate?.candidateFeedback;
    if (fb?.feedbackDescription) {
      setComments(fb.feedbackDescription);
    } else if (directReject) {
      setComments("Rejected before shortlist or interview");
    }
  }, [serverFeedback, candidate, directReject]);
  

  /* ---------------- Submit Feedback ---------------- */
  const feedbackMutate = useMutation({
    mutationKey: ["feedback", jobId, candidateId],

    mutationFn: async ({ candidateFeedback, newStatus }) => {
      // if (!jobId || !candidateId) {
      //   throw new Error("Missing jobId or candidateId");
      // }

      let candidateRating = "Not a fit";
      if (newStatus === "hired") candidateRating = "Good fit";
      else if (newStatus === "onhold") candidateRating = "Maybe";
      else if (newStatus === "selected") candidateRating = "Good fit";

      return axiosInstance.post(
        ApiRoutes.POSITION.FEEDBACK(jobId),
        {
          applicationId: candidateId,
          candidateFeedback,
          candidateRating,
          updateStatus: true,
          newStatus,
        }
      );
    },

    onSuccess: (_data, variables) => {
      const { newStatus } = variables;

      queryClient.invalidateQueries(["candidates", jobId]);
      if (newStatus == "hired") {
        navigate("/viewApplicants", {
        state: { status: state.status || "Open", jobId, tab: "Hired" ,newToast:{message:"Candidate Feedback successfully", type:"success"} },
        });
      } else if (newStatus == "onhold") {
        navigate("/viewApplicants", {
          state: { status: state.status || "Open", jobId, tab: "On-Hold"  ,newToast:{message:"Candidate Feedback successfully", type:"success"} },
        });
      } else if (newStatus == "selected") {
        navigate("/viewApplicants", {
          state: { status: state.status || "Open", jobId, tab: "Selected", newToast: { message: "Candidate Selected successfully", type: "success" } },
        });
      } else {
        navigate("/viewApplicants", {
          state: { status: state.status || "Open", jobId, tab: "Rejected", newToast: { message: "Candidate Feedback successfully", type: "success" } },
        });
      }
    }
  })

  /* ---------------- Shortlist ---------------- */
  const shortlist = useMutation({
    mutationKey: ["candidate-shortlist", jobId, candidateId],
    mutationFn: async () =>
      axiosInstance.post(ApiRoutes.POSITION.SHORTLIST(jobId), { applicationId: candidateId, action: "shortlist" }),

    onSuccess: () => {
      queryClient.invalidateQueries(["candidates", jobId]);
      navigate("/viewApplicants", {
        state: { status: state.status || "Open", jobId, tab: "Selected" ,newToast:{message:"Candidate Selected successfully", type:"success"} },
      });
    }
  });

  /* ---------------- Reject ---------------- */
  const reject = useMutation({
    mutationKey: ["candidate-reject", jobId, candidateId],
    mutationFn: async (rejectionReason = "") =>
      axiosInstance.post(ApiRoutes.POSITION.REJECT(jobId), {
        applicationId: candidateId,
        action: "reject",
        rejectionReason,
        cancelInterview: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["candidates", jobId]);
      navigate("/viewApplicants", {
        state: { status: state.status || "Open", jobId, tab: "Rejected" ,newToast:{message:"Candidate Rejected successfully", type:"success"} },
      });
    },
  });

  /* ---------------- Public APIs ---------------- */
  // const submitFeedback = async (newStatus) => {
  //   const candidateFeedback = {
  //     ...ratings,
  //     comments,
  //   };

  //   return feedbackMutate.mutateAsync({ candidateFeedback, newStatus });
  // };
  const submitFeedback = async ({ candidateFeedback, newStatus }) => {
    return feedbackMutate.mutateAsync({ candidateFeedback, newStatus });
  };



  return {
    candidate,
    ratings,
    comments,
    setComments,
    updateRating,
    submitFeedback,
    shortlistCandidate: shortlist.mutateAsync,
    rejectCandidate: reject.mutateAsync,
    showFeedback,
    feedbackMutate,
    shortlist,
    reject
  };
}

export default useFeedback;