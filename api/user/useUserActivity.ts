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

// 좋아요한 댓글 목록만 조회
export const useLikedComments = (page: number = 1, limit: number = 100, enabled: boolean = true) => {
  return useQuery<LikedCommentActivity[]>({
    queryKey: ['user', 'liked-comments', page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<UserActivitiesResponse>('/users/me/activities', {
        params: {
          category: 'liked_comments',
          page,
          limit,
        },
      });
      return data.activities.liked_comments || [];
    },
    enabled,
    retry: false,
  });
};

// 별점 준 식당 목록 조회
export const useMyFavorites = (page: number = 1, limit: number = 100, enabled: boolean = true) => {
  return useQuery<FavoriteActivity[]>({
    queryKey: ['user', 'favorites', page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<UserActivitiesResponse>('/users/me/activities', {
        params: {
          category: 'favorites',
          page,
          limit,
        },
      });
      return data.activities.favorites || [];
    },
    enabled,
    retry: false,
  });
};

// 작성한 댓글 목록 조회
export const useMyComments = (page: number = 1, limit: number = 100, enabled: boolean = true) => {
  return useQuery<CommentActivity[]>({
    queryKey: ['user', 'comments', page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<UserActivitiesResponse>('/users/me/activities', {
        params: {
          category: 'comments',
          page,
          limit,
        },
      });
      return data.activities.comments || [];
    },
    enabled,
    retry: false,
  });
};

// 작성한 대댓글 목록 조회
export const useMyReplies = (page: number = 1, limit: number = 100, enabled: boolean = true) => {
  return useQuery<ReplyActivity[]>({
    queryKey: ['user', 'replies', page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<UserActivitiesResponse>('/users/me/activities', {
        params: {
          category: 'replies',
          page,
          limit,
        },
      });
      return data.activities.replies || [];
    },
    enabled,
    retry: false,
  });
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
export const useToggleBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (restaurantId: number) => {
      // 먼저 체크 API 호출
      const { data: checkData } = await apiClient.get<{ is_bookmarked: boolean }>(
        `/users/me/bookmarks/${restaurantId}/check`
      );

      if (checkData.is_bookmarked) {
        // 이미 북마크되어 있으면 삭제
        await apiClient.delete(`/users/me/bookmarks/${restaurantId}`);
      } else {
        // 북마크 안되어 있으면 추가
        await apiClient.post(`/users/me/bookmarks/${restaurantId}`);
      }
    },
    onSuccess: () => {
      // 북마크 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['user', 'bookmarks'] });
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

