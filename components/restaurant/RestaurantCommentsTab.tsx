import { View, Text } from 'react-native';
import { RestaurantDetailResponse } from '@/api/restaurants/types';

interface RestaurantCommentsTabProps {
  restaurant: RestaurantDetailResponse;
}

export default function RestaurantCommentsTab({ restaurant }: RestaurantCommentsTabProps) {
  return (
    <View className="p-4">
      <Text className="text-lg font-semibold mb-4">댓글</Text>
      <Text className="text-gray-600 mb-4">
        📝 전체 {restaurant.comment_summary.total_count}개의 댓글
      </Text>
      <View className="flex-1 justify-center items-center py-8">
        <Text className="text-gray-500">댓글 기능은 준비 중입니다</Text>
      </View>
    </View>
  );
}