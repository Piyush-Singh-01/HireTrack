import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";
import { updateCandidateStatus } from "../store/slice/candidateStatusSlice";

export const useCandidateStatus = (jobId, candidateId) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // SHORTLIST
  const shortlistCandidate = useMutation({
    mutationKey: ["candidate-shortlist", jobId, candidateId],
    mutationFn: async () => {
      if (!jobId) throw new Error("Missing jobId");
      if (!candidateId) throw new Error("Missing candidateId");

      const res = await axiosInstance.post(
        ApiRoutes.POSITION.STATUS(jobId),
        { applicationId: candidateId, action: "shortlist" }
      );
      return res?.data;
    },
    onSuccess: (data) => {
      dispatch(updateCandidateStatus({
        candidateId,
        status: "shortlisted",
        data,
      }));

      queryClient.invalidateQueries(["candidates", jobId]);

      navigate("/viewApplicants", {
        state: { status: "Open", jobId, message: "Candidate shortlisted successfully", tab: "Selected" },
      });
    },
    onError: (error) => {
      console.error("Failed to shortlist candidate:", error);
    },
  });

  // REJECT
  const rejectCandidate = useMutation({
    mutationKey: ["candidate-reject", jobId, candidateId],
    mutationFn: async ({ feedbackDescription } = {}) => {
      if (!jobId) throw new Error("Missing jobId");
      if (!candidateId) throw new Error("Missing candidateId");

      if (feedbackDescription) {
        // Use feedback endpoint for direct rejection with specific feedback
        const res = await axiosInstance.post(ApiRoutes.POSITION.FEEDBACK(jobId), {
          applicationId: candidateId,
          candidateFeedback: {
            communication: "Inadequate",
            technical: "Inadequate",
            programming: "Inadequate",
            problemSolving: "Inadequate",
            feedbackDescription
          },
          candidateRating: "Not a fit",
          updateStatus: true,
          newStatus: "rejected",
        });
        return res?.data;
      } else {
        // Standard reject using consolidated status endpoint
        const res = await axiosInstance.post(
          ApiRoutes.POSITION.STATUS(jobId),
          { 
            applicationId: candidateId,
            action: "reject",
            rejectionReason: "",
            cancelInterview: true
          }
        );
        return res?.data;
      }
    },
    onSuccess: (data) => {
      dispatch(updateCandidateStatus({
        candidateId,
        status: "rejected",
        data,
      }));

      queryClient.invalidateQueries(["candidates", jobId]);

      navigate("/viewApplicants", {
        state: { status: "Open", jobId, message: "Candidate rejected successfully", tab: "Rejected" },
      });
    },
    onError: (error) => {
      console.error("Failed to reject candidate:", error);
    },
  });

  const getCanidatedetail = useQuery({
    queryKey: ["get-candidate", candidateId],
    enabled: Boolean(candidateId),
    queryFn: async () => {
      const res = await axiosInstance.get(
        ApiRoutes.SCHEDULE.GET_FEEDBACK(candidateId),
      );
      return res.data;
    },
  })

  return {
    shortlistCandidate: {
      mutate: shortlistCandidate.mutateAsync,
      isLoading: shortlistCandidate.isPending,
      error: shortlistCandidate.error,
      isSuccess: shortlistCandidate.isSuccess,
    },
    rejectCandidate: {
      mutate: rejectCandidate.mutateAsync,
      isLoading: rejectCandidate.isPending,
      error: rejectCandidate.error,
      isSuccess: rejectCandidate.isSuccess,
    },
    getCanidatedetail
  };
};