import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../utils/AxiosInstance";
import ApiRoutes from "../../utils/ApiRoutes";

const getProfileApi = async () => {
  const { data } = await axiosInstance.get(ApiRoutes.PROFILE.GET);
  return data.data;
};

export const useGetProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfileApi,
  });
};