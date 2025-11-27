import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { RatingItem } from './types';

interface RatingStatsResponse {
  average: number;
  count: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recent_ratings: RatingItem[];
}

// 별점 통계 조회 (사용자별 별점 포함)
export const useRatingStats = (restaurantId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['ratingStats', restaurantId],
    queryFn: async () => {
      const { data } = await apiClient.get<RatingStatsResponse>(`/restaurants/${restaurantId}/ratings`);
      return data;
    },
    enabled: enabled && !!restaurantId,
  });
};

