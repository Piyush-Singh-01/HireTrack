import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";

export const useReschedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      scheduleId,
      candidateDetailsId,
      newDate,
      newTime,
      meetingMode,
      durationMinutes = 30,
      sendNotification,
      candidateId,
      applicant,
      scheduleType,
      applicantIds,
      applicants,
      recruiterName,
    }) => {
      const payload = {
        scheduleId,
        candidateDetailsId,
        newDate,
        newTime,
        meetingMode,
        durationMinutes,
        sendNotification,
        candidateId,
        applicant,
        applicantIds,
        scheduleType,
        applicants,
      };

      // If we have these IDs, it's a reschedule (PUT). 
      // If we only have candidateId/applicationId, it's a new schedule (POST).
      const isReschedule = Boolean(scheduleId && scheduleId !== candidateId);
      
      const url = isReschedule 
        ? ApiRoutes.POSITION.RESCHEDULE(jobId)
        : ApiRoutes.SCHEDULE.POST(jobId);

      if (!isReschedule) {
        // Business Rule: Candidate must be shortlisted before scheduling.
        // We perform a silent shortlist here to ensure the POST request succeeds.
        try {
          await axiosInstance.post(ApiRoutes.POSITION.SHORTLIST(jobId), { 
            applicationId: candidateId || scheduleId,
            action: "shortlist"
          });
        } catch (e) {
          // If already shortlisted or other error, we continue to the schedule call
        }
      }

      const res = isReschedule
        ? await axiosInstance.put(url, payload)
        : await axiosInstance.post(url, {
            ...payload,
            candidateId: payload.candidateId || candidateId || scheduleId,
            interviewDate: payload.newDate,
            interviewTime: payload.newTime,
            recruiterName: recruiterName || payload.recruiter || payload.recruiterName
          });

      return res.data;
    },

    onSuccess: (data, variables) => {
      const { jobId } = variables;
      // Invalidate both general and specific schedule keys
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["all-schedules"] });
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: ["candidates", jobId] });
      }
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ["schedules"] });
    },
  });
};
