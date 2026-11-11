import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";

const getTemplateApi = async () => {
  const { data } = await axiosInstance.get(ApiRoutes.OFFER_LETTER_TEMPLATE.GET);
  return data.data;
};

const saveTemplateApi = async (templateData) => {
  const { data } = await axiosInstance.post(ApiRoutes.OFFER_LETTER_TEMPLATE.SAVE, templateData);
  return data.data;
};

export const useGetOfferLetterTemplate = (jobId) => {
  return useQuery({
    queryKey: ["offerLetterTemplate", jobId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`${ApiRoutes.OFFER_LETTER_TEMPLATE.GET}?jobId=${jobId}`);
      return data.data;
    },
    enabled: !!jobId,
  });
};

export const useSaveOfferLetterTemplate = (jobId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveTemplateApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["offerLetterTemplate", jobId]);
    },
  });
};

export const useSendOfferLetter = () => {
  return useMutation({
    mutationFn: async ({ jobId, candidateIds, templateData }) => {
      const { data } = await axiosInstance.post(ApiRoutes.OFFER_LETTER_TEMPLATE.SEND, {
        jobId,
        candidateIds,
        templateData,
      });
      return data;
    },
  });
};
