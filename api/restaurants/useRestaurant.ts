import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import {
  RestaurantListResponse,
  RestaurantDetailResponse,
  RestaurantListParams,
  CommentListParams,
  CreateRatingRequest,
  CreateCommentRequest,
  CommentItem,
} from './types';

export const useRestaurantList = (params?: RestaurantListParams) => {
  return useQuery({
    queryKey: ['restaurants', params],
    queryFn: async () => {
      const { data } = await apiClient.get<RestaurantListResponse>('/restaurants', { params });
      return data;
    },
  });
};

export const useRestaurantDetail = (restaurantId: number) => {
  return useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: async () => {
      const { data } = await apiClient.get<RestaurantDetailResponse>(`/restaurants/${restaurantId}`);
      return data;
    },
    enabled: !!restaurantId,
  });
};

export const useRestaurantComments = (restaurantId: number, params?: CommentListParams) => {
  return useQuery({
    queryKey: ['restaurant', restaurantId, 'comments', params],
    queryFn: async () => {
      const { data } = await apiClient.get<{ comments: CommentItem[]; total: number; page: number; limit: number }>(
        `/restaurants/${restaurantId}/comments`,
        { params }
      );
      return data;
    },
    enabled: !!restaurantId,
  });
};

export const useCreateRating = (restaurantId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateRatingRequest) => {
      const { data } = await apiClient.post(`/restaurants/${restaurantId}/ratings`, request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};

export const useCreateComment = (restaurantId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateCommentRequest) => {
      const { data } = await apiClient.post(`/restaurants/${restaurantId}/comments`, request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
    },
  });
};
