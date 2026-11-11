import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";

export const useAnalytics = (position) => {
  // Use the consolidated summary endpoint
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

  // Mock compatibility for Conversion Rate chart
  const interviewAnalyticsQuery = {
    ...summaryQuery,
    data: {
      applied: data?.charts?.conversionRate?.applied || 0,
      selected: data?.summary?.shortlisted || 0, // Mapping shortlisted to 'Selected' for the funnel
      hired: data?.charts?.conversionRate?.hired || 0,
      percentage: data?.charts?.conversionRate?.percentage || 0
    }
  };

  return {
    interviewAnalyticsQuery,
  };
};
