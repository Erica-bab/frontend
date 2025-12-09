import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// 활동 내역 요약
export interface ActivitySummary {
  bookmarks: number;
  favorites: number;
  comments: number;
  replies: number;
  liked_comments: number;
  edits: Record<string, number>;
}

// 좋아요한 댓글 활동 항목
export interface LikedCommentActivity {
  id: number;
  content: string;
  restaurant_id: number;
  restaurant_name: string | null;
  like_count: number;
  liked_at: string;
  created_at: string;
}

// 별점 활동 항목
export interface FavoriteActivity {
  restaurant_id: number;
  restaurant_name: string | null;
  rating: number;
  created_at: string;
}

// 댓글 활동 항목
export interface CommentActivity {
  id: number;
  content: string;
  restaurant_id: number;
  restaurant_name: string | null;
  like_count: number;
  created_at: string;
}

// 대댓글 활동 항목
export interface ReplyActivity {
  id: number;
  content: string;
  restaurant_id: number;
  restaurant_name: string | null;
  parent_comment_id: number;
  parent_comment_content: string | null;
  created_at: string;
}

// 사용자 활동 내역 응답
export interface UserActivitiesResponse {
  summary: ActivitySummary;
  activities: {
    bookmarks?: any[];
    favorites?: FavoriteActivity[];
    comments?: CommentActivity[];
    replies?: ReplyActivity[];
    liked_comments?: LikedCommentActivity[];
    edits?: any[];
    [key: string]: any;
  };
}

// 사용자 활동 내역 조회 파라미터
export interface UserActivitiesParams {
  category?: 'bookmarks' | 'favorites' | 'comments' | 'replies' | 'liked_comments' | 'edits' | 'all';
  page?: number;
  limit?: number;
}

// 사용자 활동 내역 조회
export const useUserActivities = (params?: UserActivitiesParams) => {
  return useQuery<UserActivitiesResponse>({
    queryKey: ['user', 'activities', params],
    queryFn: async () => {
      const { data } = await apiClient.get<UserActivitiesResponse>('/users/me/activities', { params });
      return data;
    },
    retry: false,
  });
};

// 사용자 활동 데이터 통합 조회 (여러 category를 한 번에 가져옴)
// 같은 엔드포인트를 여러 번 호출하는 것을 방지하기 위해 통합 훅 사용
const useUserActivitiesData = (categories: string[], enabled: boolean = true) => {
  return useQuery<UserActivitiesResponse>({
    queryKey: ['user', 'activities', 'combined', categories.sort().join(',')],
    queryFn: async () => {
      // 'all' category로 모든 데이터를 한 번에 가져옴
      const { data } = await apiClient.get<UserActivitiesResponse>('/users/me/activities', {
        params: {
          category: 'all',
          page: 1,
          limit: 100,
        },
      });
      return data;
    },
    enabled,
    retry: false,
    staleTime: 30000, // 30초간 캐시 유지 (같은 데이터를 여러 번 요청하는 것을 방지)
  });
};

// 좋아요한 댓글 목록만 조회
export const useLikedComments = (page: number = 1, limit: number = 100, enabled: boolean = true) => {
  const { data, ...rest } = useUserActivitiesData(['liked_comments'], enabled);
  
  return {
    ...rest,
    data: data?.activities.liked_comments || [],
  };
};

// 별점 준 식당 목록 조회
export const useMyFavorites = (page: number = 1, limit: number = 100, enabled: boolean = true) => {
  const { data, ...rest } = useUserActivitiesData(['favorites'], enabled);
  
  return {
    ...rest,
    data: data?.activities.favorites || [],
  };
};

// 작성한 댓글 목록 조회
export const useMyComments = (page: number = 1, limit: number = 100, enabled: boolean = true) => {
  const { data, ...rest } = useUserActivitiesData(['comments'], enabled);
  
  return {
    ...rest,
    data: data?.activities.comments || [],
  };
};

// 작성한 대댓글 목록 조회
export const useMyReplies = (page: number = 1, limit: number = 100, enabled: boolean = true) => {
  const { data, ...rest } = useUserActivitiesData(['replies'], enabled);
  
  return {
    ...rest,
    data: data?.activities.replies || [],
  };
};

// 북마크 활동 항목
export interface BookmarkActivity {
  restaurant_id: number;
  restaurant_name: string | null;
  restaurant_category: string | null;
  restaurant_address: string | null;
  created_at: string;
}

// 북마크 목록 조회
export const useMyBookmarks = (page: number = 1, limit: number = 100, enabled: boolean = true) => {
  return useQuery<BookmarkActivity[], Error>({
    queryKey: ['user', 'bookmarks', page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<UserActivitiesResponse>('/users/me/activities', {
        params: {
          category: 'bookmarks',
          page,
          limit,
        },
      });
      return data.activities.bookmarks || [];
    },
    enabled,
    retry: false,
  });
};

// 북마크 추가/삭제
// 현재 북마크 상태를 알고 있다면 isBookmarked를 전달하여 체크 API 호출 생략 가능
export const useToggleBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { restaurantId: number; currentState?: boolean }>({
    mutationFn: async ({ restaurantId, currentState }) => {
      // 현재 상태를 알고 있다면 체크 API 호출 생략
      if (currentState !== undefined) {
        if (currentState) {
          // 이미 북마크되어 있으면 삭제
          await apiClient.delete(`/users/me/bookmarks/${restaurantId}`);
        } else {
          // 북마크 안되어 있으면 추가
          await apiClient.post(`/users/me/bookmarks/${restaurantId}`);
        }
      } else {
        // 현재 상태를 모르는 경우에만 체크 API 호출 (하위 호환성)
      const { data: checkData } = await apiClient.get<{ is_bookmarked: boolean }>(
        `/users/me/bookmarks/${restaurantId}/check`
      );

      if (checkData.is_bookmarked) {
        await apiClient.delete(`/users/me/bookmarks/${restaurantId}`);
      } else {
        await apiClient.post(`/users/me/bookmarks/${restaurantId}`);
        }
      }
    },
    onSuccess: (_, variables) => {
      // 북마크 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['user', 'bookmarks'] });
      // 북마크 체크 쿼리도 업데이트
      queryClient.setQueryData(['bookmark', 'check', variables.restaurantId], !variables.currentState);
    },
  });
};

// 북마크 체크
export const useCheckBookmark = (restaurantId: number, enabled: boolean = true) => {
  return useQuery<boolean, Error>({
    queryKey: ['bookmark', 'check', restaurantId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ is_bookmarked: boolean }>(
        `/users/me/bookmarks/${restaurantId}/check`
      );
      return data.is_bookmarked;
    },
    enabled: enabled && !!restaurantId,
    retry: false,
  });
};

