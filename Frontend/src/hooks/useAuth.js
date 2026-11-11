import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setCredentials,
  logout as logoutAction,
} from "../store/slice/LoginSlice";
import axiosInstance from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";
import { useToast } from "../utils/ToastContext";

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    mutate: login,
    isLoading,
    error,
  } = useMutation({
    mutationFn: async (formData) => {
      const response = await axiosInstance.post(
        ApiRoutes.USERS.LOGIN,
        formData,
      );
      return response.data;
    },
    onSuccess: (data) => {
      dispatch(setCredentials(data));
      showToast(data.message, "success");
      navigate("/dashboard");
    },
    onError: (error) => {
      let errorMessage = "An error occurred, Please try again!";
      if (!error?.success) errorMessage = error.response?.data?.message;
      console.error(errorMessage);
      showToast(errorMessage, "error");
    },
  });

  const logout = () => {
    dispatch(logoutAction());
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    showToast("Logged out!", "success");
    navigate("/");
  };

  return {
    login,
    logout,
    isLoading,
    error,
  };
};

export default useAuth;
