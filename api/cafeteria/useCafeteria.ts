import { useQuery, useMutation, } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '@/api/client';
import { useAuth } from '@/api/auth/useAuth';
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
        '/cafeteria/meals/',
        { params: finalParams },
      );
      return data;
    },
    enabled: true, // 항상 쿼리 실행 보장
    refetchOnMount: true, // 마운트 시 캐시가 있으면 먼저 표시, 백그라운드에서 새로고침
    staleTime: 0, // 데이터를 즉시 stale로 처리하여 항상 최신 데이터 유지
    gcTime: 5 * 60 * 1000, // 캐시 유지 시간 (기존 cacheTime)
    refetchInterval: 5 * 60 * 1000, // 5분마다 자동 새로고침
    // 캐시된 데이터를 즉시 표시하여 빠른 탭 전환 시에도 화면이 바로 보이도록 보장
    placeholderData: (previousData) => previousData,
  });
};

// get like
export const useCafeteriaLike = ({ meal_id }: CafeteriaLikeParams) => {
  const { isAuthenticated } = useAuth();

  return useQuery<CafeteriaLikeResponse, AxiosError<CafeteriaLikeErrorResponse>>({
    queryKey: ['cafeteriaLike', meal_id],
    queryFn: async () => {
      const { data } = await apiClient.get<CafeteriaLikeResponse>(
        `/cafeteria/meals/${meal_id}/likes`
      );
      return data;
    },
    enabled: !!isAuthenticated, // 로그인한 경우에만 쿼리 실행
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