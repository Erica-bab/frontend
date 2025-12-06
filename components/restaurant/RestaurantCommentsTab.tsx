import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { RestaurantDetailResponse } from '@/api/restaurants/types';
import {
  useComments,
  useCreateOrUpdateRating,
} from '@/api/restaurants/useReviewComment';
import { useAuth } from '@/api/auth/useAuth';
import { useLikedComments, useMyComments, useMyReplies } from '@/api/user/useUserActivity';
import { useLikedCommentIds } from '@/hooks/useLikedCommentIds';
import { useMyCommentIds } from '@/hooks/useMyCommentIds';
import { useMyRating } from '@/api/restaurants/useRating';
import CommentItem from '@/components/restaurant/CommentItem';
import StarRating from '@/components/restaurant/StarRating';

interface RestaurantCommentsTabProps {
  restaurant: RestaurantDetailResponse;
  onShowLogin: () => void;
}

export default function RestaurantCommentsTab({ restaurant, onShowLogin }: RestaurantCommentsTabProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  // 댓글 탭에서 45초마다 자동 새로고침 (30초-1분 사이)
  const { data: commentsData, isLoading: isCommentsLoading, refetch: refetchComments } = useComments(
    restaurant.id,
    undefined,
    { refetchInterval: 45 * 1000 } // 45초마다 새로고침
  );
  const { mutate: createOrUpdateRating, isPending: isRatingLoading } = useCreateOrUpdateRating(restaurant.id);
  const { refetch: refetchLikedComments } = useLikedComments(1, 100, isAuthenticated === true);
  const { refetch: refetchMyComments } = useMyComments(1, 100, isAuthenticated === true);
  const { refetch: refetchMyReplies } = useMyReplies(1, 100, isAuthenticated === true);
  const likedCommentIds = useLikedCommentIds(isAuthenticated === true);
  const myCommentIds = useMyCommentIds(isAuthenticated === true);
  const { myRating: myRatingFromServer, refetchRatingStats } = useMyRating(restaurant.id, isAuthenticated === true);

  // 옵티미스틱 업데이트를 위한 로컬 상태
  const [optimisticRating, setOptimisticRating] = useState<number>(0);
  
  // Pull-to-refresh 상태
  const [refreshing, setRefreshing] = useState(false);

  // 서버에서 받은 별점으로 로컬 상태 동기화
  useEffect(() => {
    setOptimisticRating(myRatingFromServer);
  }, [myRatingFromServer]);

  const handleRating = (rating: number) => {
    if (!isAuthLoading && !isAuthenticated) {
      onShowLogin();
      return;
    }

    // 이전 별점 저장 (롤백용)
    const previousRating = optimisticRating;

    // 옵티미스틱 업데이트: 즉시 UI 업데이트
    setOptimisticRating(rating);

    createOrUpdateRating(
      { rating },
      {
        onSuccess: () => {
          // 서버 데이터 새로고침
          refetchRatingStats();
        },
        onError: (error: any) => {
          // 에러 시 이전 상태로 롤백
          setOptimisticRating(previousRating);
          console.error('별점 저장 실패:', error);
        },
      }
    );
  };

  // Pull-to-refresh 핸들러
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchComments();
      await refetchRatingStats();
      if (isAuthenticated) {
        await Promise.all([
          refetchLikedComments(),
          refetchMyComments(),
          refetchMyReplies(),
        ]);
      }
    } finally {
      setRefreshing(false);
    }
  }, [refetchComments, refetchRatingStats, refetchLikedComments, refetchMyComments, refetchMyReplies, isAuthenticated]);

  // 댓글 정렬: 좋아요순 (내림차순), 좋아요가 같으면 옛날 댓글순 (오름차순)
  const sortedComments = useMemo(() => {
    const comments = commentsData?.comments ?? [];
    return [...comments].sort((a, b) => {
      // 좋아요 수 비교 (내림차순)
      if (a.like_count !== b.like_count) {
        return b.like_count - a.like_count;
      }
      // 좋아요가 같으면 생성일 비교 (오름차순 - 옛날 댓글순)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [commentsData?.comments]);

  return (
    <View>
      {/* 별점 섹션 */}
      <View className="p-4 border-b border-gray-200 items-center">
        <StarRating rating={optimisticRating} onRate={handleRating} isLoading={isRatingLoading} />
        <Text className="text-gray-500 mt-2">
          {isRatingLoading
            ? '별점 저장 중...'
            : optimisticRating > 0
              ? `${optimisticRating}점을 선택했어요`
              : '별점을 눌러주세요'}
        </Text>
      </View>

      {/* 댓글 목록 */}
      {isCommentsLoading ? (
        <View className="p-8 items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-2">댓글 불러오는 중...</Text>
        </View>
      ) : sortedComments.length === 0 ? (
        <View className="p-8 items-center">
          <Text className="text-gray-500">아직 댓글이 없습니다</Text>
        </View>
      ) : (
        sortedComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            restaurantId={restaurant.id}
            likedCommentIds={likedCommentIds}
            myCommentIds={myCommentIds}
            onLikeToggle={refetchLikedComments}
            onShowLogin={onShowLogin}
            showReplyButton
          />
        ))
      )}
    </View>
  );
}
