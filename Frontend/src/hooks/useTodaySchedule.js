import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";

//Fetching Today's Schedule data through api
const fetchTodaysSchedule = async () => {
  const res = await axiosInstance.get(ApiRoutes.SCHEDULE.TODAY);
  return res.data;
};

//Use Query
export const useTodaySchedule = () => {
  const todayScheduleQuery = useQuery({
    queryKey: ["todaySchedule"],
    queryFn: fetchTodaysSchedule,
  });

  return {
    todayScheduleQuery,
  };
};
