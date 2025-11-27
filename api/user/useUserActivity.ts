import { useQuery } from '@tanstack/react-query';
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
export interface RatingActivity {
  id: number;
  rating: number;
  restaurant_id: number;
  restaurant_name: string | null;
  created_at: string;
  updated_at?: string | null;
}

// 댓글 활동 항목
export interface CommentActivity {
  id: number;
  content: string;
  restaurant_id: number;
  restaurant_name: string | null;
  like_count: number;
  reply_count: number;
  created_at: string;
  updated_at?: string | null;
}

// 사용자 활동 내역 응답
export interface UserActivitiesResponse {
  summary: ActivitySummary;
  activities: {
    liked_comments?: LikedCommentActivity[];
    favorites?: RatingActivity[];
    comments?: CommentActivity[];
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

// 내가 준 별점 목록 조회
export const useMyRatings = (page: number = 1, limit: number = 100, enabled: boolean = true) => {
  return useQuery<RatingActivity[]>({
    queryKey: ['user', 'my-ratings', page, limit],
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

// 내가 작성한 댓글 목록 조회
export const useMyComments = (page: number = 1, limit: number = 100, enabled: boolean = true) => {
  return useQuery<CommentActivity[]>({
    queryKey: ['user', 'my-comments', page, limit],
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

