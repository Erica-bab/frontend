import { View, Text, Pressable } from 'react-native';
import { CommentItem as CommentItemType } from '@/api/restaurants/types';
import Icon from '@/components/Icon';
import { formatDate } from '@/utils/date';
import { useCommentActions } from '@/hooks/useCommentActions';
import { CommentMenu } from './CommentMenu';
import { CommentEditModal } from './CommentEditModal';

interface ReplyItemProps {
  comment: CommentItemType;
  restaurantId: number;
  likedCommentIds?: Set<number>;
  myCommentIds?: Set<number>;
  onLikeToggle?: () => void;
  onShowLogin?: () => void;
  onDelete?: (id: number) => void;
  onUpdateSuccess?: () => void;
}

export default function ReplyItem({ 
  comment, 
  restaurantId, 
  likedCommentIds, 
  myCommentIds,
  onLikeToggle,
  onShowLogin,
  onDelete,
  onUpdateSuccess,
}: ReplyItemProps) {
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

  const handleMenuPress = () => {
    setShowMenu(!showMenu);
  };

  // comment나 필수 필드가 없으면 빈 View 반환
  if (!comment || !comment.user || !comment.id || !comment.content) {
    return <View />;
  }

  return (
    <>
      <View className="p-4 relative">
        <View className="flex-row gap-2">
          {/* Reply 아이콘 영역 */}
          <View className="items-center pt-1">
            <Icon name="reply" size={16} color="#6B7280" />
          </View>

          {/* 내용 영역 - 회색 배경 버블 */}
          <View className={`flex-1 ${isMyComment ? 'bg-blue-100' : 'bg-gray-100'} rounded-lg p-3`}>
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
            <Text className="mb-2">{comment.content || ''}</Text>
            <Text className="text-sm text-gray-500">{formatDate(comment.created_at)}</Text>
          </View>
        </View>
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

