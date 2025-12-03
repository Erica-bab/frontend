import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { RatingItem } from './types';
import { useMyFavorites } from '../user/useUserActivity';

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
export const useRatingStats = (restaurantId: number, enabled: boolean = true, options?: { refetchInterval?: number }) => {
  return useQuery({
    queryKey: ['ratingStats', restaurantId],
    queryFn: async () => {
      const { data } = await apiClient.get<RatingStatsResponse>(`/restaurants/${restaurantId}/ratings`);
      return data;
    },
    enabled: enabled && !!restaurantId,
    refetchInterval: options?.refetchInterval,
  });
};

// 현재 사용자의 별점 조회 (/users/me/activities?category=favorites 사용)
export const useMyRating = (restaurantId: number, enabled: boolean = true) => {
  const { data: favorites, refetch: refetchFavorites } = useMyFavorites(1, 100, enabled);

  // 특정 식당에 대한 내 별점 찾기
  const myFavorite = favorites?.find(
    (favorite) => favorite.restaurant_id === restaurantId
  );

  return { 
    myRating: myFavorite?.rating || 0, 
    refetchRatingStats: refetchFavorites 
  };
};

