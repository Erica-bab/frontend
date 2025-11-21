import { View, Text } from 'react-native';
import { RestaurantDetailResponse } from '@/api/restaurants/types';

interface RestaurantMenuTabProps {
  restaurant: RestaurantDetailResponse;
}

export default function RestaurantMenuTab({ restaurant }: RestaurantMenuTabProps) {
  return (
    <View className="p-4">
      {restaurant.menu_summary.popular_menus.length > 0 ? (
        <>
          <Text className="text-lg font-semibold mb-4">인기 메뉴</Text>
          {restaurant.menu_summary.popular_menus.map((menu) => (
            <View key={menu.id} className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-800 font-medium">{menu.name}</Text>
                {menu.price && (
                  <Text className="text-blue-600 font-semibold">₩{menu.price.toLocaleString()}</Text>
                )}
              </View>
            </View>
          ))}
          <Text className="text-gray-500 text-sm mt-2">총 {restaurant.menu_summary.total_count}개의 메뉴</Text>
        </>
      ) : (
        <View className="flex-1 justify-center items-center py-8">
          <Text className="text-gray-500">메뉴 정보가 없습니다</Text>
        </View>
      )}
    </View>
  );
}