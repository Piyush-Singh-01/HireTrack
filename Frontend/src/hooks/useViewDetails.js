import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";

// Fetch job description by job ID
const fetchJobDescription = async (jobId) => {
  
  if (!jobId) {
    throw new Error("Job ID is required");
  }
  
  try {
    // First try the main job endpoint
    const res = await axiosInstance.get(ApiRoutes.POSITION.JOBS.SCREEN(jobId));
    const jobDetails = res.data.data;
    
    // Handle the case where the data might be nested differently in the new response
    const finalData = jobDetails?.job || jobDetails;
    
    if (!finalData) {
      throw new Error("No job description found");
    }
    
    return finalData;
  } catch (err) {
    // If main endpoint returns 404, try the draft endpoint
    if (err?.response?.status === 404) {
      try {
        const draftRes = await axiosInstance.get(`/api/jobs/draft/${jobId}`);
        const draftDetails = draftRes.data.data;
        
        if (!draftDetails) {
          throw new Error("No job description found");
        }
        
        return draftDetails;
      } catch (draftErr) {
        throw new Error("No job description found");
      }
    }
    throw err;
  }
};

export const useViewDetails = (jobId) => {
  
  const jobDescriptionQuery = useQuery({
    queryKey: ["jobDescription", jobId],
    queryFn: () => fetchJobDescription(jobId),
    enabled: !!jobId, // Only run query if jobId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return {
    ...jobDescriptionQuery,
    jobDescription: jobDescriptionQuery.data,
    isLoading: jobDescriptionQuery.isLoading,
    error: jobDescriptionQuery.error,
    refetch: jobDescriptionQuery.refetch,
  };
};

const fetchJobDetails = async (jobId) => {
  if (!jobId) {
    throw new Error("Job ID is required");
  }

  const url = ApiRoutes.POSITION.JOBS.SCREEN(jobId);

  try {
    const res = await axiosInstance.get(url);

    if (!res.data.success) {
      throw new Error("Failed to fetch job details");
    }

    return res.data.data;
  } catch (error) {
    throw error;
  }
};

export const useJobDetails = (jobId) => {
  const query = useQuery({
    queryKey: ["jobDetails", jobId],
    queryFn: () => fetchJobDetails(jobId),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return {
    ...query,
    jobDetails: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};