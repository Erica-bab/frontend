import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import {
  RestaurantListResponse,
  RestaurantDetailResponse,
  RestaurantListParams,
  CommentListParams,
  CreateRatingRequest,
  CreateCommentRequest,
  CommentItem,
  SearchParams,
  SearchResponse,
} from './types';

// 카테고리 매핑
const CATEGORY_MAP: Record<string, number> = {
  '분식': 1,
  '패스트푸드': 2,
  '아시안': 3,
  '일식': 4,
  '중식': 5,
  '한식': 6,
  '양식': 7,
  '고기': 8,
};

const DAY_MAP: Record<string, number> = {
  '월요일': 1,
  '화요일': 2,
  '수요일': 3,
  '목요일': 4,
  '금요일': 5,
  '토요일': 6,
  '일요일': 7,
};

const SUB_CATEGORY_MAP: Record<string, number> = {
  '개인식당': 1,
  '프랜차이즈': 2,
};

// 필터 상태 타입
export interface FilterState {
  dayOfWeek?: string;
  hour?: string;
  minute?: string;
  categories: string[];
  affiliations: string[];
  subCategory?: string;
}

// FilterState를 API 파라미터로 변환
export const filterToParams = (filter: FilterState): RestaurantListParams => {
  const params: RestaurantListParams = {};

  if (filter.categories.length > 0) {
    const categoryIds = filter.categories
      .filter(c => c !== '전체')
      .map(c => CATEGORY_MAP[c])
      .filter(Boolean);
    if (categoryIds.length > 0) {
      params.categories = categoryIds.join(',');
    }
  }

  if (filter.affiliations.length > 0) {
    params.affiliations = filter.affiliations.join(',');
  }

  if (filter.subCategory) {
    params.sub_category = String(SUB_CATEGORY_MAP[filter.subCategory] || filter.subCategory);
  }

  if (filter.dayOfWeek || (filter.hour && filter.minute)) {
    params.is_open_only = true;
    if (filter.dayOfWeek) {
      params.day_of_week = String(DAY_MAP[filter.dayOfWeek] || filter.dayOfWeek);
    }
    if (filter.hour && filter.minute) {
      params.time = `${filter.hour}:${filter.minute}`;
    }
  }

  return params;
};

// 초기 필터 상태
export const initialFilterState: FilterState = {
  categories: [],
  affiliations: [],
};

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

// 통합 검색
export const useRestaurantSearch = (params: SearchParams) => {
  return useQuery({
    queryKey: ['restaurantSearch', params],
    queryFn: async () => {
      const { data } = await apiClient.get<SearchResponse>('/restaurants/search', { params });
      return data;
    },
    enabled: !!params.q && params.q.length > 0,
  });
};
