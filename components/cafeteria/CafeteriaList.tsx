import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useState } from 'react';
import CafeteriaSection from '@/components/cafeteria/CafeteriaSection';
import {
  CafeteriaResponse,
  Restaurant,
  RestaurantCode,
  MealType,
} from '@/api/cafeteria/types';
import { useAuth } from '@/api/auth/useAuth'

interface CafeteriaListProps {
  sortModeType: 'time' | 'location';
  selectedLocation: RestaurantCode;
  selectedTime: MealType;
  currentDate: Date;

  meal_data?: CafeteriaResponse;
  isLoading: boolean;
  meal_error: Error | null;
  onShowLogin: () => void;
  onRefresh?: () => void;
}

// 시간대 순서 고정
const MEAL_TYPES: MealType[] = ['조식', '중식', '석식'];

// Restaurant + MealType → 해당 시간대 메뉴 배열
function getMenusByMealType(restaurant: Restaurant, mealType: MealType) {
  switch (mealType) {
    case '조식':
      return restaurant.조식;
    case '중식':
      return restaurant.중식;
    case '석식':
      return restaurant.석식;
    default:
      return [];
  }
}

export default function CafeteriaList({
  sortModeType,
  selectedLocation,
  selectedTime,
  currentDate,
  meal_data,
  isLoading,
  meal_error,
  onShowLogin,
  onRefresh,
}: CafeteriaListProps) {
   const {isAuthenticated} = useAuth();
   const [refreshing, setRefreshing] = useState(false);

   const handleRefresh = async () => {
     setRefreshing(true);
     if (onRefresh) {
       await onRefresh();
     }
     // Simulate a network request or a delay for the refresh indicator
     setTimeout(() => {
       setRefreshing(false);
     }, 500);
   };

  // 로딩 중이지만 데이터가 없는 경우에만 로딩 화면 표시
  // 데이터가 있으면 로딩 상태와 관계없이 데이터를 표시 (캐시된 데이터 활용)
  if (isLoading && !meal_data) {
    return (
      <ScrollView 
        className="flex-1 px-10 py-4 bg-[#F8FAFC]"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
      >
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-gray-500 text-lg">불러오는 중...</Text>
        </View>
      </ScrollView>
    );
  }

  if (meal_error) {
    return (
      <ScrollView 
        className="flex-1 px-10 py-4 bg-[#F8FAFC]"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
      >
        <View className="flex-1 items-center justify-center py-20 px-4">
          <Text className="text-gray-500 text-lg">에러가 발생했어요.</Text>
          <Text className="text-gray-400 text-sm mt-2">{meal_error.message}</Text>
        </View>
      </ScrollView>
    );
  }

  // 데이터가 없는 경우 (로딩 완료 후에도 데이터가 없을 때)
  if (!meal_data) {
    return (
      <ScrollView 
        className="flex-1 px-10 py-4 bg-[#F8FAFC]"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
      >
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-gray-500 text-lg">메뉴 정보가 없습니다.</Text>
        </View>
      </ScrollView>
    );
  }

  // 시간 
  if (sortModeType === 'time') {
    const restaurant = meal_data.restaurants.find(
      r => r.restaurant_code === selectedLocation,
    );

    if (!restaurant) {
      return (
        <ScrollView 
          className="flex-1 px-10 py-4 bg-[#F8FAFC]"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
        >
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-lg">데이터가 없습니다</Text>
          </View>
        </ScrollView>
      );
    }

    const hasAnyMenu = MEAL_TYPES.some(mealType => {
      const menus = getMenusByMealType(restaurant, mealType);
      return menus && menus.length > 0;
    });

    if (!hasAnyMenu) {
      return (
        <ScrollView 
          className="flex-1 px-10 py-4 bg-[#F8FAFC]"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
        >
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-lg">데이터가 없습니다</Text>
        </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView 
        className="flex-1 px-10 py-4 bg-[#F8FAFC]"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
      >
        {MEAL_TYPES.map(mealType => {
          const menus = getMenusByMealType(restaurant, mealType);
          if (!menus || menus.length === 0) return null;

          return (
            <CafeteriaSection
              key={mealType}
              sortModeType="time"
              restaurant={restaurant}
              mealType={mealType}
              menus={menus}
              latitude={Number(restaurant.latitude)}
              longitude={Number(restaurant.longitude)}
              viewName={restaurant.restaurant_name}
              auth={!!isAuthenticated}
              onShowLogin={onShowLogin}
            />
          );
        })}
      </ScrollView>
    );
  }

  // 장소 
  const targetMealType = selectedTime;

  const hasAnyMenu = meal_data.restaurants.some(restaurant => {
    const menus = getMenusByMealType(restaurant, targetMealType);
    return menus && menus.length > 0;
  });

  if (!hasAnyMenu) {
    return (
      <ScrollView 
        className="flex-1 px-10 py-4 bg-[#F8FAFC]"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
      >
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-gray-500 text-lg">데이터가 없습니다</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      className="flex-1 px-10 py-4 bg-[#F8FAFC]"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#3B82F6"
          colors={['#3B82F6']}
        />
      }
    >
      {meal_data.restaurants.map(restaurant => {
        const menus = getMenusByMealType(restaurant, targetMealType);
        if (!menus || menus.length === 0) return null;

        return (
          <CafeteriaSection
            key={restaurant.restaurant_code}
            sortModeType="location"
            restaurant={restaurant}
            mealType={targetMealType}
            menus={menus}
            latitude={Number(restaurant.latitude)}
            longitude={Number(restaurant.longitude)}
            viewName={restaurant.restaurant_name}
            auth={!!isAuthenticated}
            onShowLogin={onShowLogin}
          />
        );
      })}
    </ScrollView>
  );
}
