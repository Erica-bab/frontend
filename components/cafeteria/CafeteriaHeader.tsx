import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RestaurantCode, MealType, CafeteriaResponse } from '@/api/cafeteria/types';
import TextIconButton from '@/components/ui/TextIconButton';

type sortType = 'time' | 'location';

interface CafeteriaHeaderProps {
  sortModeType: sortType;
  onChangeSortModeType: (type: sortType) => void;

  selectedLocation: RestaurantCode;
  onChangeLocation: (type: RestaurantCode) => void;

  selectedTime: MealType;
  onChangeTime: (type: MealType) => void;

  currentDate: Date;
  onPrevDate: () => void;
  onNextDate: () => void;
  onGoToToday: () => void;
  meal_data?: CafeteriaResponse;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}. ${month}. ${day}`;
}

function formatDay(date: Date) {
  const dayIndex = date.getDay();
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return `${days[dayIndex]}`;
}

// Restaurant + MealType → 해당 시간대 메뉴 배열
function getMenusByMealType(restaurant: any, mealType: MealType) {
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

export default function CafeteriaHeader({
  sortModeType,
  onChangeSortModeType,
  selectedLocation,
  onChangeLocation,
  selectedTime,
  onChangeTime,
  currentDate,
  onPrevDate,
  onNextDate,
  onGoToToday,
  meal_data,
}: CafeteriaHeaderProps) {
  // 오늘 날짜인지 확인
  const isToday = () => {
    const today = new Date();
    return (
      currentDate.getFullYear() === today.getFullYear() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getDate() === today.getDate()
    );
  };
  const TabClasses = {
    baseBoxClass: '-pb-4',
    offTextClass: 'text-[#000000] font-medium text-xl',
    onTextClass: 'text-[#2563EB] font-medium text-xl',
    onBoxClass: 'border-b-2 border-[#2563EB] -pb-2',
  };

  const handleDatePress = () => {
    if (!isToday()) {
      Alert.alert(
        '오늘로 이동',
        '오늘로 이동할까요?',
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '확인',
            onPress: onGoToToday,
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView className="w-full flex bg-white px-10 -mb-4">
      {/* sort */}
      <View className="flex-row justify-end -mr-4 mt-1">
        <ChangeSortButton
          sortModeType={sortModeType}
          onChangeSortModeType={onChangeSortModeType}
        />
      </View>

      {/* time */}
      <View className="flex-row items-center justify-center mb-4 gap-2">
        <TextIconButton
          isOn={false}
          iconName="rightAngle"
          iconSize={25}
          iconStyle={{ transform: [{ rotate: '180deg' }] }}
          onPress={onPrevDate}
          baseBoxClass="px-0 py-0"
        />
        <Pressable onPress={handleDatePress}>
          <View className="flex-row items-center gap-2">
            <Text className="font-bold text-4xl mt-1">
              {formatDate(currentDate)}
            </Text>
            <Text className="font-medium text-xl mt-3 text-[#6B7280] mr-2">
              {formatDay(currentDate)}
            </Text>
          </View>
        </Pressable>
        <TextIconButton
          isOn={false}
          iconName="rightAngle"
          iconSize={25}
          onPress={onNextDate}
          baseBoxClass="px-0 py-0"
        />
      </View>

      {/* tab */}
      {sortModeType === 'time' ? (
        // location tab (시간 기준 정렬일 때 식당 탭)
        <View className="w-full flex-row justify-around">
          {(['re12', 're11', 're15', 're13'] as RestaurantCode[]).map((locationCode) => {
            const locationNames = {
              're12': '학생',
              're11': '교직원',
              're15': '창업보육',
              're13': '창의관',
            };
            
            // 해당 식당의 모든 시간대 메뉴 개수 계산
            const restaurant = meal_data?.restaurants.find(r => r.restaurant_code === locationCode);
            const menuCount = restaurant 
              ? (restaurant.조식?.length || 0) + (restaurant.중식?.length || 0) + (restaurant.석식?.length || 0)
              : 0;
            
            return (
              <Pressable
                key={locationCode}
                onPress={() => onChangeLocation(locationCode)}
                className={`items-center ${TabClasses.baseBoxClass} ${selectedLocation === locationCode ? TabClasses.onBoxClass : ''}`}
              >
                <Text className={`text-xs mb-1 ${selectedLocation === locationCode ? 'text-blue-400' : 'text-gray-400'}`}>
                  {menuCount}개
                </Text>
                <Text className={selectedLocation === locationCode ? TabClasses.onTextClass : TabClasses.offTextClass}>
                  {locationNames[locationCode]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        // time tab (식당 기준 정렬일 때 시간대 탭)
        <View className="w-full flex-row justify-around">
          {(['조식', '중식', '석식'] as MealType[]).map((mealType) => {
            // 모든 식당의 해당 시간대 메뉴 개수 계산
            const menuCount = meal_data?.restaurants.reduce((total, restaurant) => {
              const menus = getMenusByMealType(restaurant, mealType);
              return total + (menus?.length || 0);
            }, 0) || 0;
            
            return (
              <Pressable
                key={mealType}
                onPress={() => onChangeTime(mealType)}
                className={`items-center ${TabClasses.baseBoxClass} ${selectedTime === mealType ? TabClasses.onBoxClass : ''}`}
              >
                <Text className={`text-xs mb-1 ${selectedTime === mealType ? 'text-blue-400' : 'text-gray-400'}`}>
                  {menuCount}개
                </Text>
                <Text className={selectedTime === mealType ? TabClasses.onTextClass : TabClasses.offTextClass}>
                  {mealType}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

function ChangeSortButton({
  sortModeType,
  onChangeSortModeType,
}: {
  sortModeType: sortType;
  onChangeSortModeType: (type: sortType) => void;
}) {
  const isTimeMode = sortModeType === 'time';
  const iconName = isTimeMode ? 'clock' : 'school';
  const nextMode: sortType = isTimeMode ? 'location' : 'time';

  return (
    <TextIconButton
      isOn={false}
      iconName={iconName}
      iconSize={20}
      onIconColor="#000000"
      offIconColor="#000000"
      onPress={() => onChangeSortModeType(nextMode)}
      baseBoxClass="px-2 py-1"
    />
  );
}
