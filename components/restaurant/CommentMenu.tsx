/**
 * 댓글 메뉴 공통 컴포넌트
 */
import { View, Text, Pressable, ScrollView } from 'react-native';
import { REPORT_REASONS } from '@/constants/mappings';

interface CommentMenuProps {
  isMyComment: boolean;
  showReportMenu: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onReportReasonSelect: (reasonValue: string) => void;
}

export function CommentMenu({
  isMyComment,
  showReportMenu,
  onEdit,
  onDelete,
  onReport,
  onReportReasonSelect,
}: CommentMenuProps) {
  return (
    <>
      {/* 메뉴 팝업 */}
      {!showReportMenu && (
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
                onPress={onEdit}
              >
                <Text className="text-center">수정</Text>
              </Pressable>
              <Pressable
                className="py-3 px-4"
                onPress={onDelete}
              >
                <Text className="text-center text-red-500">삭제</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              className="py-3 px-4"
              onPress={onReport}
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
            {REPORT_REASONS.map((reason, index) => (
              <Pressable
                key={index}
                className={`py-3 px-4 ${
                  index < REPORT_REASONS.length - 1 ? 'border-b border-gray-200' : ''
                }`}
                onPress={() => onReportReasonSelect(reason.value)}
              >
                <Text className="text-gray-900">{reason.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );
}

