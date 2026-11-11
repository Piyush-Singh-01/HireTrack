import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";

// ================= GET ALL CALENDAR EVENTS =================
export const useGetAllCalendar = () => {
  return useQuery({
    queryKey: ["calendar-all"],
    queryFn: async () => {
      const res = await axiosInstance.get(ApiRoutes.CALENDER.GET_ALL);
      return res.data;
    },
  });
};

// ================= GET SINGLE CALENDAR =================
export const useGetCalendarById = (id) => {
  return useQuery({
    queryKey: ["calendar", id],
    queryFn: async () => {
      const res = await axiosInstance.get(ApiRoutes.CALENDER.GET(id));
      return res.data;
    },
    enabled: !!id, // runs only if id exists
  });
};