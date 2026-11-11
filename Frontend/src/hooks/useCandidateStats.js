import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/AxiosInstance";

//Fetching through api
const fetchCandidateStats = async (role) => {
  const res = await axiosInstance.post("/api/candidateinterview/dashboard", {
    role,
  });
  return res.data;
};

//Use Query
export const useCandidateStats = (role) => {
  const candidateStatsQuery = useQuery({
    queryKey: ["candidateStats", role],
    queryFn: () => fetchCandidateStats(role),
  });

  return {
    candidateStatsQuery,
  };
};
