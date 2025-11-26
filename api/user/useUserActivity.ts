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

// 사용자 활동 내역 응답
export interface UserActivitiesResponse {
  summary: ActivitySummary;
  activities: {
    liked_comments?: LikedCommentActivity[];
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

