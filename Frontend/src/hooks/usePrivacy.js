// src/hooks/usePrivacy.js
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  setLoading,
  setPrivacyData,
  setError,
  setMessage,
} from "../store/slice/privacySlice";
import axiosInstance from "../utils/AxiosInstance";

export const usePrivacy = () => {
  const dispatch = useDispatch();
  const { data, loading, error, message } = useSelector(
    (state) => state.privacy
  );

  // CREATE
  const createPrivacy = async (formData) => {
    try {
      dispatch(setLoading(true));
      const { data } = await axiosInstance.post(
        "/api/privacy-security/create",
        formData
      );
      dispatch(setPrivacyData(data));
      dispatch(setMessage("Privacy created successfully"));
    } catch (err) {
      dispatch(setError(err.response?.data || err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // GET
  const getPrivacy = async (id) => {
    try {
      dispatch(setLoading(true));
      const { data } = await axiosInstance.get(
        `/api/privacy-security/get/${id}`
      );
      dispatch(setPrivacyData(data));
    } catch (err) {
      dispatch(setError(err.response?.data || err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // UPDATE
  const updatePrivacy = async (id, formData) => {
    try {
      dispatch(setLoading(true));
      const { data } = await axiosInstance.put(
        `/api/privacy-security/update/${id}`,
        formData
      );
      dispatch(setPrivacyData(data));
      dispatch(setMessage("Privacy updated successfully"));
    } catch (err) {
      dispatch(setError(err.response?.data || err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // DELETE
  const deletePrivacy = async (id) => {
    try {
      dispatch(setLoading(true));
      const { data } = await axiosInstance.delete(
        `/api/privacy-security/delete/${id}`
      );
      dispatch(setPrivacyData(null));
      dispatch(setMessage(data.message));
    } catch (err) {
      dispatch(setError(err.response?.data || err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    data,
    loading,
    error,
    message,
    createPrivacy,
    getPrivacy,
    updatePrivacy,
    deletePrivacy,
  };
};
