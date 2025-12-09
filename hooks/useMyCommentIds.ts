import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { UserActivitiesResponse, CommentActivity, ReplyActivity } from '@/api/user/useUserActivity';

export function useMyCommentIds(isAuthenticated: boolean) {
  // comments와 replies를 한 번에 가져오기 위해 통합 쿼리 사용
  const { data: activitiesData } = useQuery<UserActivitiesResponse>({
    queryKey: ['user', 'activities', 'my-comments'],
    queryFn: async () => {
      const { data } = await apiClient.get<UserActivitiesResponse>('/users/me/activities', {
        params: {
          category: 'all',
          page: 1,
          limit: 100,
        },
      });
      return data;
    },
    enabled: isAuthenticated === true,
    retry: false,
    staleTime: 30000, // 30초간 캐시 유지
  });

  const myCommentIds = useMemo(() => {
    if (!isAuthenticated || !activitiesData) return new Set<number>();
    const commentIds = new Set<number>();
    
    // comments에서 ID 추출
    const comments = activitiesData.activities.comments || [];
    comments.forEach((comment: CommentActivity) => commentIds.add(comment.id));
    
    // replies에서 ID 추출
    const replies = activitiesData.activities.replies || [];
    replies.forEach((reply: ReplyActivity) => commentIds.add(reply.id));
    
    return commentIds;
  }, [activitiesData, isAuthenticated]);

  return myCommentIds;
}

