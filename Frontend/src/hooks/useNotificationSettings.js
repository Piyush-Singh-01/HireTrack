import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";

export const UseNotificationSettings = (userId) => {
  // ================= GET =================
  const getQuery = useQuery({
    queryKey: ["notifications-settings", userId],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(
          ApiRoutes.SETTINGSNOTIFICATIONS.GET(userId),
        );
        return res.data;
      } catch (error) {
        if (error?.response?.status === 404) {
          return null;
        }
        throw error; 
      }
    },
    enabled: !!userId,
  });

  // ================= CREATE =================
  const createProfile = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(
        ApiRoutes.SETTINGSNOTIFICATIONS.CREATE(userId),
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      getQuery.refetch();
    },
  });

  // ================= UPDATE =================
  const updateProfile = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put(
        ApiRoutes.SETTINGSNOTIFICATIONS.UPDATE(userId),
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      getQuery.refetch();
    },
  });

  // ================= DELETE =================
  const deleteProfile = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.delete(
        ApiRoutes.SETTINGSNOTIFICATIONS.DELETE(userId),
      );
      return res.data;
    },
    onSuccess: () => {
      getQuery.refetch();
    },
  });

  return {
    ...getQuery,
    createProfile,
    updateProfile,
    deleteProfile,
  };
};
