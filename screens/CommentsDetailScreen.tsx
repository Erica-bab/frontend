import { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from '@/components/Icon';

// 목데이터
const mockComment = {
  id: 1,
  user: { student_year: '21학번' },
  content: '학생들이 먹기에 살짝 비싸긴 해도 보장된 맛임',
  like_count: 5,
  created_at: '2024-11-01T13:00:00',
};

const mockReplies = [
  {
    id: 101,
    user: { student_year: '22학번' },
    content: '동의합니다 맛있어요',
    like_count: 2,
    created_at: '2024-11-01T14:00:00',
  },
  {
    id: 102,
    user: { student_year: '20학번' },
    content: '가격 대비 괜찮은 것 같아요',
    like_count: 1,
    created_at: '2024-11-01T15:30:00',
  },
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const mins = date.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hours}:${mins}`;
}

// 댓글/답글 아이템 컴포넌트
function CommentItem({ comment, isReply = false }: { comment: typeof mockComment; isReply?: boolean }) {
  return (
    <View className={`p-4 border-b border-gray-200 ${isReply ? 'bg-gray-50 pl-8' : ''}`}>
      <View className="flex-row justify-between mb-2">
        <Text className="font-medium">{comment.user.student_year}</Text>
        <View className="flex-row gap-3">
          <Pressable className="flex-row gap-1 items-center">
            <Icon name="good" size={16} color="#6B7280" />
            <Text className="text-gray-600">{comment.like_count}</Text>
          </Pressable>
          <Pressable>
            <Icon name="meatball" size={16} color="#6B7280" />
          </Pressable>
        </View>
      </View>
      <Text className="mb-2">{comment.content}</Text>
      <Text className="text-sm text-gray-500">{formatDate(comment.created_at)}</Text>
    </View>
  );
}

export default function CommentDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { commentId } = route.params as { commentId?: number };
  const [replyText, setReplyText] = useState('');

  // TODO: commentId로 실제 댓글 데이터 조회
  const comment = mockComment;
  const replies = mockReplies;

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    // TODO: API 연결
    console.log('답글 작성:', replyText, 'commentId:', commentId);
    setReplyText('');
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
          {/* 원본 댓글 */}
          <CommentItem comment={comment} />

          {/* 답글 목록 */}
          {replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </ScrollView>

        {/* 답글 입력 */}
        <View className="p-4 border-t border-gray-200 flex-row gap-2 bg-white">
          <TextInput
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            placeholder="답글을 입력하세요"
            value={replyText}
            onChangeText={setReplyText}
          />
          <Pressable
            className="bg-blue-500 rounded-lg px-4 justify-center"
            onPress={handleSubmitReply}
          >
            <Icon name="send" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
