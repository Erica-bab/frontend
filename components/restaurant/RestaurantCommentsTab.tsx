import { View, Text, ActivityIndicator } from 'react-native';
import { RestaurantDetailResponse } from '@/api/restaurants/types';
import {
  useComments,
  useCreateOrUpdateRating,
} from '@/api/restaurants/useReviewComment';
import { useAuth } from '@/api/auth/useAuth';
import { useLikedComments, useMyRatings } from '@/api/user/useUserActivity';
import { useLikedCommentIds } from '@/hooks/useLikedCommentIds';
import CommentItem from '@/components/restaurant/CommentItem';
import StarRating from '@/components/restaurant/StarRating';

interface RestaurantCommentsTabProps {
  restaurant: RestaurantDetailResponse;
  onShowLogin: () => void;
}

export default function RestaurantCommentsTab({ restaurant, onShowLogin }: RestaurantCommentsTabProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { data: commentsData, isLoading: isCommentsLoading } = useComments(restaurant.id);
  const { mutate: createOrUpdateRating, isPending: isRatingLoading } = useCreateOrUpdateRating(restaurant.id);
  const { refetch: refetchLikedComments } = useLikedComments(1, 100, isAuthenticated === true);
  const likedCommentIds = useLikedCommentIds(isAuthenticated === true);
  const { data: myRatings, refetch: refetchMyRatings } = useMyRatings(1, 100, isAuthenticated === true);

  // 현재 레스토랑의 내 별점 찾기
  const myRating = myRatings?.find(rating => rating.restaurant_id === restaurant.id)?.rating || 0;

  const handleRating = (rating: number) => {
    if (!isAuthLoading && !isAuthenticated) {
      onShowLogin();
      return;
    }
    createOrUpdateRating(
      { rating },
      {
        onSuccess: () => {
          refetchMyRatings();
        },
      }
    );
  };

  const comments = commentsData?.comments ?? [];

  return (
    <View className='flex-1'>
      {/* 별점 섹션 */}
      <View className="p-4 border-b border-gray-200 items-center">
        <StarRating rating={myRating} onRate={handleRating} isLoading={isRatingLoading} />
        <Text className="text-gray-500 mt-2">
          {isRatingLoading
            ? '별점 저장 중...'
            : myRating > 0
              ? `${myRating}점을 선택했어요`
              : '별점을 눌러주세요'}
        </Text>
      </View>

      {/* 댓글 목록 */}
      <View>
        {isCommentsLoading ? (
          <View className="p-8 items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500 mt-2">댓글 불러오는 중...</Text>
          </View>
        ) : comments.length === 0 ? (
          <View className="p-8 items-center">
            <Text className="text-gray-500">아직 댓글이 없습니다</Text>
          </View>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              restaurantId={restaurant.id}
              likedCommentIds={likedCommentIds}
              onLikeToggle={refetchLikedComments}
              onShowLogin={onShowLogin}
              showReplyButton
            />
          ))
        )}
      </View>
    </View>
  );
}
