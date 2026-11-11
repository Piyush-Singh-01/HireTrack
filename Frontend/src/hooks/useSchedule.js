import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";

// ================= Query Keys =================
export const scheduleQueryKeys = {
  all: ["schedules"],
  lists: () => [...scheduleQueryKeys.all, "list"],
  list: (filters) => [...scheduleQueryKeys.lists(), filters],
};

// ================= In-Memory Cache =================
const scheduleDetailsCache = new Map();

const fetchScheduleDetailsByJobId = async (jobId) => {
  if (!jobId) return;

  if (scheduleDetailsCache.has(`__job__${jobId}`)) return;

  const res = await axiosInstance.get(ApiRoutes.SCHEDULE.GET_ID(jobId));
  const list = Array.isArray(res?.data?.data) ? res.data.data : [];

  list.forEach((item) => {
    const applicationId = item?.applicationId;
    if (!applicationId) return;

    const cacheKey = `${jobId}_${applicationId}`;

    scheduleDetailsCache.set(cacheKey, {
      name:item?.candidate?.name,
      date:item?.interviewSchedule?.interviewDate?? null,
      applicationId: item?.applicationId ?? null,
      scheduleId: item?.interviewSchedule?.scheduleId ?? null,
      scheduleType: item?.interviewSchedule?.scheduleType ?? null,
      email: item?.candidate?.email ?? null,
      meetingLink: item?.interviewSchedule?.meetingLink ?? null,
      candidateDetailsId: item?.applicationId ?? null,
    });
  });

  scheduleDetailsCache.set(`__job__${jobId}`, true);
};

// ================= API Layer =================
const scheduleApi = {
  // ================= GET ALL SCHEDULES =================
  fetchSchedules: async ({userId, filters = {}}) => {
    const params = {};

    if (filters.type) params.type = filters.type;
    if (filters.status && filters.status !== "All Status")
      params.status = filters.status;
    if (filters.position && filters.position !== "All Position")
      params.position = filters.position;
    if (filters.dateFrom) params.fromDate = filters.dateFrom;
    if (filters.dateTo) params.toDate = filters.dateTo;
    if (filters.recruiter) params.recruiter = filters.recruiter;

    // Debug: Log API call parameters
    console.log("DEBUG: API call parameters:", {
      userId,
      filters,
      params,
    });

    try {
      // Fetch all schedules for the user in ONE request using the updated endpoint
      const res = await axiosInstance.get(ApiRoutes.SCHEDULE.GET(userId), { params });
      
      const allSchedulesList = Array.isArray(res?.data?.data) ? res.data.data : [];
      
      console.log(`DEBUG: Got ${allSchedulesList.length} total schedules for user ${userId}`);

      // Transform to match expected schedule format
      const finalSchedules = allSchedulesList.map(schedule => ({
        _id: schedule.scheduleId || schedule._id,
        applicationId: schedule.applicationId || null,
        candidateId: schedule.candidateId || null,
        jobId: schedule.job?.jobId || null,
        position: schedule.job?.jobTitle || "-",
        date: schedule.interviewDate,
        time: schedule.interviewTime,
        name: schedule.candidate?.name || "Unknown",
        recruiter: schedule.recruiterName,
        mode: schedule.meetingMode,
        status: schedule.status,
        candidateEmail: schedule.candidateEmail || null,
        meetLink: schedule.meetingLink || null,
        candidateDetailsId: schedule.applicationId || null, // Ensure candidateDetailsId works for rescheduling
        scheduleType: schedule.scheduleType,
        reschedule: schedule.rescheduled,
        allApplications: schedule.allApplications || [],
        // Keep original schedule data for debugging
        originalData: schedule,
        _debugStatus: schedule.status?.toLowerCase()
      }));

      return finalSchedules;

    } catch (err) {
      console.error("Error fetching schedules:", err);
      return [];
    }
  },

  // ================= GET BY STATUS =================
  fetchSchedulesByStatus: async (status) => {
    const res = await axiosInstance.get(ApiRoutes.SCHEDULE.BY_STATUS, {
      params: { status },
    });

    return Array.isArray(res?.data?.data) ? res.data.data : (res.data ?? []);
  },

  // ================= SCHEDULE =================
  scheduleInterview: async ({ jobId, payload }) => {
    if (!jobId) throw new Error("jobId is required");
    return (await axiosInstance.post(ApiRoutes.SCHEDULE.POST(jobId), payload))
      ?.data;
  },

  // ================= RESCHEDULE =================
  rescheduleInterview: async ({ jobId, payload }) => {
    if (!jobId) throw new Error("jobId is required");
    return (
      await axiosInstance.post(ApiRoutes.SCHEDULE.RESCHEDULE(jobId), payload)
    )?.data;
  },

  // ================= REJECT =================
  rejectInterview: async ({ jobId, applicationId }) => {
    return (
      await axiosInstance.post(ApiRoutes.SCHEDULE.REJECT(jobId), {
        applicationId,
        action: "reject",
      })
    ).data;
  },
};

// ================= Queries =================
export const useSchedules = (userId, filters = {}) =>
  useQuery({
    queryKey: scheduleQueryKeys.list({ userId, filters }),
    queryFn: () => scheduleApi.fetchSchedules({ userId, filters }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!userId,
  });

export const useSchedulesByStatus = (status) =>
  useQuery({
    queryKey: [...scheduleQueryKeys.lists(), "status", status],
    queryFn: () => scheduleApi.fetchSchedulesByStatus(status),
    enabled: !!status && status !== "All Status",
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

// ================= Mutations =================
export const useScheduleInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, ...rest }) =>
      scheduleApi.scheduleInterview({
        jobId,
        payload: {
          candidateId: rest.candidateId,
          recruiterName: rest.recruiterName,
          interviewDate: rest.interviewDate,
          interviewTime: rest.interviewTime,
          meetingMode: rest.meetingMode,
          durationMinutes: rest.durationMinutes ?? 30,
          sendNotification: Boolean(rest.sendNotification),
        },
      }),

    onSuccess: (_, variables) => {
      // Clear cache to force fresh data fetch
      scheduleDetailsCache.clear();
      // Invalidate all schedule queries with proper key structure
      queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.lists() });
      // Force refetch all queries
      queryClient.refetchQueries({ queryKey: scheduleQueryKeys.all });
      queryClient.refetchQueries({ queryKey: scheduleQueryKeys.lists() });
    },
  });
};

export const useRescheduleInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, ...rest }) =>
      scheduleApi.rescheduleInterview({
        jobId,
        payload: {
          interviewDate: rest.interviewDate,
          interviewTime: rest.interviewTime,
          durationMinutes: rest.durationMinutes ?? 30,
          sendNotification: Boolean(rest.sendNotification),
        },
      }),

    onSuccess: (_, variables) => {
      // Clear cache to force fresh data fetch
      scheduleDetailsCache.clear();
      // Invalidate all schedule queries with proper key structure
      queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.lists() });
      // Force refetch all queries
      queryClient.refetchQueries({ queryKey: scheduleQueryKeys.all });
      queryClient.refetchQueries({ queryKey: scheduleQueryKeys.lists() });
    },
  });
};

export const useRejectInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scheduleApi.rejectInterview,
    onSuccess: () => {
      scheduleDetailsCache.clear();
      queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.all });
    },
  });
};