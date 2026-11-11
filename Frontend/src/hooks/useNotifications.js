import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useDispatch } from "react-redux";

import axiosInstance from "../utils/AxiosInstance";

import ApiRoutes from "../utils/ApiRoutes";



import {

  setApplicants,

  setFavourites,

  setReminders,

  deleteApplicant,

  deleteReminder,

} from "../store/slice/NotificationsSlice.js";



export const useNotifications = () => {

  const queryClient = useQueryClient();

  const dispatch = useDispatch();



  // Helper for all queries to fetch from the v1 endpoint

  const fetchAll = async () => {

    const res = await axiosInstance.get(ApiRoutes.NOTIFICATIONS.GET, {

      params: { type: "all" }, // Fetch all to allow client-side filtering

    });

    return Array.isArray(res.data.data) ? res.data.data : [];

  };



  // Main query that acts as the source of truth

  const notificationsQuery = useQuery({

    queryKey: ["notifications"],

    queryFn: fetchAll,

    refetchOnWindowFocus: true,

    refetchOnReconnect: true,

    refetchOnMount: true,

    staleTime: 30 * 1000, // 30 seconds

    cacheTime: 2 * 60 * 1000, // 2 minutes

  });



  // 1. All - Show all notifications

  const allNotifications = notificationsQuery.data || [];

  console.log("🎯 useNotifications hook RUNNING!", {

    totalFetched: allNotifications.length,

    favouritesCount: allNotifications.filter(n => n.isFavourite).length,

    nonFavouritesCount: allNotifications.filter(n => !n.isFavourite).length,

  });



  // 2. Reminders - Show all reminders

  const reminders = (notificationsQuery.data || []).filter(

    (n) => n.type === "reminder"

  );



  // 3. Applicants - Show all applicants

  const applicantsNotify = (notificationsQuery.data || []).filter(

    (n) => n.type === "applicant"

  );



  // 4. Favourites (type=all, isFavourite=true) - Show all favourite notifications

  const favourites = (notificationsQuery.data || []).filter(

    (n) => n.isFavourite === true,

  );



  const markAsReadMutation = useMutation({

    mutationFn: (id) =>

      axiosInstance.put(ApiRoutes.NOTIFICATIONS.UPDATE_ONE(id)),

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["notifications"] });

    },

  });



  const markAllAsReadMutation = useMutation({

    mutationFn: () =>

      axiosInstance.put(`${ApiRoutes.NOTIFICATIONS.UPDATE_MANY}?type=all`),

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["notifications"] });

    },

  });



  const toggleFavouriteMutation = useMutation({

    mutationFn: (id) =>

      axiosInstance.put(ApiRoutes.NOTIFICATIONS.UPDATE_FAVOURITE(id)),

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["notifications"] });

    },

  });



  const deleteApplicantMutation = useMutation({

    mutationFn: (id) => axiosInstance.delete(ApiRoutes.NOTIFICATIONS.DELETE_APPLICANT(id)),

    onSuccess: (_, id) => {

      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      dispatch(deleteApplicant(id));

    },

  });



  const deleteReminderMutation = useMutation({

    mutationFn: (id) => axiosInstance.delete(ApiRoutes.NOTIFICATIONS.DELETE_REMINDER(id)),

    onSuccess: (_, id) => {

      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      dispatch(deleteReminder(id));

    },

  });



  return {

    notificationsQuery,



    // Filtered data for UI

    allNotifications,

    reminders,

    applicantsNotify,

    favourites,



    markAsReadMutation,

    markAllAsReadMutation,

    toggleFavouriteMutation,



    deleteApplicantMutation,

    deleteReminderMutation,



    // Manual refresh function

    refetch: () => queryClient.refetchQueries({ queryKey: ["notifications"] }),

  };

};