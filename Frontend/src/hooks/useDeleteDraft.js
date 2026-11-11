import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";

const deleteDraftApi = async (id) => {
  const res = await axiosInstance.delete(
    ApiRoutes.DRAFT.DELETE(id)
  );
  return res.data;
};

export const useDeleteDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDraftApi,

    onSuccess: (data, id) => {
      // 🔄 invalidate relevant queries
      queryClient.invalidateQueries(["jobs"]);
      queryClient.invalidateQueries(["draftJobs"]);

      console.log("Draft deleted successfully:", data);
    },

    onError: (error) => {
      console.error(
        "Delete Draft Error:",
        error?.response?.data || error.message
      );
    },
  });
};