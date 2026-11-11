import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";

const useMeetingSettings = (id) => {
  const queryClient = useQueryClient();

  // Local override for current selection (optional)
  const [currentOverride, setCurrentOverride] = useState(null);
  const [localError, setLocalError] = useState(null);

  // Fetch current meeting settings (when no id provided)
  const {
    data: currentData = null,
    isLoading: isCurrentLoading,
    isFetching: isCurrentFetching,
    error: currentError,
  } = useQuery({
    queryKey: ["meetingSettings"],
    queryFn: async () => {
      const res = await axiosInstance.get(ApiRoutes.MEETINGS.GET_ALL);
      const data = res.data?.data?.meetingSettings || res.data?.data || res.data;
      return data || null;
    },
  });

  // Fetch item by id (when id provided)
  const {
    data: itemData = null,
    isLoading: isItemLoading,
    isFetching: isItemFetching,
    error: itemError,
  } = useQuery({
    queryKey: ["meetingSettings", id],
    queryFn: async () => {
      const res = await axiosInstance.get(ApiRoutes.MEETINGS.GET_BY_ID(id));
      return res.data?.data?.meetingSettings || res.data?.data || res.data;
    },
    enabled: Boolean(id),
  });

  const list = useMemo(() => [], []);

  // Derive current: prioritise explicit id fetch, then local override, then current data
  const current = useMemo(() => {
    if (id) return itemData ?? null;
    if (currentOverride) return currentOverride;
    return currentData ?? null;
  }, [id, itemData, currentOverride, currentData]);

  const isReading = isItemLoading || isItemFetching || isCurrentLoading || isCurrentFetching;
  const queryError = itemError || currentError;

  // Create
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post(ApiRoutes.MEETINGS.CREATE, payload);
      return res.data?.data?.meetingSettings || res.data?.data || res.data;
    },
    onSuccess: (created) => {
      // Optimistically set current to created
      setCurrentOverride(created || null);
      queryClient.invalidateQueries({ queryKey: ["meetingSettings"] });
      queryClient.refetchQueries({ queryKey: ["meetingSettings"] });
    },
    onError: (err) => setLocalError(err),
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: async ({ id: targetId, payload }) => {
      const res = await axiosInstance.put(ApiRoutes.MEETINGS.UPDATE(targetId), payload);
      return res.data?.data?.meetingSettings || res.data?.data || res.data;
    },
    onSuccess: (updated) => {
      setCurrentOverride(updated || null);
      queryClient.invalidateQueries({ queryKey: ["meetingSettings"] });
      queryClient.refetchQueries({ queryKey: ["meetingSettings"] });
      if (updated?._id) {
        queryClient.invalidateQueries({ queryKey: ["meetingSettings", updated._id] });
      }
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["meetingSettings", id] });
      }
    },
    onError: (err) => setLocalError(err),
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (targetId) => {
      const res = await axiosInstance.delete(ApiRoutes.MEETINGS.DELETE(targetId));
      return { id: targetId, data: res.data };
    },
    onSuccess: (result) => {
      // If deleted current, clear override
      if (current?._id === result?.id) setCurrentOverride(null);
      queryClient.invalidateQueries({ queryKey: ["meetingSettings"] });
      queryClient.refetchQueries({ queryKey: ["meetingSettings"] });
      if (result?.id) queryClient.invalidateQueries({ queryKey: ["meetingSettings", result.id] });
      if (id) queryClient.invalidateQueries({ queryKey: ["meetingSettings", id] });
    },
    onError: (err) => setLocalError(err),
  });

  const loading = isReading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const error = localError || queryError || createMutation.error || updateMutation.error || deleteMutation.error || currentError;

  const setCurrent = useCallback((data) => setCurrentOverride(data ?? null), []);
  const clearError = useCallback(() => setLocalError(null), []);

  // Wrapper functions to match component expectations (return Promise)
  const createItem = useCallback((payload) => createMutation.mutateAsync(payload), [createMutation]);
  const updateItem = useCallback((payload) => updateMutation.mutateAsync(payload), [updateMutation]);
  const deleteItem = useCallback((targetId) => deleteMutation.mutateAsync(targetId), [deleteMutation]);

  return {
    list,
    current,
    loading,
    error,
    setCurrent,
    createItem,
    updateItem,
    deleteItem,
    clearError,
  };
};

export default useMeetingSettings;

