import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../utils/AxiosInstance";
import ApiRoutes from "../../utils/ApiRoutes";
import { useToast } from "../../utils/ToastContext";

const rescheduleInterview = async ({ jobId, payload }) => {
  const { data } = await axiosInstance.put(
    ApiRoutes.SCHEDULE.RESCHEDULE2(jobId),
    payload
  );
  return data;
};

export const useRescheduleInterview = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: rescheduleInterview,

    onSuccess: (data, variables) => {
      showToast("Interview rescheduled successfully ✅", "success");

      // 🔄 Invalidate related queries
      queryClient.invalidateQueries(["job", variables.jobId]);
      queryClient.invalidateQueries(["interview-schedule"]);
      queryClient.invalidateQueries(["candidates"]);
    },

    onError: (error) => {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to reschedule interview";

      showToast(message, "error");
    },
  });
};
