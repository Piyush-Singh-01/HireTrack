import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../utils/AxiosInstance";
import ApiRoutes from "../../utils/ApiRoutes";
import { useToast } from "../../utils/ToastContext";

const use2FA = () => {
  const { showToast } = useToast();

  const enable2FA = useMutation({
    mutationFn: async (email) => {
      const { data } = await axiosInstance.post(ApiRoutes.PRIVACY.ENABLE_2FA, {
        email,
      });
      return data;
    },
    onSuccess: (data) => {
      showToast(data.message || "2FA code sent", "success");
    },
    onError: (error) => {
      showToast(
        error?.response?.data?.message || "Failed to send 2FA code",
        "error",
      );
    },
  });

  const verify2FA = useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosInstance.post(
        ApiRoutes.PRIVACY.VERIFY_2FA,
        payload,
      );
      return data;
    },
    onSuccess: (data) => {
      showToast(data.message || "2FA verified successfully", "success");
    },
    onError: (error) => {
      showToast(
        error?.response?.data?.message || "Invalid or expired code",
        "error",
      );
    },
  });

  return {
    enable2FA,
    verify2FA,
  };
};

export default use2FA;
