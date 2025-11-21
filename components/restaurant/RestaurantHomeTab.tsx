import { View, Text } from 'react-native';
import { RestaurantDetailResponse } from '@/api/restaurants/types';

interface RestaurantHomeTabProps {
  restaurant: RestaurantDetailResponse;
}

export default function RestaurantHomeTab({ restaurant }: RestaurantHomeTabProps) {
  return (
    <View className="p-4">
      <Text className="text-lg font-semibold mb-2">정보</Text>
      <Text className="text-gray-600 mb-1">
        📍 {restaurant.location.address || '주소 정보 없음'}
      </Text>
      {restaurant.phone && (
        <Text className="text-gray-600 mb-1">📞 {restaurant.phone}</Text>
      )}
      <Text className="text-gray-600 mb-1">
        ⭐ {restaurant.rating.average.toFixed(1)} ({restaurant.rating.count}개 리뷰)
      </Text>
      {restaurant.menu_summary.average_price && (
        <Text className="text-gray-600 mb-1">
          💰 평균 가격: ₩{restaurant.menu_summary.average_price.toLocaleString()}
        </Text>
      )}
      <Text className="text-gray-600 mb-1">
        📝 댓글 {restaurant.comment_summary.total_count}개
      </Text>

      {restaurant.description && (
        <View className="mt-4">
          <Text className="text-lg font-semibold mb-2">소개</Text>
          <Text className="text-gray-700">{restaurant.description}</Text>
        </View>
      )}
    </View>
  );
}