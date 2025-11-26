import { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { RestaurantDetailResponse } from '@/api/restaurants/types';
import {
  useComments,
  useCreateOrUpdateRating,
  useCreateComment,
} from '@/api/restaurants/useReviewComment';
import { useAuth } from '@/api/auth/useAuth';
import { useLikedComments } from '@/api/user/useUserActivity';
import Icon from '@/components/Icon';
import LoginPopup from '@/components/LoginPopup';
import CommentItem from '@/components/restaurant/CommentItem';
import CommentInput from '@/components/restaurant/CommentInput';

interface RestaurantCommentsTabProps {
  restaurant: RestaurantDetailResponse;
}

// 별점 선택 컴포넌트
function StarRating({ rating, onRate, isLoading }: { rating: number; onRate: (r: number) => void; isLoading?: boolean }) {
  return (
    <View className="flex-row gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onRate(star)} disabled={isLoading}>
          <Icon
            name="star"
            size={32}
            color={star <= rating ? '#3B82F6' : '#D1D5DB'}
          />
        </Pressable>
      ))}
    </View>
  );
}

export default function RestaurantCommentsTab({ restaurant }: RestaurantCommentsTabProps) {
  const [myRating, setMyRating] = useState(0);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [commentText, setCommentText] = useState('');

  const { isAuthenticated, isLoading: isAuthLoading, refreshAuthState } = useAuth();
  const { data: commentsData, isLoading: isCommentsLoading, refetch: refetchComments } = useComments(restaurant.id);
  const { mutate: createOrUpdateRating, isPending: isRatingLoading } = useCreateOrUpdateRating(restaurant.id);
  const { mutate: createComment, isPending: isCreatingComment } = useCreateComment(restaurant.id);
  // 인증된 경우에만 좋아요한 댓글 목록 조회 (limit 최대값 100)
  const { data: likedComments, refetch: refetchLikedComments } = useLikedComments(1, 100, isAuthenticated === true);

  // 좋아요한 댓글 ID Set 생성
  const likedCommentIds = useMemo(() => {
    if (!isAuthenticated || !likedComments) return new Set<number>();
    return new Set(likedComments.map(like => like.id));
  }, [likedComments, isAuthenticated]);

  // 로그인 성공 시 팝업 자동 닫기
  useEffect(() => {
    if (isAuthenticated && showLoginPopup) {
      setShowLoginPopup(false);
    }
  }, [isAuthenticated, showLoginPopup]);

  const handleRating = (rating: number) => {
    setMyRating(rating);
    createOrUpdateRating({ rating });
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    
    // 로그인 확인
    if (!isAuthLoading && !isAuthenticated) {
      setShowLoginPopup(true);
      return;
    }

    createComment(
      { content: commentText.trim() },
      {
        onSuccess: () => {
          setCommentText('');
          refetchComments();
        },
        onError: (error: any) => {
          Alert.alert('오류', error?.response?.data?.detail || '댓글 작성에 실패했습니다.');
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
              onShowLogin={() => setShowLoginPopup(true)}
              showReplyButton
            />
          ))
        )}
      </View>

      {/* 댓글 입력 */}
      <CommentInput
        commentText={commentText}
        onChangeText={(text) => {
          if (!isAuthLoading && !isAuthenticated && text.length > 0) {
            setShowLoginPopup(true);
            return;
          }
          setCommentText(text);
        }}
        onSubmit={handleSubmitComment}
        isLoading={isCreatingComment}
      />

      <LoginPopup
        visible={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        onLoginSuccess={async () => {
          await refreshAuthState();
          refetchLikedComments();
        }}
      />
    </View>
  );
}
