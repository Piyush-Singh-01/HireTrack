import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../utils/AxiosInstance";
import ApiRoutes from "../../utils/ApiRoutes";
import { useToast } from "../../utils/ToastContext";

export const useChangePassword = () => {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ email, currentPassword, newPassword }) => {
      const res = await axiosInstance.post(ApiRoutes.PRIVACY.CHANGE_PASSWORD, {
        email,
        currentPassword,
        newPassword,
      });
      return res.data;
    },

    onSuccess: (data) => {
      showToast(data.message || "Password changed successfully", "success");
    },

    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to change password";
      showToast(message, "error");
    },
  });
};

// export const useDisableAccount = () => {
//   const { showToast } = useToast();

//   return useMutation({
//     mutationFn: async (payload) => {
//       const { data } = await axiosInstance.post(
//         ApiRoutes.PRIVACY.DISABLE_ACCOUNT,
//         payload
//       );
//       return data;
//     },
//     onSuccess: (data) => {
//       showToast(data.message || "Account disabled", "success");
//     },
//     onError: (error) => {
//       showToast(
//         error?.response?.data?.message || "Disable account failed",
//         "error"
//       );
//     },
//   });
// };

// export const deleteAccount = useMutation({
//   mutationFn: async (payload) => {
//     const { data } = await axiosInstance.post(
//       ApiRoutes.PRIVACY.DELETE_ACCOUNT,
//       payload,
//     );
//     return data;
//   },
//   onSuccess: (data) => {
//     showToast(data.message, "success");
//   },
//   onError: (error) => {
//     showToast(
//       error?.response?.data?.message || "Delete account failed",
//       "error",
//     );
//   },
// });
