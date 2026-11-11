import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../utils/AxiosInstance";
import ApiRoutes from "../../utils/ApiRoutes";
import { useToast } from "../../utils/ToastContext";

export const useGetNotification = (userId) => {
  return useQuery({
    queryKey: ["notification", userId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        ApiRoutes.SETTINGSNOTIFICATIONS.GET(userId),
      );
      return res.data.data;
    },
    enabled: !!userId,
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, payload }) => {
      const res = await axiosInstance.post(
        ApiRoutes.SETTINGSNOTIFICATIONS.CREATE(userId),
        payload,
      );
      return res.data;
    },
    onSuccess: (data, variables) => {
      showToast(data.message, "success");
      queryClient.invalidateQueries(["notification", variables.userId]);
    },
    onError: (err) => {
      showToast(err.response?.data?.message || "Creation failed", "error");
    },
  });
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, payload }) => {
      const res = await axiosInstance.put(
        ApiRoutes.SETTINGSNOTIFICATIONS.UPDATE(userId),
        payload,
      );
      return res.data;
    },
    onSuccess: (data, variables) => {
      showToast(data.message, "success");
      queryClient.invalidateQueries(["notification", variables.userId]);
    },
    onError: (err) => {
      showToast(err.response?.data?.message || "Update failed", "error");
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (userId) => {
      const res = await axiosInstance.delete(
        ApiRoutes.SETTINGSNOTIFICATIONS.DELETE(userId),
      );
      return res.data;
    },
    onSuccess: (data, userId) => {
      showToast(data.message, "success");
      queryClient.removeQueries(["notification", userId]);
    },
    onError: (err) => {
      showToast(err.response?.data?.message || "Delete failed", "error");
    },
  });
};
