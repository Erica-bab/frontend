import { View, TextInput, Pressable, ActivityIndicator } from "react-native";
import Icon from "@/components/Icon";

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
  placeholder = "댓글을 입력하세요",
}: CommentInputProps) {
  return (
    <View className="mx-4 mb-8 mt-2 flex-row gap-2 border border-gray-300 rounded-lg bg-white">
      <TextInput
        className="flex-1 px-3 py-4 text-black"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={commentText}
        onChangeText={onChangeText}
        editable={!isLoading}
        // Android 키보드 즉시 응답 최적화
        keyboardType="default"
        returnKeyType="send"
        onSubmitEditing={onSubmit}
        blurOnSubmit={false}
      />
      <Pressable
        className="rounded-lg px-4 justify-center"
        onPress={onSubmit}
        disabled={isLoading}
        // 터치 영역 명확히 구분
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
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
