import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../utils/AxiosInstance"; 
import { ApiRoutes } from "../utils/ApiRoutes"; 
export const useRegister = () => {
  return useMutation({
    mutationFn: async (formData) => {
      const res = await axiosInstance.post(ApiRoutes.USERS.REGISTER, formData);
      return res.data;
    },
  });
};