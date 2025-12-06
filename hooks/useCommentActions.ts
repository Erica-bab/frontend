/**
 * 댓글/답글 공통 액션 훅
 */
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { CommentItem as CommentItemType } from '@/api/restaurants/types';
import {
  useToggleCommentLike,
  useUpdateComment,
  useDeleteComment,
  useReportComment,
} from '@/api/restaurants/useReviewComment';
import { useAuth } from '@/api/auth/useAuth';
import { getSafeErrorMessage } from '@/utils/errorHandler';

interface UseCommentActionsProps {
  comment: CommentItemType;
  restaurantId: number;
  likedCommentIds?: Set<number>;
  myCommentIds?: Set<number>;
  onLikeToggle?: () => void;
  onShowLogin?: () => void;
  onDelete?: (id: number) => void;
  onUpdateSuccess?: () => void;
}

export function useCommentActions({
  comment,
  restaurantId,
  likedCommentIds,
  myCommentIds,
  onLikeToggle,
  onShowLogin,
  onDelete,
  onUpdateSuccess,
}: UseCommentActionsProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { mutate: toggleLike } = useToggleCommentLike(restaurantId);
  const { mutate: updateComment, isPending: isUpdating } = useUpdateComment(restaurantId, comment.id);
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment(restaurantId);
  const { mutate: reportComment } = useReportComment(restaurantId);

  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [editText, setEditText] = useState(comment?.content || '');

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

  // 현재 사용자가 댓글 작성자인지 확인
  const isMyComment = myCommentIds?.has(comment.id) ?? false;

  const handleLikePress = () => {
    if (!isAuthLoading && !isAuthenticated) {
      onShowLogin?.();
      return;
    }

    const newIsLiked = !isLiked;
    const previousLikeCount = likeCount;
    const previousIsLiked = isLiked;
    setIsLiked(newIsLiked);
    setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

    toggleLike(comment.id, {
      onSuccess: (data) => {
        setLikeCount(data.like_count);
        onLikeToggle?.();
      },
      onError: (error: any) => {
        setIsLiked(previousIsLiked);
        setLikeCount(previousLikeCount);
        if ((error as any)?.response?.status === 403) {
          onShowLogin?.();
        }
      },
    });
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
          const message = getSafeErrorMessage(error, '댓글 신고에 실패했습니다.');
          Alert.alert('오류', message);
        },
      }
    );
  };

  const handleSaveEdit = () => {
    if (!editText.trim()) {
      Alert.alert('오류', '댓글 내용을 입력해주세요.');
      return;
    }

    updateComment(
      { content: editText.trim() },
      {
        onSuccess: () => {
          setShowEditModal(false);
          onUpdateSuccess?.();
        },
        onError: (error: any) => {
          const message = getSafeErrorMessage(error, '댓글 수정에 실패했습니다.');
          Alert.alert('오류', message);
        },
      }
    );
  };

  return {
    // State
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
    isDeleting,
    // Handlers
    handleLikePress,
    handleEdit,
    handleDelete,
    handleReport,
    handleReportReasonSelect,
    handleSaveEdit,
  };
}

