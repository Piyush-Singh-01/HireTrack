import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";

const useGoogleCalendar = () => {
  const [form, setForm] = useState({
    clientid: "",
    clientsecret: "",
  });

  // Save credentials mutation
  const {
    mutateAsync: saveCredentials,
    isPending: isSaving,
  } = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.put(
        ApiRoutes.GOOGLE_CALENDAR.ADD_CREDENTIALS,
        payload
      );
      return res.data;
    },
  });

  // Connect — redirect with token in URL
  const connectCalendar = () => {
    const token = localStorage.getItem("token");
    const url = `${axiosInstance.defaults.baseURL}${ApiRoutes.GOOGLE_CALENDAR.CONNECT}?token=${token}`;
    window.location.href = url;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (showToast) => {
    try {
      const res = await saveCredentials(form);
      showToast(res?.message || "Credentials saved successfully", "success");
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to save credentials",
        "error"
      );
    }
  };

  return {
    form,
    handleChange,
    handleSave,
    connectCalendar,
    isSaving,
  };
};

export default useGoogleCalendar;