import { useMemo } from 'react';
import { useMyComments, useMyReplies } from '@/api/user/useUserActivity';

export function useMyCommentIds(isAuthenticated: boolean) {
  // useMyComments와 useMyReplies를 사용하여 동일한 캐시 공유
  const { data: comments } = useMyComments(1, 100, isAuthenticated === true);
  const { data: replies } = useMyReplies(1, 100, isAuthenticated === true);

  const myCommentIds = useMemo(() => {
    if (!isAuthenticated) return new Set<number>();
    const commentIds = new Set<number>();

    // comments에서 ID 추출
    if (comments) {
      comments.forEach((comment) => commentIds.add(comment.id));
    }

    // replies에서 ID 추출
    if (replies) {
      replies.forEach((reply) => commentIds.add(reply.id));
    }

    return commentIds;
  }, [comments, replies, isAuthenticated]);

  return myCommentIds;
}

