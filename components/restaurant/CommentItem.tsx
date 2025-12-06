import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommentItem as CommentItemType } from '@/api/restaurants/types';
import Icon from '@/components/Icon';
import { formatDate } from '@/utils/date';
import { useCommentActions } from '@/hooks/useCommentActions';
import { CommentMenu } from './CommentMenu';
import { CommentEditModal } from './CommentEditModal';

interface CommentItemProps {
  comment: CommentItemType;
  restaurantId: number;
  likedCommentIds?: Set<number>;
  myCommentIds?: Set<number>;
  onLikeToggle?: () => void;
  onShowLogin?: () => void;
  onDelete?: (id: number) => void;
  onUpdateSuccess?: () => void;
  showReplyButton?: boolean;
  onReplyPress?: () => void;
}

export default function CommentItem({ 
  comment, 
  restaurantId, 
  likedCommentIds, 
  myCommentIds,
  onLikeToggle,
  onShowLogin,
  onDelete,
  onUpdateSuccess,
  showReplyButton = false,
  onReplyPress,
}: CommentItemProps) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  
  const {
    showMenu,
    setShowMenu,
    showEditModal,
    setShowEditModal,
    showReportMenu,
    setShowReportMenu,
    editText,
    setEditText,
    isLiked,
    likeCount,
    isMyComment,
    isUpdating,
    handleLikePress,
    handleEdit,
    handleDelete,
    handleReport,
    handleReportReasonSelect,
    handleSaveEdit,
  } = useCommentActions({
    comment,
    restaurantId,
    likedCommentIds,
    myCommentIds,
    onLikeToggle,
    onShowLogin,
    onDelete,
    onUpdateSuccess,
  });

  const handleReplyPress = () => {
    if (onReplyPress) {
      onReplyPress();
    } else {
      navigation.navigate('CommentDetail', { commentId: comment.id, restaurantId });
    }
  };

  const handleMenuPress = () => {
    setShowMenu(!showMenu);
  };

  // comment나 필수 필드가 없으면 빈 View 반환
  if (!comment || !comment.user || !comment.id || !comment.content) {
    return <View />;
  }

  return (
    <>
      <View className={`p-4 border-b border-gray-200 relative ${isMyComment ? 'bg-blue-50' : ''}`}>
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center gap-2">
            <Text className="font-medium">{comment.user?.student_year || '익명'}</Text>
            {comment.is_parent_writer && (
              <View className="bg-blue-500 px-2 py-0.5 rounded">
                <Text className="text-white text-xs">작성자</Text>
              </View>
            )}
          </View>
          <View className="flex-row gap-3">
            <Pressable className="flex-row gap-1 items-center" onPress={handleLikePress}>
              <Icon 
                name="good" 
                size={16} 
                color={isLiked ? "#3B82F6" : "#6B7280"} 
              />
              <Text className={isLiked ? "text-blue-500" : "text-gray-600"}>
                {likeCount}
              </Text>
            </Pressable>
            <View className="relative">
              <Pressable onPress={handleMenuPress}>
                <Icon name="meatball" size={16} color="#6B7280" />
              </Pressable>
              
              {showMenu && (
                <CommentMenu
                  isMyComment={isMyComment}
                  showReportMenu={showReportMenu}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReport={handleReport}
                  onReportReasonSelect={handleReportReasonSelect}
                />
              )}
            </View>
          </View>
        </View>
        <Text className="mb-2" style={{ flexWrap: 'wrap' }}>{comment.content || ''}</Text>
        <Text className="text-sm text-gray-500 mb-2">{formatDate(comment.created_at)}</Text>
        {showReplyButton && (
          <Pressable className="flex-row gap-1 items-center" onPress={handleReplyPress}>
            <Text className="text-blue-500">
              {comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0 ? `답글 ${comment.replies.length}개` : '답글쓰기'}
            </Text>
            <Icon name="rightAngle" size={8} color="black" />
          </Pressable>
        )}
      </View>

      {/* 배경 클릭 시 메뉴 닫기 */}
      {(showMenu || showReportMenu) && (
        <Pressable
          className="absolute inset-0 bg-transparent z-40"
          onPress={() => {
            setShowMenu(false);
            setShowReportMenu(false);
          }}
        />
      )}

      <CommentEditModal
        visible={showEditModal}
        editText={editText}
        isUpdating={isUpdating}
        onClose={() => setShowEditModal(false)}
        onTextChange={setEditText}
        onSave={handleSaveEdit}
      />
    </>
  );
}

