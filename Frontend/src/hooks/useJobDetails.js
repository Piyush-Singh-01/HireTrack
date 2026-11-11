import { useDispatch } from "react-redux";
import { setJobDetails } from "../store/slice/JobDetailsSlice";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/AxiosInstance";

// Fetching jobDetails by ID
const fetchJobById = async (jobId) => {
  try {
    const res = await axiosInstance.get(ApiRoutes.POSITION.JOBS.SCREEN(jobId));
    const jobDetails = res.data.data;
    // Handle the case where the data might be nested differently in the new response
    const finalData = jobDetails?.job || jobDetails;
    if (!finalData) throw new Error("No data found");
    return finalData;
  } catch (err) {
    if (err?.response?.status === 404) {
      // Drafts still use the old path for now or I should check if there's a new one
      const draftRes = await axiosInstance.get(`/api/jobs/draft/${jobId}`);
      const draftDetails = draftRes.data.data;
      if (!draftDetails) throw new Error("No data found");
      return draftDetails;
    }
    throw err;
  }
};

// Update or  Post job
const updateJob = async (jobData) => {
  const isDraft = Boolean(jobData?.isDraft);
  if (isDraft) {
    const res = await axiosInstance.post(
      `/api/jobs/publishDraft/${jobData._id}`,
      jobData
    );
    const publishedJob = res.data.data;
    if (!publishedJob) throw new Error("Failed to publish job");
    return publishedJob;
  }

  const res = await axiosInstance.put(
    ApiRoutes.POSITION.UPDATEJOB(jobData._id),
    jobData
  );
  const updatedJob = res.data.data;
  if (!updatedJob) throw new Error("Failed to update job");
  return updatedJob;
};

export const useJobDetails = (jobId) => {
  const dispatch = useDispatch();

  // Fetch existing job details
  const jobDetailsQuery = useQuery({
    queryKey: ["jobDetails", jobId],
    queryFn: async () => {
      const res = await fetchJobById(jobId);
      dispatch(setJobDetails(res));
      return res;
    },
  });

  // Mutation to update/post job
  const updateJobMutation = useMutation({
    mutationFn: updateJob,
    onSuccess: (data) => {
      dispatch(setJobDetails(data));
    },
    onError: (err) => console.error("Error updating job:", err),
  });

  return {
    ...jobDetailsQuery,
    updateJob: updateJobMutation.mutate,
    isUpdating: updateJobMutation.isLoading,
  };
};
