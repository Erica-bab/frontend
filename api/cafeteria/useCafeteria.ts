import { useQuery, useMutation, } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '@/api/client';
import {
  CafeteriaResponse,
  CafeteriaParams,
  CafeteriaLikeParams,
  CafeteriaLikeResponse,
  CafeteriaLikeErrorResponse,
  CafeteriaLikeToggleResponse,
  CafeteriaLikeToggleBody,
} from '@/api/cafeteria/types';

export const useCafeteria = (params: CafeteriaParams) => {
  // base true
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

// get like
export const useCafeteriaLike = ({ meal_id }: CafeteriaLikeParams) => {
  return useQuery<CafeteriaLikeResponse, AxiosError<CafeteriaLikeErrorResponse>>({
    queryKey: ['cafeteriaLike', meal_id],
    queryFn: async () => {
      const { data } = await apiClient.get<CafeteriaLikeResponse>(
        `/cafeteria/meals/${meal_id}/likes`
      );
      return data;
    },
  });
};

// post like
type ToggleError = AxiosError<CafeteriaLikeErrorResponse>;

export const useToggleCafeteriaLike = () =>
  useMutation<
    CafeteriaLikeToggleResponse,
    ToggleError,
    CafeteriaLikeParams
  >({
    mutationFn: async ({ meal_id }) => {
      const body: CafeteriaLikeToggleBody = { is_like: true };

      const { data } = await apiClient.post<CafeteriaLikeToggleResponse>(
        `/cafeteria/meals/${meal_id}/like`,
        body,
      );

      return data;
    },
  });