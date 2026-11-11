import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../utils/AxiosInstance";
import {
  setApp,
  addApp,
  updateApp,
  deleteApp,
} from "../store/slice/applicationSlice";
import ApiRoutes from "../utils/ApiRoutes";

export const useApplication = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // ✅ Get single application
  const getApp = async (id) => {
    const res = await axiosInstance.get(ApiRoutes.APPLICATION.GET_APP(id));
    return res.data;
  };

  // ✅ Create new application
  const createApp = useMutation({
    mutationFn: async (newApp) => {
      const res = await axiosInstance.post(
        ApiRoutes.APPLICATION.CREATE,
        newApp
      );
      return res.data;
    },
    onSuccess: (data) => {
      dispatch(addApp(data));
      queryClient.invalidateQueries(["applications"]);
    },
  });

  // ✅ Update application
  const editApp = useMutation({
    mutationFn: async ({ id, updates }) => {
      const res = await axiosInstance.put(
        ApiRoutes.APPLICATION.EDIT_APP(id),
        updates
      );
      return res.data;
    },
    onSuccess: (data) => {
      dispatch(updateApp(data));
      queryClient.invalidateQueries(["applications"]);
    },
  });

  // ✅ Delete application
  const removeApp = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.delete(ApiRoutes.APPLICATION.DELETE_APP(id));
      return id;
    },
    onSuccess: (id) => {
      dispatch(deleteApp(id));
      queryClient.invalidateQueries(["applications"]);
    },
  });

  return {
    getApp,
    createApp,
    editApp,
    removeApp,
  };
};
