import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import {
  CafeteriaResponse,
  CafeteriaParams,
} from '@/api/cafeteria/types';

export const useCafeteria = async (p: CafeteriaParams) => {
  return useQuery({
    queryKey: ['cafeteria', p],
      queryFn: async () => {
        const { data } = await apiClient.get<CafeteriaResponse>('/restaurants', { params: p });
        return data;
      }
  });
};