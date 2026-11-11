import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../utils/AxiosInstance";
import ApiRoutes from "../../utils/ApiRoutes";

const updateProfileApi = async (formData) => {
  const { data } = await axiosInstance.put(
    ApiRoutes.PROFILE.UPDATE,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};

const useSaveProfile = () => {
  return useMutation({
    mutationFn: async ({ formData }) => {
      return await updateProfileApi(formData);
    },
  });
};

export default useSaveProfile;