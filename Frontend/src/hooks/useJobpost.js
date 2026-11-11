import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { axiosInstance } from "../utils/AxiosInstance";
import { setPost, setTemplate } from "../store/slice/Jobpostslice";
import { useToast } from "../utils/ToastContext";
import ApiRoutes from "../utils/ApiRoutes";

const isSameMonth = (date) => {
  if (!date || date === "-") return false;
  const d = new Date(date);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

const isLastMonth = (date) => {
  if (!date || date === "-") return false;
  const d = new Date(date);
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
};

const isWithinLastDays = (date, days) => {
  if (!date || date === "-") return false;
  const d = new Date(date);
  const now = new Date();
  return now - d <= days * 24 * 60 * 60 * 1000;
};

const FetchPost = async () => {
  const res = await axiosInstance.get(ApiRoutes.POSITION.JOBS.ALL);
  const post = res.data.data.jobs || res.data.data;
  if (!post) throw new Error("no post");
  return post;
};

const FetchDrafts = async () => {
  const res = await axiosInstance.get(ApiRoutes.POSITION.JOBS.DRAFTS);
  return res.data.data;
};

export const useJobpost = (activeFilter = "All", options = {}) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { skipPost = false, skipAnalytics = false } = options;

  const postQuery = useQuery({
    queryKey: ["Post"],
    queryFn: async () => {
      const res = await FetchPost();
      dispatch(setPost(res));
      return res;
    },
    staleTime: 0,
    enabled: !skipPost,
  });

  const displayJob = postQuery.data || [];

  const draftQuery = useQuery({
    queryKey: ["Drafts"],
    queryFn: async () => {
      const res = await FetchDrafts();
      return res;
    },
    staleTime: 0,
  });

  /* ------------------ ANALYTICS QUERY ------------------ */
  const analyticsQuery = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: async () => {
      const res = await axiosInstance.get(ApiRoutes.POSITION.ANALYTICS.OVERVIEW);
      return res.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
    enabled: !skipAnalytics,
  });

  const overviewData = analyticsQuery.data || {};
  const summary = overviewData.summary || {};
  const metrics = overviewData.metrics || {};

  const analytics = {
    totalPositions: summary.totalPositions ?? 0,
    openPositions: summary.openPositions ?? 0,
    applicationsCount: summary.totalApplications ?? 0,
    closedPositions: summary.closedPositions ?? 0,
    hiredThisMonth: summary.hiredThisMonth ?? 0,
    AvgTimetoHire: metrics.averageTimeToHire ?? "0 days",
  };

  /* ------------------ KPI CALCULATIONS ------------------ */
  const totalThisMonth = displayJob.filter((p) => isSameMonth(p.createdAt)).length;
  const totalLastMonth = displayJob.filter((p) => isLastMonth(p.createdAt)).length;
  const totalDiff = totalThisMonth - totalLastMonth;

  const openPercent = analytics.totalPositions > 0
    ? Math.round((analytics.openPositions / analytics.totalPositions) * 100)
    : 0;

  const applicationsPerPosition = analytics.totalPositions > 0
    ? (analytics.applicationsCount / analytics.totalPositions).toFixed(1)
    : 0;

  const closedLastWeek = displayJob.filter(
    (p) => p.jobStatus === "Closed" && isWithinLastDays(p.closingDate, 7)
  ).length;

  const HIRED_TARGET = 8;

  const kpiAnalytics = {
    totalPositions: {
      title: "Total Positions",
      value: analytics.totalPositions,
      subtitleValue: `${totalDiff >= 0 ? "+" : ""}${totalDiff}`,
      subtitle: " from last month",
      subtitleColor: totalDiff >= 0 ? "text-green-600" : "text-red-600",
    },
    openPositions: {
      title: "Open Positions",
      value: analytics.openPositions,
      subtitleValue: `${openPercent}%`,
      subtitle: " of total",
      subtitleColor: "text-green-600",
    },
    applications: {
      title: "Applications",
      value: analytics.applicationsCount,
      subtitleValue: `+${applicationsPerPosition}%`,
      subtitle: " of total",
      subtitleColor: "text-green-600",
    },
    hiredThisMonth: {
      title: "Hired This Month",
      value: analytics.hiredThisMonth,
      subtitleValue: "",
      subtitle: `Target : ${HIRED_TARGET} Candidates`,
      subtitleColor: "text-gray-500",
    },
    AvgTimetoHire: {
      title: "Avg. Time to Hire",
      value: analytics?.AvgTimetoHire.split(" ")[0],
      subtitleValue: "",
      subtitle: "Days",
      changeType: "neutral",
    },
    closedPositions: {
      title: "Closed Position",
      value: analytics.closedPositions,
      subtitleValue: "",
      subtitle: closedLastWeek > 0 ? `*${closedLastWeek} closed last week` : "*No closures last week",
      subtitleColor: "text-gray-500",
    },
  };

  const getTemplate = useMutation({
    mutationFn: async (templateId) => {
      const res = await axiosInstance.get(ApiRoutes.POSITION.JOBS.SCREEN(templateId));
      return res.data;
    },
    onSuccess: (res) => {
      const jobData = res.data?.job || res.data;
      dispatch(setTemplate(jobData));
    },
    onError: (err) => {
      console.error("Error fetching template:", err);
      showToast(err.response?.data?.message || "Error fetching template", "error");
    },
  });

  const updatejobpost = useMutation({
    mutationFn: async ({ jobId, updatedData }) => {
      const res = await axiosInstance.put(ApiRoutes.POSITION.UPDATEJOB(jobId), updatedData);
      return res.data;
    },
    onSuccess: (res) => {
      postQuery.refetch();
      draftQuery.refetch();
      dispatch(setTemplate(null));
    },
    onError: (err) => {
      console.error("Error updating job post:", err);
      showToast(err.response?.data?.message || "Error updating job post", "error");
    },
  });

  const updatejobdraft = useMutation({
    mutationFn: async ({ jobId, updatedData }) => {
      try {
        const res = await axiosInstance.put(
          `/api/jobs/updateDraft/${jobId}`,
          updatedData
        );
        return res.data;
      } catch (err) {
        if (err?.response?.status === 404) {
          const res = await axiosInstance.put(
            `/api/jobs/updateJob/${jobId}`,
            updatedData
          );
          return res.data;
        }
        throw err;
      }
    },
    onSuccess: (res) => {
      postQuery.refetch();
      draftQuery.refetch();
    },
    onError: (err) => {
      console.error("Error updating draft:", err);
      showToast(err.response?.data?.message || "Error updating draft", "error");
    },
  });

  const createJob = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/api/jobs/createJob`, data);
      return res.data;
    },
    onSuccess: (res) => {
      postQuery.refetch();
      draftQuery.refetch();
      dispatch(setTemplate(null));
    },
    onError: (err) => {
      console.error("Error creating job:", err);
      showToast(err.response?.data?.message || "Error creating job", "error");
    },
  });

  const createForm = useMutation({
    mutationFn: async (data) => {
      // Assuming you import FormService or use axios directly. 
      // Since ApiRoutes is available and used elsewhere, strict consistency implies importing it or using the service.
      // However, the existing code uses axiosInstance directly. I will follow that pattern for consistency within the file.
      // But wait, I just created FormService. I should probably use it or stick to the file's pattern. 
      // The file uses axiosInstance directly. I'll stick to that to avoid mixed styles unless I refactor the whole file.
      // Actually, looking at the previous file content, it uses axiosInstance. 
      // I will use axiosInstance to be consistent with the existing functions in this file.
      // Need to import ApiRoutes if not imported, or just use the string if it was used that way.
      // The existing code uses strings like `/api/jobs/createJob`.
      // I'll check if ApiRoutes is imported. It is NOT imported in the previous view_file of useJobpost.js.
      // So I should use the path string directly or import ApiRoutes.
      const res = await axiosInstance.post(`/api/forms/v1/`, data);
      return res.data;
    },
    onSuccess: (res) => {
      console.log("Form created successfully:", res);
    },
    onError: (err) => {
      console.error("Error creating form:", err);
    },
  });

  return {
    ...postQuery,
    displayJob,
    kpiAnalytics,
    analytics,
    drafts: draftQuery.data,
    isLoadingDrafts: draftQuery.isLoading,
    refetchDrafts: draftQuery.refetch,
    getTemplate,
    updatejobpost,
    updatejobdraft,
    createJob,
    createForm,
  };
};
