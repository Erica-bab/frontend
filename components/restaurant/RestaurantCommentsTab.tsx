import { useState } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RestaurantDetailResponse, CommentItem as CommentItemType } from '@/api/restaurants/types';
import {
  useComments,
  useCreateOrUpdateRating,
  useToggleCommentLike,
} from '@/api/restaurants/useReviewComment';
import Icon from '@/components/Icon';

interface RestaurantCommentsTabProps {
  restaurant: RestaurantDetailResponse;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const mins = date.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hours}:${mins}`;
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

// 댓글 아이템 컴포넌트
interface CommentItemProps {
  comment: CommentItemType;
  restaurantId: number;
}

function CommentItem({ comment, restaurantId }: CommentItemProps) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { mutate: toggleLike } = useToggleCommentLike(restaurantId);

  const handleReplyPress = () => {
    navigation.navigate('CommentDetail', { commentId: comment.id, restaurantId });
  };

  const handleLikePress = () => {
    toggleLike(comment.id);
  };

  return (
    <View className="p-4 border-b border-gray-200">
      <View className="flex-row justify-between mb-2">
        <Text className="font-medium">{comment.user.student_year || '익명'}</Text>
        <View className="flex-row gap-3">
          <Pressable className="flex-row gap-1 items-center" onPress={handleLikePress}>
            <Icon name="good" size={16} color="#6B7280" />
            <Text className="text-gray-600">{comment.like_count}</Text>
          </Pressable>
          <Pressable>
            <Icon name="meatball" size={16} color="#6B7280" />
          </Pressable>
        </View>
      </View>
      <Text className="mb-2">{comment.content}</Text>
      <Text className="text-sm text-gray-500 mb-2">{formatDate(comment.created_at)}</Text>
      <Pressable className="flex-row gap-1 items-center" onPress={handleReplyPress}>
        <Text className="text-blue-500">
          {comment.replies.length > 0 ? `답글 ${comment.replies.length}개` : '답글쓰기'}
        </Text>
        <Icon name="rightAngle" size={8} color="black" />
      </Pressable>
    </View>
  );
}

// 댓글 입력 컴포넌트 (하단 고정용)
interface CommentInputProps {
  commentText: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function CommentInput({ commentText, onChangeText, onSubmit, isLoading }: CommentInputProps) {
  return (
    <View className="p-4 border-t border-gray-200 flex-row gap-2 bg-white">
      <TextInput
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
        placeholder="댓글을 입력하세요"
        value={commentText}
        onChangeText={onChangeText}
        editable={!isLoading}
      />
      <Pressable
        className="bg-blue-500 rounded-lg px-4 justify-center"
        onPress={onSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Icon name="send" size={20} color="#FFFFFF" />
        )}
      </Pressable>
    </View>
  );
}

export default function RestaurantCommentsTab({ restaurant }: RestaurantCommentsTabProps) {
  const [myRating, setMyRating] = useState(0);

  const { data: commentsData, isLoading: isCommentsLoading } = useComments(restaurant.id);
  const { mutate: createOrUpdateRating, isPending: isRatingLoading } = useCreateOrUpdateRating(restaurant.id);

  const handleRating = (rating: number) => {
    setMyRating(rating);
    createOrUpdateRating({ rating });
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
            <CommentItem key={comment.id} comment={comment} restaurantId={restaurant.id} />
          ))
        )}
      </View>
    </View>
  );
}
