import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../utils/AxiosInstance';

const filterQueryKeys = {
  all: ['schedule-filters'],
  dateRange: (from, to) => [...filterQueryKeys.all, 'date-range', { from, to }],
  byFields: (position, status) => [...filterQueryKeys.all, 'by-fields', { position, status }],
};

const filterApi = {
  fetchByDateRange: async ({ from, to }) => {
    const params = { From: from, To: to };
    const response = await axiosInstance.get(ApiRoutes.SCHEDULE_FILTERS.DATE_RANGE, { params });
    const data = Array.isArray(response.data?.data) ? response.data.data : response.data;
    return data;
  },
  fetchByFields: async ({ position, status }) => {
    const params = { Position: position, Status: status };
    const response = await axiosInstance.get(ApiRoutes.SCHEDULE_FILTERS.BY_FIELDS, { params });
    const data = Array.isArray(response.data?.data) ? response.data.data : response.data;
    return data;
  },
};

export const useSchedulesByDateRange = ({ from, to }) => {
  const enabled = Boolean(from) && Boolean(to);
  return useQuery({
    queryKey: filterQueryKeys.dateRange(from, to),
    queryFn: () => filterApi.fetchByDateRange({ from, to }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSchedulesByPositionStatus = ({ position, status }) => {
  const enabled = Boolean(position) && position !== 'All Position' && Boolean(status) && status !== 'All Status';
  return useQuery({
    queryKey: filterQueryKeys.byFields(position, status),
    queryFn: () => filterApi.fetchByFields({ position, status }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};


