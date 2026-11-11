import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";
import { useMemo } from "react";
import { normalizeScheduleRecord } from "./useNormalizedSchedules";

/**
 * Consolidated Dashboard Hook
 * Fetches all analytics in a single request to improve performance and consistency.
 * Resolves 404 errors from legacy individual endpoints.
 */
export const useDashboardInfo = (position, filterType = "today") => {
  const userId = localStorage.getItem("userId");

  // Single query for all analytics
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary", position],
    queryFn: async () => {
      const res = await axiosInstance.get(ApiRoutes.DASHBOARD.SUMMARY_ANALYTICS, {
        params: { position }
      });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const data = summaryQuery.data;

  // ==========================================
  // COMPATIBILITY LAYER FOR Dashboard.jsx
  // ==========================================

  const upcomingInterviewsQuery = {
    ...summaryQuery,
    data: { 
      data: data?.interviews?.upcoming || [],
      count: (data?.interviews?.upcoming || []).length
    }
  };

  const completedInterviewsQuery = {
    ...summaryQuery,
    data: { 
      data: data?.interviews?.completed || [],
      count: (data?.interviews?.completed || []).length
    }
  };

  const candidatesInCurrentMonthQuery = {
    ...summaryQuery,
    data: { count: data?.summary?.totalCandidatesCurrentMonth || 0 }
  };

  const candidatesInCurrentWeekQuery = {
    ...summaryQuery,
    data: { count: data?.summary?.totalCandidatesCurrentWeek || 0 }
  };

  const inProcessQuery = {
    ...summaryQuery,
    data: { count: data?.summary?.inProcess || 0 }
  };

  const shortlistedCandidatesQuery = {
    ...summaryQuery,
    data: { count: data?.summary?.shortlisted || 0 }
  };

  const rejectedCandidatesQuery = {
    ...summaryQuery,
    data: { count: data?.summary?.rejected || 0 }
  };

  const hiredCandidatesQuery = {
    ...summaryQuery,
    data: { count: data?.summary?.hired || 0 }
  };

  const currentWeekHiredQuery = {
    ...summaryQuery,
    data: { count: data?.summary?.currentWeekHired || 0 }
  };

  const totalHiringManagersQuery = {
    ...summaryQuery,
    data: { count: data?.summary?.totalEmployees || 0 }
  };

  const monthlyHiredQuery = {
    ...summaryQuery,
    data: { 
      roles: Object.keys(data?.charts?.monthlyHired?.roles || {}),
      month: data?.charts?.monthlyHired?.roles || {},
      totalRoles: data?.charts?.monthlyHired?.totalRoles || 0
    }
  };

  const candidateRates = {
    ...summaryQuery,
    data: data?.charts?.interviewRate || { total: 0, chartData: [] }
  };

  // Today Schedule (supports filterType like 'yesterday', 'today', 'tomorrow')
  const todayInterviewScheduleQuery = useQuery({
    queryKey: ["todayInterviewSchedule", userId, filterType],
    enabled: !!userId,
    queryFn: async () => {
      const res = await axiosInstance.get(ApiRoutes.SCHEDULE.GET(userId), {
        params: { type: filterType },
      });
      
      const rawData = res.data.data || [];
      return Array.isArray(rawData) ? rawData.map(normalizeScheduleRecord) : [];
    },
  });

  // Reusing the merged schedule logic
  const mergedTodaySchedules = useMemo(() => {
    return (todayInterviewScheduleQuery.data || []).filter((item) => {
      const s = (item.status || "").toLowerCase();
      return !["hired", "rejected", "onhold", "on hold", "on-wait", "on wait", "onwait"].includes(s);
    });
  }, [todayInterviewScheduleQuery.data]);

  return {
    summaryQuery,
    candidateRates,
    upcomingInterviewsQuery,
    completedInterviewsQuery,
    todayInterviewScheduleQuery,
    candidatesInCurrentMonthQuery,
    candidatesInCurrentWeekQuery,
    inProcessQuery,
    shortlistedCandidatesQuery,
    rejectedCandidatesQuery,
    hiredCandidatesQuery,
    currentWeekHiredQuery,
    totalHiringManagersQuery,
    monthlyHiredQuery,
    mergedTodaySchedules,
  };
};

export default useDashboardInfo;
