import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/AxiosInstance";
import ApiRoutes from '../utils/ApiRoutes'

/* ------------------ DATE HELPERS ------------------ */

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
  return (
    d.getMonth() === lastMonth.getMonth() &&
    d.getFullYear() === lastMonth.getFullYear()
  );
};

const isWithinLastDays = (date, days) => {
  if (!date || date === "-") return false;
  const d = new Date(date);
  const now = new Date();
  return now - d <= days * 24 * 60 * 60 * 1000;
};
 

export const usePositions = (filter = "All") => {
  const queryClient = useQueryClient();

  /* ------------------ POSITIONS QUERY ------------------ */
  const positionsQuery = useQuery({
    queryKey: ["positions", filter],
    queryFn: async () => {
      const endpoint = ApiRoutes.POSITION.JOBS.ALL;

      const response = await axiosInstance.get(endpoint, {
        params: { 
          page: 1, 
          limit: 50,
          type: filter.toLowerCase() === "all" ? "all" : filter.toLowerCase()
        },
      });

      return response?.data?.data?.jobs ?? response?.data?.data ?? [];
    },
    staleTime: 0, // Changed to 0 to always fetch fresh data
    refetchOnWindowFocus: false,
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
  });

  const overviewData = analyticsQuery.data || {};
  const summary = overviewData.summary || {};
  const metrics = overviewData.metrics || {};

  /* ------------------ DERIVED KPI ANALYTICS ------------------ */

  const allPositionsQuery = useQuery({
    queryKey: ["positions", "all"],
    queryFn: async () => {
      const res = await axiosInstance.get(ApiRoutes.POSITION.JOBS.ALL, {
        params: { page: 1, limit: 50 },
      });
      return res?.data?.data?.jobs ?? res?.data?.data ?? [];
    },
    staleTime: 0, // Changed to 0 to always fetch fresh data
  });

  const positions = allPositionsQuery.data ?? [];

  const analytics = {
    totalPositions: summary.totalPositions ?? 0,
    openPositions: summary.openPositions ?? 0,
    applicationsCount: summary.totalApplications ?? 0,
    closedPositions: summary.closedPositions ?? 0,
    hiredThisMonth: summary.hiredThisMonth ?? 0,
    AvgTimetoHire: metrics.averageTimeToHire ?? "0 days",
  };

  // +X from last month
  const totalThisMonth = positions.filter((p) =>
    isSameMonth(p.postedOn)
  ).length;

  const totalLastMonth = positions.filter((p) =>
    isLastMonth(p.postedOn)
  ).length;

  const totalDiff = totalThisMonth - totalLastMonth;

  const openPercent =
    analytics.totalPositions > 0
      ? Math.round(
        (analytics.openPositions / analytics.totalPositions) * 100
      )
      : 0;

  const applicationsPerPosition =
    analytics.totalPositions > 0
      ? (analytics.applicationsCount / analytics.totalPositions).toFixed(1)
      : 0;

  const closedLastWeek = positions.filter(
    (p) => p.status === "Closed" && isWithinLastDays(p.closedOn, 7)
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
      subtitle: ' of total',
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
      subtitle:
        closedLastWeek > 0
          ? `*${closedLastWeek} closed last week`
          : "*No closures last week",
      subtitleColor: "text-gray-500",
    },
  };

  // Function to invalidate all position-related queries
  const invalidatePositions = async () => {
    await queryClient.invalidateQueries({ queryKey: ["positions"] });
    await queryClient.invalidateQueries({ queryKey: ["analytics-overview"] });
  };

  const removePositionLocally = (jobId) => {
    queryClient.setQueryData(["positions", "all"], (oldData) => {
      if (!oldData) return oldData;
      return oldData.filter((job) => job._id !== jobId && job.id !== jobId && job.jobId !== jobId);
    });
  };

  return {
    positions,
    analytics,
    kpiAnalytics,
    isLoading: positionsQuery.isLoading || analyticsQuery.isLoading,
    isError: positionsQuery.isError || analyticsQuery.isError,
    error: positionsQuery.error || analyticsQuery.error,
    refetch: positionsQuery.refetch,
    refetchAnalytics: analyticsQuery.refetch,
    invalidatePositions,
    removePositionLocally,
  };
};

export default usePositions;
