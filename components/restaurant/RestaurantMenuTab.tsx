import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { RestaurantDetailResponse } from '@/api/restaurants/types';
import { useRestaurantMenus } from '@/api/restaurants/useRestaurant';
import { resolveImageUri } from '@/utils/image';
import LazyImage from '@/components/ui/LazyImage';

interface RestaurantMenuTabProps {
  restaurant: RestaurantDetailResponse;
}

export default function RestaurantMenuTab({ restaurant }: RestaurantMenuTabProps) {
  const { data: menuData, isLoading, error } = useRestaurantMenus(restaurant.id, {
    is_available: true,
  });

  useEffect(() => {
    if (menuData) {
      console.log('menus response', menuData);
    }
  }, [menuData]);

  if (isLoading) {
    return (
      <View className="p-8 items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-2">메뉴를 불러오는 중입니다.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="p-8 items-center">
        <Text className="text-red-500">메뉴를 불러오는 데 실패했습니다.</Text>
      </View>
    );
  }

  const menus = menuData?.menus || [];
  const totalCount = menuData?.total_count || 0;

  if (menus.length === 0) {
    return (
      <View className="p-8 items-center">
        <Text className="text-gray-500">등록된 메뉴가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View>
      {menus.map(menu => (
        <View key={menu.id} className="bg-white border-b border-gray-200 flex-row p-4">
          <View className="p-4 flex-1 justify-center">
            <Text className="font-bold text-xl">{menu.name}</Text>
            {menu.price && (
              <Text className="text-gray-600 text-md mt-1">
                {menu.price.toLocaleString()}원
              </Text>
            )}
            {menu.description && (
              <Text className="text-gray-500 text-sm mt-1">{menu.description}</Text>
            )}
          </View>
          {(() => {
            const rawImageUri = menu.image_url || menu.images?.[0];
            const imageUri = resolveImageUri(rawImageUri);
            if (!imageUri) return null;
            return (
              <LazyImage
                source={{ uri: imageUri }}
                style={{ width: 64, height: 64 }}
                className="rounded-lg bg-gray-500"
                threshold={100}
              />
            );
          })()}
        </View>
      ))}
      <Text className="text-gray-500 text-sm p-4">총 {totalCount}개의 메뉴</Text>
    </View>
  );
}
