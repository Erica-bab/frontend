/**
 * 댓글 수정 모달 공통 컴포넌트
 */
import { View, Text, Pressable, TextInput, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';

interface CommentEditModalProps {
  visible: boolean;
  editText: string;
  isUpdating: boolean;
  onClose: () => void;
  onTextChange: (text: string) => void;
  onSave: () => void;
}

export function CommentEditModal({
  visible,
  editText,
  isUpdating,
  onClose,
  onTextChange,
  onSave,
}: CommentEditModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={onClose}
        />
        <View className="bg-white rounded-t-3xl p-6">
          <Text className="text-xl font-bold mb-4">댓글 수정</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 mb-4 min-h-[100px]"
            placeholder="댓글을 입력하세요"
            value={editText}
            onChangeText={onTextChange}
            multiline
            textAlignVertical="top"
          />
          <View className="flex-row gap-2">
            <Pressable
              className="flex-1 bg-gray-200 rounded-lg py-3"
              onPress={onClose}
            >
              <Text className="text-center font-medium">취소</Text>
            </Pressable>
            <Pressable
              className="flex-1 bg-blue-500 rounded-lg py-3"
              onPress={onSave}
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
  );
}

