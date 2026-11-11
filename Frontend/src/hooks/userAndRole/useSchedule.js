import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../utils/AxiosInstance";
import ApiRoutes from "../../utils/ApiRoutes";
import { useToast } from "../../utils/ToastContext";

const getSchedules = async ({ queryKey }) => {
  const [, filters] = queryKey;

  const { data } = await axiosInstance.get(
    ApiRoutes.SCHEDULE.GET,
    {
      params: {
        type: filters?.type,
        position: filters?.position,
        status: filters?.status
      }
    }
  );

  return data.data; // schedules array
};

const useGetSchedules = (filters = {}) => {
  const { showToast } = useToast();

  return useQuery({
    queryKey: ["schedules", filters],
    queryFn: getSchedules,
    onError: (error) => {
      showToast(
        error?.response?.data?.message || "Failed to fetch schedules",
        "error"
      );
    },
    keepPreviousData: true
  });
};

export default useGetSchedules;
