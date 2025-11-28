import { useState } from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDeleteComment, useCreateComment, useComments } from '@/api/restaurants/useReviewComment';
import { useAuth } from '@/api/auth/useAuth';
import { useLikedComments, useMyComments, useMyReplies } from '@/api/user/useUserActivity';
import { useLikedCommentIds } from '@/hooks/useLikedCommentIds';
import { useMyCommentIds } from '@/hooks/useMyCommentIds';
import Icon from '@/components/Icon';
import CommentItem from '@/components/restaurant/CommentItem';
import ReplyItem from '@/components/restaurant/ReplyItem';
import CommentInput from '@/components/restaurant/CommentInput';

export default function CommentDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { commentId, restaurantId } = route.params as { commentId?: number; restaurantId?: number };
  const [replyText, setReplyText] = useState('');

  const { isAuthenticated, isLoading: isAuthLoading, refreshAuthState } = useAuth();
  
  // 댓글 목록 조회
  const { data: commentsData, isLoading: isCommentsLoading, refetch: refetchComments } = useComments(restaurantId || 0);
  
  // 인증된 경우에만 좋아요한 댓글 목록 조회 (limit 최대값 100)
  const { refetch: refetchLikedComments } = useLikedComments(1, 100, isAuthenticated === true);
  const { refetch: refetchMyComments } = useMyComments(1, 100, isAuthenticated === true);
  const { refetch: refetchMyReplies } = useMyReplies(1, 100, isAuthenticated === true);
  const likedCommentIds = useLikedCommentIds(isAuthenticated === true);
  const myCommentIds = useMyCommentIds(isAuthenticated === true);
  
  // 원댓글과 대댓글 찾기
  const comment = commentsData?.comments.find(c => c.id === commentId);
  // 백엔드는 원댓글의 replies 배열에 대댓글을 포함시켜 반환함
  const replies = (comment?.replies || []).filter(reply => reply && reply.user);

  const { mutate: createComment, isPending: isCreatingReply } = useCreateComment(restaurantId || 0);
  const { mutate: deleteComment } = useDeleteComment(restaurantId || 0);

  const handleShowLogin = () => {
    (navigation.navigate as any)('Login', { onSuccess: refreshAuthState });
  };

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;

    // 로그인 확인
    if (!isAuthLoading && !isAuthenticated) {
      handleShowLogin();
      return;
    }

    if (!restaurantId || !commentId) return;

    createComment(
      {
        content: replyText.trim(),
        parent_id: commentId,
      },
      {
        onSuccess: () => {
          setReplyText('');
          refetchComments();
          // 답글 작성 후 유저 액티비티 새로고침 (자기 댓글 강조 및 수정 버튼 표시용)
          if (isAuthenticated) {
            refetchMyComments();
            refetchMyReplies();
          }
        },
        onError: (error: any) => {
          Alert.alert('오류', error?.response?.data?.detail || '답글 작성에 실패했습니다.');
        },
      }
    );
  };

  const handleDeleteComment = (id: number) => {
    if (!restaurantId || !id) return;
    deleteComment(id, {
      onSuccess: () => {
        // 원댓글이 삭제되면 뒤로가기, 대댓글이 삭제되면 목록만 새로고침
        if (id === commentId) {
          Alert.alert('완료', '댓글이 삭제되었습니다.', [
            {
              text: '확인',
              onPress: () => navigation.goBack(),
            },
          ]);
        } else {
          Alert.alert('완료', '댓글이 삭제되었습니다.');
          refetchComments();
        }
      },
      onError: (error: any) => {
        Alert.alert('오류', error?.response?.data?.detail || '댓글 삭제에 실패했습니다.');
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        {/* 헤더 */}
        <View className="flex-row items-center p-4 border-b border-gray-200">
          <Pressable onPress={() => navigation.goBack()}>
            <Icon name="cancel" size={24} />
          </Pressable>
          <Text className="flex-1 text-center text-lg font-medium">답글</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView className="flex-1">
          {isCommentsLoading ? (
            <View className="p-8 items-center">
              <Text className="text-gray-500">댓글 불러오는 중...</Text>
            </View>
          ) : !comment ? (
            <View className="p-8 items-center">
              <Text className="text-gray-500">댓글을 찾을 수 없습니다.</Text>
            </View>
          ) : (
            <>
              {/* 원본 댓글 */}
              {comment && comment.user && comment.id && (
                <CommentItem 
                  comment={comment} 
                  restaurantId={restaurantId || 0}
                  onDelete={handleDeleteComment}
                  onUpdateSuccess={() => {
                    refetchComments();
                    refetchMyComments();
                    refetchMyReplies();
                  }}
                  likedCommentIds={likedCommentIds}
                  myCommentIds={myCommentIds}
                  onLikeToggle={refetchLikedComments}
                  onShowLogin={handleShowLogin}
                />
              )}

              {/* 답글 목록 */}
              {replies
                .filter(reply => reply && reply.id && reply.user && reply.content)
                .map((reply) => (
                  <ReplyItem 
                    key={reply.id} 
                    comment={reply} 
                    restaurantId={restaurantId || 0}
                    onDelete={handleDeleteComment}
                    onUpdateSuccess={() => {
                      refetchComments();
                      refetchMyComments();
                      refetchMyReplies();
                    }}
                    likedCommentIds={likedCommentIds}
                    myCommentIds={myCommentIds}
                    onLikeToggle={refetchLikedComments}
                    onShowLogin={handleShowLogin}
                  />
                ))}
            </>
          )}
        </ScrollView>

        {/* 답글 입력 */}
        <CommentInput
          commentText={replyText}
          onChangeText={(text) => {
            // 인증 상태 로딩 중이면 팝업 표시하지 않음
            if (!isAuthLoading && !isAuthenticated && text.length > 0) {
              handleShowLogin();
              return;
            }
            setReplyText(text);
          }}
          onSubmit={handleSubmitReply}
          isLoading={isCreatingReply}
          placeholder="답글을 입력하세요"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
