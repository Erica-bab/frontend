import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommentItem as CommentItemType } from '@/api/restaurants/types';
import {
  useToggleCommentLike,
  useUpdateComment,
  useDeleteComment,
  useReportComment,
} from '@/api/restaurants/useReviewComment';
import { useAuth } from '@/api/auth/useAuth';
import { useMyCommentIds } from '@/hooks/useMyCommentIds';
import Icon from '@/components/Icon';
import { formatDate } from '@/utils/date';
import { getSafeErrorMessage } from '@/utils/errorHandler';

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
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { mutate: toggleLike } = useToggleCommentLike(restaurantId);
  const { mutate: updateComment, isPending: isUpdating } = useUpdateComment(restaurantId, comment.id);
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment(restaurantId);
  const { mutate: reportComment } = useReportComment(restaurantId);

  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [editText, setEditText] = useState(comment?.content || '');

  // 신고 사유 목록 (백엔드 Enum 키와 매핑)
  const reportReasons = [
    { label: '스팸', value: 'SPAM' },
    { label: '욕설/비방', value: 'ABUSE' },
    { label: '부적절한 내용', value: 'INAPPROPRIATE' },
    { label: '허위 정보', value: 'FAKE' },
    { label: '기타', value: 'OTHER' },
  ];
  
  // 좋아요한 댓글 목록에서 현재 댓글의 좋아요 상태 확인
  const isLikedFromServer = likedCommentIds?.has(comment.id) ?? false;
  const [isLiked, setIsLiked] = useState(isLikedFromServer);
  const [likeCount, setLikeCount] = useState(comment.like_count ?? 0);

  // 좋아요한 댓글 목록이 업데이트되면 상태 동기화
  useEffect(() => {
    setIsLiked(isLikedFromServer);
  }, [isLikedFromServer]);

  // 댓글 데이터가 업데이트되면 좋아요 수 동기화
  useEffect(() => {
    setLikeCount(comment.like_count ?? 0);
  }, [comment.like_count]);

  // 현재 사용자가 댓글 작성자인지 확인 (/users/me/activities 사용)
  const isMyComment = myCommentIds?.has(comment.id) ?? false;

  const handleReplyPress = () => {
    if (onReplyPress) {
      onReplyPress();
    } else {
      navigation.navigate('CommentDetail', { commentId: comment.id, restaurantId });
    }
  };

  const handleLikePress = () => {
    // 로그인 상태 확인
    if (!isAuthLoading && !isAuthenticated) {
      onShowLogin?.();
      return;
    }

    // 옵티미스틱 업데이트: 즉시 UI 업데이트
    const newIsLiked = !isLiked;
    const previousLikeCount = likeCount;
    const previousIsLiked = isLiked;
    setIsLiked(newIsLiked);
    setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

    // API 호출
    toggleLike(comment.id, {
      onSuccess: (data) => {
        // API 응답으로 좋아요 수 업데이트
        setLikeCount(data.like_count);
        // 좋아요한 댓글 목록 새로고침
        onLikeToggle?.();
      },
      onError: (error: any) => {
        // 에러 시 원래 상태로 롤백
        setIsLiked(previousIsLiked);
        setLikeCount(previousLikeCount);
        // 403 에러면 로그인 팝업 표시
        if (error?.response?.status === 403) {
          onShowLogin?.();
        }
        console.error('좋아요 실패:', error);
      },
    });
  };

  const handleMenuPress = () => {
    setShowMenu(!showMenu);
  };

  const handleEdit = () => {
    setShowMenu(false);
    setEditText(comment.content);
    setShowEditModal(true);
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (onDelete) {
      Alert.alert(
        '댓글 삭제',
        '정말 이 댓글을 삭제하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '삭제',
            style: 'destructive',
            onPress: () => {
              onDelete(comment.id);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        '댓글 삭제',
        '정말 이 댓글을 삭제하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '삭제',
            style: 'destructive',
            onPress: () => {
              deleteComment(comment.id, {
                onSuccess: () => {
                  Alert.alert('완료', '댓글이 삭제되었습니다.');
                },
                onError: (error: any) => {
                  const message = getSafeErrorMessage(error, '댓글 삭제에 실패했습니다.');
                  Alert.alert('오류', message);
                },
              });
            },
          },
        ]
      );
    }
  };

  const handleReport = () => {
    setShowMenu(false);
    setShowReportMenu(true);
  };

  const handleReportReasonSelect = (reasonValue: string) => {
    setShowReportMenu(false);
    reportComment(
      {
        commentId: comment.id,
        request: { reason: reasonValue },
      },
      {
        onSuccess: () => {
          Alert.alert('완료', '댓글이 신고되었습니다.');
        },
        onError: (error: any) => {
          Alert.alert('오류', '댓글 신고에 실패했습니다.');
        },
      }
    );
  };

  const handleSaveEdit = () => {
    if (!editText.trim()) {
      Alert.alert('입력 오류', '댓글 내용을 입력해주세요.');
      return;
    }
    updateComment(
      { content: editText.trim() },
      {
        onSuccess: () => {
          setShowEditModal(false);
          Alert.alert('완료', '댓글이 수정되었습니다.');
          onUpdateSuccess?.();
        },
        onError: (error: any) => {
          const message = getSafeErrorMessage(error, '댓글 수정에 실패했습니다.');
          Alert.alert('오류', message);
        },
      }
    );
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
              
              {/* 메뉴 팝업 */}
              {showMenu && (
                <View
                  className="absolute bg-white rounded-lg shadow-sm border border-gray-200 right-0 top-6 z-50"
                  style={{
                    minWidth: 80,
                    elevation: 5,
                  }}
                >
                  {isMyComment ? (
                    <>
                      <Pressable
                        className="py-3 px-4 border-b border-gray-200"
                        onPress={handleEdit}
                      >
                        <Text className="text-center">수정</Text>
                      </Pressable>
                      <Pressable
                        className="py-3 px-4 border-b border-gray-200"
                        onPress={handleDelete}
                      >
                        <Text className="text-center text-red-500">삭제</Text>
                      </Pressable>
                      <Pressable
                        className="py-3 px-4"
                        onPress={handleReport}
                      >
                        <Text className="text-center text-gray-600">신고</Text>
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      className="py-3 px-4"
                      onPress={handleReport}
                    >
                      <Text className="text-center text-gray-600">신고</Text>
                    </Pressable>
                  )}
                </View>
              )}

              {/* 신고 사유 메뉴 팝업 */}
              {showReportMenu && (
                <View
                  className="absolute bg-white rounded-lg shadow-sm border border-gray-200 right-0 top-6 z-50"
                  style={{
                    minWidth: 200,
                    maxWidth: 300,
                    maxHeight: 400,
                    elevation: 5,
                  }}
                >
                  <ScrollView className="max-h-96">
                    {reportReasons.map((reason, index) => (
                      <Pressable
                        key={index}
                        className={`py-3 px-4 ${
                          index < reportReasons.length - 1 ? 'border-b border-gray-200' : ''
                        }`}
                        onPress={() => handleReportReasonSelect(reason.value)}
                      >
                        <Text className="text-gray-900">{reason.label}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </View>
        <Text className="mb-2">{comment.content || ''}</Text>
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

      {/* 수정 모달 */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <Pressable
            className="flex-1 bg-black/50"
            onPress={() => setShowEditModal(false)}
          />
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold mb-4">댓글 수정</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 mb-4 min-h-[100px]"
              placeholder="댓글을 입력하세요"
              value={editText}
              onChangeText={setEditText}
              multiline
              textAlignVertical="top"
            />
            <View className="flex-row gap-2">
              <Pressable
                className="flex-1 bg-gray-200 rounded-lg py-3"
                onPress={() => setShowEditModal(false)}
              >
                <Text className="text-center font-medium">취소</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-blue-500 rounded-lg py-3"
                onPress={handleSaveEdit}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-center text-white font-medium">저장</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

