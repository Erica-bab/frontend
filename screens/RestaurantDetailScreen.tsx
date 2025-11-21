import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
// MapView는 Expo Go에서 지원하지 않음 - 네이티브 빌드 필요
// import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRestaurantDetail } from '@/api/restaurants/useRestaurant';
import RestaurantStatusTag from '@/components/ui/RestaurantStatusTag';
import TextIconButton from '@/components/ui/TextIconButton';
import RestaurantHomeTab from '@/components/restaurant/RestaurantHomeTab';
import RestaurantMenuTab from '@/components/restaurant/RestaurantMenuTab';
import RestaurantCommentsTab from '@/components/restaurant/RestaurantCommentsTab';

type RestaurantTabType = 'home' | 'menu' | 'comments';

export default function RestaurantDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { restaurantId } = route.params as { restaurantId?: string };
  const [selectedTab, setSelectedTab] = useState<RestaurantTabType>('home');

  const { data: restaurant, isLoading, error } = useRestaurantDetail(Number(restaurantId));

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">로딩 중...</Text>
      </SafeAreaView>
    );
  }

  if (error || !restaurant) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-5">
        <Text className="text-red-500 text-center">
          {error?.message || '레스토랑 정보를 불러올 수 없습니다.'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className='h-64 bg-gray-200 justify-center items-center'>
        <Text className='text-gray-500'>지도 영역</Text>
        <Text className='text-gray-400 text-sm'>{restaurant.location.address}</Text>
      </View>
      <ScrollView className="flex-1">
        <View className='p-4'>
          <View className="flex-row items-center p-4">
            <Text className="text-lg text-blue-500">{restaurant.name}</Text>
            <Text className="ml-1">{restaurant.category}</Text>
          </View>
          <View className='ml-4'>
            <RestaurantStatusTag
              status={restaurant.status as '영업중' | '영업종료' | '브레이크타임'}
              rating={restaurant.rating.average}
            />
          </View>
        </View>
        <View className="border-t border-t-2 border-gray-200 mb-4">
          <View className="w-full flex-row justify-around border-b border-gray-200">
            <TextIconButton
              isOn={selectedTab === 'home'}
              onPress={() => setSelectedTab('home')}
              text="홈"
              baseBoxClass="-pb-4"
              offTextClass="text-[#000000] font-medium text-lg"
              onTextClass="text-[#2563EB] font-medium text-lg"
              onBoxClass="border-b-2 border-[#2563EB] -pb-2"
            />
            <TextIconButton
              isOn={selectedTab === 'menu'}
              onPress={() => setSelectedTab('menu')}
              text="메뉴"
              baseBoxClass="-pb-4"
              offTextClass="text-[#000000] font-medium text-lg"
              onTextClass="text-[#2563EB] font-medium text-lg"
              onBoxClass="border-b-2 border-[#2563EB] -pb-2"
            />
            <TextIconButton
              isOn={selectedTab === 'comments'}
              onPress={() => setSelectedTab('comments')}
              text="댓글"
              baseBoxClass="-pb-4"
              offTextClass="text-[#000000] font-medium text-lg"
              onTextClass="text-[#2563EB] font-medium text-lg"
              onBoxClass="border-b-2 border-[#2563EB] -pb-2"
            />
          </View>
        </View>

        {/* 탭 콘텐츠 조건부 렌더링 */}
        {selectedTab === 'home' && <RestaurantHomeTab restaurant={restaurant} />}
        {selectedTab === 'menu' && <RestaurantMenuTab restaurant={restaurant} />}
        {selectedTab === 'comments' && <RestaurantCommentsTab restaurant={restaurant} />}
      </ScrollView>
    </SafeAreaView>
  );
}
