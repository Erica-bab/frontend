import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import {
  CafeteriaResponse,
  CafeteriaParams,
} from '@/api/cafeteria/types';

export const useCafeteria = (params: CafeteriaParams) => {
  // 디테일 정보는 기본적으로 항상 받는 게 편하니까 기본값 true로
  const finalParams: CafeteriaParams = {
    ...params,
    cafeteria_details:
      params.cafeteria_details !== undefined
        ? params.cafeteria_details
        : true,
  };

  return useQuery<CafeteriaResponse, Error>({
    queryKey: [
      'cafeteriaMenu',
      finalParams.year,
      finalParams.month,
      finalParams.day,
      finalParams.restaurant_codes ?? null,
      finalParams.meal_types ?? null,
      finalParams.cafeteria_details ?? null,
    ],
    queryFn: async () => {
      const { data } = await apiClient.get<CafeteriaResponse>(
        '/cafeteria/meals',
        { params: finalParams },
      );
      return data;
    },
  });
};
