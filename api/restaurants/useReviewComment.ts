import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import {
  CommentItem,
  CommentListParams,
  CreateRatingRequest,
  CreateCommentRequest,
} from './types';

// ============ 별점(Rating) ============

// 별점 생성/수정
export const useCreateOrUpdateRating = (restaurantId: number) => {
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

// ============ 댓글(Comment) ============

// 댓글 목록 조회
export const useComments = (
  restaurantId: number, 
  params?: CommentListParams,
  options?: { refetchInterval?: number | false }
) => {
  return useQuery({
    queryKey: ['restaurant', restaurantId, 'comments', params],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        comments: CommentItem[];
        total: number;
        page: number;
        limit: number;
      }>(`/restaurants/${restaurantId}/comments`, { params });
      return data;
    },
    enabled: !!restaurantId,
    refetchInterval: options?.refetchInterval,
  });
};

// 댓글 생성
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
      // 리스트의 popular_comment 업데이트를 위해 리스트 쿼리도 무효화
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants-v2'] });
    },
  });
};

// 댓글 수정
export interface UpdateCommentRequest {
  content: string;
}

export const useUpdateComment = (restaurantId: number, commentId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateCommentRequest) => {
      const { data } = await apiClient.put(
        `/restaurants/${restaurantId}/comments/${commentId}`,
        request
      );
      return data;
    },
    onSuccess: () => {
      // 댓글 수정은 댓글 목록만 무효화 (상세 정보에는 영향 없음)
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId, 'comments'] });
    },
  });
};

// 댓글 삭제
export const useDeleteComment = (restaurantId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: number) => {
      const { data } = await apiClient.delete(
        `/restaurants/${restaurantId}/comments/${commentId}`
      );
      return data;
    },
    onSuccess: () => {
      // 댓글 삭제는 댓글 개수와 popular_comment에 영향을 주므로 모두 무효화
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
      // 리스트의 popular_comment 업데이트를 위해 리스트 쿼리도 무효화
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants-v2'] });
    },
  });
};

// 댓글 좋아요 토글
export interface ToggleCommentLikeRequest {
  is_like: boolean;
}

export const useToggleCommentLike = (restaurantId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: number) => {
      const { data } = await apiClient.post(
        `/restaurants/${restaurantId}/comments/${commentId}/like`,
        { is_like: true } // 좋아요는 true로 고정 (싫어요는 별도로 구현 가능)
      );
      return data;
    },
    onSuccess: () => {
      // 좋아요는 댓글 목록만 무효화 (상세 정보에는 영향 없음)
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId, 'comments'] });
    },
  });
};

// 댓글 신고
export interface ReportCommentRequest {
  reason?: string;
}

export const useReportComment = (restaurantId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, request }: { commentId: number; request?: ReportCommentRequest }) => {
      const { data } = await apiClient.post(
        `/restaurants/${restaurantId}/comments/${commentId}/report`,
        request
      );
      return data;
    },
    onSuccess: () => {
      // 신고는 댓글 목록만 무효화 (상세 정보에는 영향 없음)
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId, 'comments'] });
    },
  });
};
