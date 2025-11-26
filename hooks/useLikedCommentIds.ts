import { useMemo } from 'react';
import { useLikedComments } from '@/api/user/useUserActivity';

export function useLikedCommentIds(isAuthenticated: boolean) {
  const { data: likedComments } = useLikedComments(1, 100, isAuthenticated === true);

  const likedCommentIds = useMemo(() => {
    if (!isAuthenticated || !likedComments) return new Set<number>();
    return new Set(likedComments.map(like => like.id));
  }, [likedComments, isAuthenticated]);

  return likedCommentIds;
}

