import axiosInstance from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useToast } from "../utils/ToastContext";

const getErrorMessage = (err, defaultMsg) => {
  const serverMsg = err.response?.data?.message;
  const serverErr = err.response?.data?.error;

  // Handle specific database errors from MongoDB
  if (serverErr && typeof serverErr === "string") {
    if (serverErr.includes("E11000") && serverErr.includes("Email")) {
      return "User email already exists";
    }
    if (serverErr.includes("E11000") && serverErr.includes("ContactNumber")) {
      return "Contact number already exists";
    }
  }

  return serverMsg || err.message || defaultMsg || "An unexpected error occurred";
};

// FETCHED ALL
export const useGetAllUsers = () => {
  const { showToast } = useToast();
  return useQuery({
    queryKey: ["USERANDROLE"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(ApiRoutes.USERANDROLE.GET_ALL);
        return response.data.data;
      } catch (error) {
        if (error.response?.status === 404) {
          return [];
        }
        showToast(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch users",
          "error",
        );
        throw error;
      }
    },
  });
};

// GET USER BY ID
export const useGetUserById = (userId) => {
  const { showToast } = useToast();
  return useQuery({
    queryKey: ["USERANDROLE", userId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        ApiRoutes.USERANDROLE.GET_USER_ID(userId),
      );

      return res.data.data;
    },
    enabled: !!userId, // only run when userId exists
    onError: (err) => {
      showToast(
        err?.response?.data?.message || "Get user by ID error",
        "error",
      );
    },
  });
};

// ADD USER
export const useAddUser = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(ApiRoutes.USERANDROLE.ADD, data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["USERANDROLE"] });
      showToast(data.message || "User added successfully", "success");
    },
    onError: (err) => {
      const message = getErrorMessage(err, "Failed to add user");
      showToast(message, "error");
      console.error("Add user error:", err.response?.data || err);
    },
  });
};

// UPDATE USING ID
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ _id, ...data }) => {
      const res = await axiosInstance.put(
        ApiRoutes.USERANDROLE.UPDATE(_id),
        data,
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["USERANDROLE"] });
      showToast(data.message || "User updated successfully", "success");
    },
    onError: (err) => {
     //for better ui the toast is changed in an understandable manner
      const message = getErrorMessage(err, "Failed to update user");
      showToast(message, "error");
      console.error("Update error:", err.response?.data || err);
    },
  });
};

// DISABLE & ENABLE ACCOUNT TOGGLE
const toggleUserStatus = async (userId) => {
  const { data } = await axiosInstance.put(
    ApiRoutes.USERANDROLE.DISABLE_AND_ENABLE_TOGGLE(userId),
  );
  return data;
};

export const useDisableAccountToggle = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: toggleUserStatus,

    onSuccess: (data) => {
      showToast(data.message || "User status updated successfully", "success");
      queryClient.invalidateQueries({
        queryKey: ["USERANDROLE"],
      });
    },

    onError: (error) => {
      const message = getErrorMessage(error, "Failed to update user status");
      showToast(message, "error");
    },
  });
};

// DELETE USER USING ID
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (_id) => {
      const res = await axiosInstance.delete(ApiRoutes.USERANDROLE.DELETE(_id));
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["USERANDROLE"] });
      showToast(data.message || "User deleted successfully", "success");
    },
    onError: (err) => {
      const message = getErrorMessage(err, "Failed to delete user");
      showToast(message, "error");
      console.error("Delete user error:", err.response?.data || err);
    },
  });
};

// GET HIRING MANAGERS
export const useGetHiringManagers = () => {
  const { showToast } = useToast();
  return useQuery({
    queryKey: ["HIRING_MANAGERS"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(ApiRoutes.USERANDROLE.HIRING_MANAGERS);
        return response.data.data;
      } catch (error) {
        showToast(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch hiring managers",
          "error"
        );
        throw error;
      }
    },
  });
};
