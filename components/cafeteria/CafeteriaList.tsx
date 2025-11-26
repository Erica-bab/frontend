import { View, Text, ScrollView } from 'react-native';
import CafeteriaSection from '@/components/cafeteria/CafeteriaSection';
import {
  CafeteriaResponse,
  Restaurant,
  RestaurantCode,
  MealType,
} from '@/api/cafeteria/types';
import { useCurrentUser } from '@/api/auth/useAuth'

interface CafeteriaListProps {
  sortModeType: 'time' | 'location';
  selectedLocation: RestaurantCode;
  selectedTime: MealType;
  currentDate: Date;

  meal_data?: CafeteriaResponse;
  isLoading: boolean;
  meal_error: Error | null;
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
}: CafeteriaListProps) {
   const {data, error} = useCurrentUser();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8FAFC]">
        <Text>불러오는 중...</Text>
      </View>
    );
  }

  if (meal_error) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8FAFC] px-4">
        <Text>에러가 발생했어요.</Text>
        <Text>{meal_error.message}</Text>
      </View>
    );
  }

  if (!meal_data) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8FAFC]">
        <Text>메뉴 정보가 없습니다.</Text>
      </View>
    );
  }

  // 시간 
  if (sortModeType === 'time') {
    const restaurant = meal_data.restaurants.find(
      r => r.restaurant_code === selectedLocation,
    );

    if (!restaurant) {
      return (
        <View className="flex-1 items-center justify-center bg-[#F8FAFC]">
          <Text>해당 식당의 메뉴가 없습니다.</Text>
        </View>
      );
    }

    return (
      <ScrollView className="flex-1 px-10 py-4 bg-[#F8FAFC]">
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
              auth={data ? true : false}
            />
          );
        })}
      </ScrollView>
    );
  }

  // 장소 
  const targetMealType = selectedTime;

  return (
    <ScrollView className="flex-1 px-10 py-4 bg-[#F8FAFC]">
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
            auth={data ? true : false}
          />
        );
      })}
    </ScrollView>
  );
}
