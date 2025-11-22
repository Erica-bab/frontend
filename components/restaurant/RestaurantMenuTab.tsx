import { View, Text, ScrollView, Image } from 'react-native';
import { RestaurantDetailResponse, PopularMenu } from '@/api/restaurants/types';

interface RestaurantMenuTabProps {
  restaurant: RestaurantDetailResponse;
}

// 목데이터
const mockMenus: PopularMenu[] = [
  { id: 1, name: '김치찌개', price: 8000, image_url: 'https://via.placeholder.com/100' },
  { id: 2, name: '된장찌개', price: 8000, image_url: 'https://via.placeholder.com/100' },
  { id: 3, name: '제육볶음', price: 9000, image_url: 'https://via.placeholder.com/100' },
  { id: 4, name: '불고기 정식', price: 10000, image_url: 'https://via.placeholder.com/100' },
  { id: 5, name: '비빔밥', price: 8500, image_url: null },
  { id: 6, name: '순두부찌개', price: 7500, image_url: null },
];

export default function RestaurantMenuTab({ restaurant }: RestaurantMenuTabProps) {
  // 실제 데이터가 없으면 목데이터 사용
  const menus = restaurant.menu_summary.popular_menus.length > 0
    ? restaurant.menu_summary.popular_menus
    : mockMenus;
  const totalCount = restaurant.menu_summary.total_count > 0
    ? restaurant.menu_summary.total_count
    : mockMenus.length;

  return (
    <View>
      {menus.map((menu) => (
        <View key={menu.id} className="bg-white border-b border-gray-200 flex-row p-4">
          <View className="p-4 flex-1 justify-center">
            <Text className="font-bold text-xl">{menu.name}</Text>
            {menu.price && (
              <Text className="text-gray-600 text-md mt-1">{menu.price.toLocaleString()}원</Text>
            )}
          </View>
          {menu.image_url && (
            <Image
              source={{ uri: menu.image_url }}
              className="w-16 h-16 rounded-lg bg-blue-500"
            />
          )}
        </View>
      ))}
      <Text className="text-gray-500 text-sm p-4">총 {totalCount}개의 메뉴</Text>
    </View>
  );
}