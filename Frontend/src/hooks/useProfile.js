import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
// import {
//   setProfiles,
//   addProfile,
//   updateProfile,
//   deleteProfile,
// } from "../store/slice/ProfileSlice";
import axiosInstance from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";

// export const useProfiles = () => {
//   const dispatch = useDispatch();
//   const queryClient = useQueryClient();

//   // GET all profiles
//   const { data: profiles = [], isLoading } = useQuery({
//     queryKey: ["profiles"],
//     queryFn: async () => {
//       const res = await axiosInstance.get("/api/profile/");
//       console.log("get All profile", res.data);
//       dispatch(setProfiles(res.data));
//       return res.data;
//     },
//   });

//   // get a single profile
//   // const getProfilebyId = useMutation({
//   //   mutationFn: async (id) => {
//   //     const res = await axiosInstance.get(ApiRoutes.PROFILE.GET_USER_ID);
//   //     console.log(res);
//   //     return res.data;
//   //   },
//   //   onSuccess: (id) => {
//   //     dispatch(getProfilebyId(res.data));
//   //     queryClient.invalidateQueries(["profile"]);
//   //   },
//   // });

//   const getProfilebyId = async (id) => {
//   const res = await axiosInstance.get(
//     ApiRoutes.PROFILE.GET_USER_ID(id)
//   );
//   return res.data;
// };

//   // CREATE profile
//   // const createProfile = useMutation({
//   //   mutationFn: async (formData) => {
//   //     const res = await axiosInstance.post("/api/profile/create", formData, {
//   //       headers: { "Content-Type": "multipart/form-data" },
//   //     });
//   //     console.log("created", res.data.data);
//   //     return res.data.data;
//   //   },
//   //   onSuccess: (data) => {
//   //     dispatch(addProfile(data));
//   //     queryClient.invalidateQueries(["profiles"]);
//   //   },
//   // });

//   // CREATE PROFILE
//     const createProfile = useMutation({
//       mutationFn: async (formData) => {
//         const response = await axiosInstance.post(
//           ApiRoutes.PROFILE.ADD,
//           formData,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         );
//         console.log(response.data);
//         return response.data;

//       },
//       onSuccess: () => {
//         console.success("Profile created successfully");
//         queryClient.invalidateQueries(["profiles"]);
//       },
//       onError: (error) => {
//         console.error(
//           error?.response?.data?.message || "Failed to create profile"
//         );
//       },
//     });

//   // UPDATE profile
//   const editProfile = useMutation({
//     mutationFn: async ({ id, formData }) => {
//       const res = await axiosInstance.put(`/api/profile/${id}`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       console.log("updated", res.data.data);
//       return res.data.data;
//     },
//     onSuccess: (data) => {
//       dispatch(updateProfile(data));
//       queryClient.invalidateQueries(["profiles"]);
//     },
//   });

//   // DELETE profile
//   const removeProfile = useMutation({
//     mutationFn: async (id) => {
//       await axiosInstance.delete(`/api/profile/${id}`);
//       return id;
//     },
//     onSuccess: (id) => {
//       dispatch(deleteProfile(id));
//       queryClient.invalidateQueries(["profiles"]);
//     },
//   });

//   return {
//     profiles,
//     isLoading,
//     createProfile,
//     editProfile,
//     removeProfile,
//     getProfilebyId
//   };
// };

export const useGetUserById = (userId) => {
  return useQuery({
    queryKey: ["PROFILE", userId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        ApiRoutes.PROFILE.GET_USER_ID(userId),
      );
      return res.data?.data;
    },
    enabled: Boolean(userId), // run only when userId exists
    retry: 1,
    onError: (err) => {
      console.error(
        "Get user by ID error:",
        err?.response?.data || err.message,
      );
    },
  });
};
