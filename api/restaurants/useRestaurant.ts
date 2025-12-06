import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import {
  RestaurantListResponse,
  RestaurantDetailResponse,
  RestaurantListParams,
  SearchParams,
  SearchResponse,
  MenuListParams,
  MenuListResponse,
  UpdateRestaurantRequest,
  UpdateRestaurantResponse,
  UpdateRestaurantHoursRequest,
  UpdateRestaurantHoursResponse,
  CreateMenuRequest,
  CreateMenuResponse,
  UpdateMenuRequest,
  UpdateMenuResponse,
  DeleteMenuResponse,
  RandomMenuResponse,
} from './types';
import { CATEGORY_MAP, SUB_CATEGORY_MAP } from '@/constants/mappings';

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

  if (filter.subCategory && filter.subCategory.trim() !== '') {
    params.sub_category = String(SUB_CATEGORY_MAP[filter.subCategory] || filter.subCategory);
  }

  // 운영시간 필터는 클라이언트에서 처리하므로 서버 파라미터로 전송하지 않음
  // if (filter.dayOfWeek || (filter.hour && filter.minute)) {
  //   params.is_open_only = true;
  //   if (filter.dayOfWeek) {
  //     params.day_of_week = String(DAY_MAP[filter.dayOfWeek] || filter.dayOfWeek);
  //   }
  //   if (filter.hour && filter.minute) {
  //     params.time = `${filter.hour}:${filter.minute}`;
  //   }
  // }

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

// 클라이언트 정렬용 새로운 엔드포인트
export const useRestaurantListV2 = (params?: Omit<RestaurantListParams, 'sort'>) => {
  return useQuery({
    queryKey: ['restaurants-v2', params],
    queryFn: async () => {
      const { data } = await apiClient.get<RestaurantListResponse>('/restaurants/v2', { params });
      return data;
    },
    // 다른 사용자의 별점/댓글 변경사항을 반영하기 위해 5분마다 자동 새로고침
    refetchInterval: 5 * 60 * 1000, // 5분 (300000ms)
  });
};

export const useRestaurantDetail = (restaurantId: number, options?: { refetchInterval?: number }) => {
  return useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: async () => {
      const { data } = await apiClient.get<RestaurantDetailResponse>(`/restaurants/${restaurantId}`);
      return data;
    },
    enabled: !!restaurantId,
    refetchInterval: options?.refetchInterval,
  });
};

// 운영 상태만 업데이트하는 함수 (캐시 최적화)
export const useUpdateRestaurantOperatingStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ restaurantId }: { restaurantId: number }) => {
      // 운영 상태만 가져오는 엔드포인트가 있다면 사용, 없으면 전체 정보 가져오기
      const { data } = await apiClient.get<RestaurantDetailResponse>(`/restaurants/${restaurantId}`);
      return data;
    },
    onSuccess: (data, variables) => {
      // 캐시된 데이터의 operating_status만 업데이트
      queryClient.setQueryData<RestaurantDetailResponse>(
        ['restaurant', variables.restaurantId],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            operating_status: data.operating_status,
          };
        }
      );
      
      // 리스트 캐시도 업데이트
      queryClient.setQueriesData<RestaurantListResponse>(
        { queryKey: ['restaurants'] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            restaurants: oldData.restaurants.map((restaurant) =>
              restaurant.id === variables.restaurantId
                ? { ...restaurant, operating_status: data.operating_status }
                : restaurant
            ),
          };
        }
      );
      
      queryClient.setQueriesData<RestaurantListResponse>(
        { queryKey: ['restaurants-v2'] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            restaurants: oldData.restaurants.map((restaurant) =>
              restaurant.id === variables.restaurantId
                ? { ...restaurant, operating_status: data.operating_status }
                : restaurant
            ),
          };
        }
      );
    },
  });
};

// 댓글 관련 API는 useReviewComment.ts로 이동됨

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

// 식당 메뉴 조회
export const useRestaurantMenus = (restaurantId: number, params?: MenuListParams) => {
  return useQuery({
    queryKey: ['restaurant', restaurantId, 'menus', params],
    queryFn: async () => {
      const { data } = await apiClient.get<MenuListResponse>(`/restaurants/${restaurantId}/menus`, { params });
      return data;
    },
    enabled: !!restaurantId,
  });
};

// 식당 전화번호 수정
export const useUpdateRestaurant = (restaurantId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateRestaurantRequest) => {
      const { data } = await apiClient.put<UpdateRestaurantResponse>(`/restaurants/${restaurantId}`, request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
    },
  });
};

// 식당 운영시간 수정
export const useUpdateRestaurantHours = (restaurantId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateRestaurantHoursRequest) => {
      const { data } = await apiClient.put<UpdateRestaurantHoursResponse>(`/restaurants/${restaurantId}/hours`, request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
    },
  });
};

// 메뉴 등록
export const useCreateMenu = (restaurantId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateMenuRequest) => {
      const { data } = await apiClient.post<CreateMenuResponse>(`/restaurants/${restaurantId}/menus`, request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId, 'menus'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
    },
  });
};

// 메뉴 수정
export const useUpdateMenu = (restaurantId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ menuId, request }: { menuId: number; request: UpdateMenuRequest }) => {
      const { data } = await apiClient.put<UpdateMenuResponse>(`/restaurants/${restaurantId}/menus/${menuId}`, request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId, 'menus'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
    },
  });
};

// 메뉴 삭제
export const useDeleteMenu = (restaurantId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menuId: number) => {
      const { data } = await apiClient.delete<DeleteMenuResponse>(`/restaurants/${restaurantId}/menus/${menuId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId, 'menus'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
    },
  });
};

// 랜덤 메뉴 조회
export const useRandomMenu = () => {
  return useQuery({
    queryKey: ['restaurants', 'menus', 'random'],
    queryFn: async () => {
      const { data } = await apiClient.get<RandomMenuResponse>('/restaurants/menus/random');
      return data;
    },
    enabled: false, // 수동으로만 호출
  });
};
