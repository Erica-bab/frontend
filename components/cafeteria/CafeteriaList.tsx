import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
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
  isFetching?: boolean;
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
  isFetching = false,
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
     setTimeout(() => {
       setRefreshing(false);
     }, 500);
   };

  // 조건식 제거: 화면은 무조건 렌더링, 내용만 상태에 따라 처리
  const isRefreshing = refreshing || isLoading || isFetching;
  // meal_data가 없으면 아직 로딩 중이거나 데이터가 없는 상태
  // isLoading이나 isFetching이 true이거나 meal_data가 undefined이면 로딩 중으로 간주
  const isActuallyLoading = isLoading || isFetching || !meal_data;
  const hasData = meal_data && meal_data.restaurants && meal_data.restaurants.length > 0;

  // 시간순 정렬일 때
  if (sortModeType === 'time') {
    const restaurant = hasData 
      ? meal_data.restaurants.find(r => r.restaurant_code === selectedLocation)
      : null;

    return (
      <View className="flex-1 bg-[#F8FAFC] relative">
        <ScrollView 
          className="flex-1 px-10 py-4"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
        >
          {meal_error ? (
            <View className="flex-1 items-center justify-center py-20 px-4">
              <Text className="text-gray-500 text-lg">에러가 발생했어요.</Text>
              <Text className="text-gray-400 text-sm mt-2">{meal_error.message}</Text>
            </View>
          ) : !hasData || !restaurant ? (
            <View className="flex-1 items-center justify-center py-20">
              {isActuallyLoading ? (
                <>
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text className="text-gray-500 text-lg mt-4">불러오는 중...</Text>
                </>
              ) : (
                <Text className="text-gray-500 text-lg">데이터가 없습니다</Text>
              )}
            </View>
          ) : (
            MEAL_TYPES.map(mealType => {
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
            })
          )}
        </ScrollView>
        {/* 로딩 오버레이 - 새로고침 중일 때 */}
        {isFetching && hasData && (
          <View className="absolute top-0 left-0 right-0 bottom-0 bg-white/50 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        )}
      </View>
    );
  }

  // 장소순 정렬일 때
  const targetMealType = selectedTime;

  return (
    <View className="flex-1 bg-[#F8FAFC] relative">
      <ScrollView 
        className="flex-1 px-10 py-4"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
      >
        {meal_error ? (
          <View className="flex-1 items-center justify-center py-20 px-4">
            <Text className="text-gray-500 text-lg">에러가 발생했어요.</Text>
            <Text className="text-gray-400 text-sm mt-2">{meal_error.message}</Text>
          </View>
        ) : !hasData ? (
          <View className="flex-1 items-center justify-center py-20">
            {isActuallyLoading ? (
              <>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-500 text-lg mt-4">불러오는 중...</Text>
              </>
            ) : (
              <Text className="text-gray-500 text-lg">메뉴 정보가 없습니다.</Text>
            )}
          </View>
        ) : (
          meal_data.restaurants.map(restaurant => {
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
          })
        )}
      </ScrollView>
      {/* 로딩 오버레이 - 새로고침 중일 때 */}
      {isFetching && hasData && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-white/50 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}
    </View>
  );
}
