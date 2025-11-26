import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import Icon from '@/components/Icon';

interface CommentInputProps {
  commentText: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function CommentInput({ 
  commentText, 
  onChangeText, 
  onSubmit, 
  isLoading,
  placeholder = '댓글을 입력하세요',
}: CommentInputProps) {
  return (
    <View className="m-4 border-t border-gray-200 flex-row gap-2 border border-gray-300 rounded-lg bg-white">
      <TextInput
        className="flex-1 px-3 py-4"
        placeholder={placeholder}
        value={commentText}
        onChangeText={onChangeText}
        editable={!isLoading}
      />
      <Pressable
        className="rounded-lg px-4 justify-center"
        onPress={onSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#3B82F6" />
        ) : (
          <Icon name="send" size={20} color="#3B82F6" />
        )}
      </Pressable>
    </View>
  );
}

