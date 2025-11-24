import { View } from 'react-native';
import CafeteriaInfo from '@/components/cafeteria/CafeteriaInfo';
import TextIconBox from '@/components/ui/TextIconBox';
import { Restaurant, MealType, MealItem } from '@/api/cafeteria/types';
import { IconName } from '@/components/Icon';

interface CafeteriaSectionProps {
  sortModeType: 'time' | 'location';
  restaurant: Restaurant;
  mealType: MealType;
  menus: MealItem[];
  latitude: number;
  longitude: number;
  viewName?: string;
}

// MealType(조/중/석) → open_times 키 매핑
const mealTypeToOpenKey = {
  조식: 'Breakfast',
  중식: 'Lunch',
  석식: 'Dinner',
} as const;

// MealType → 아이콘 이름
const mealTypeToIcon: Record<MealType, IconName> = {
  조식: 'breakfast',
  중식: 'lunch',
  석식: 'dinner',
};

export default function CafeteriaSection({
  sortModeType,
  restaurant,
  mealType,
  menus,
  latitude,
  longitude,
  viewName,
}: CafeteriaSectionProps) {
  const openKey = mealTypeToOpenKey[mealType];
  const openTime = restaurant.open_times[openKey];

  const mainLabelText =
    sortModeType === 'time' ? mealType : restaurant.restaurant_name;

  const mainLabelIcon: IconName =
    sortModeType === 'time' ? mealTypeToIcon[mealType] : 'school';

  const locationText = `${restaurant.building} ${restaurant.floor}`;

  return (
    <View className="mb-6">
      {/* 섹션 헤더 */}
      <View className="flex-col justify-left items-start mb-3">
        {/* 왼쪽: 시간/장소 메인 배지 */}
        <TextIconBox
          icon={mainLabelIcon}
          iconColor="black"
          text={mainLabelText}
          textClass="text-3xl font-bold"
          iconSize={35}
        />

        {/* 오른쪽: 운영시간 + 위치 배지 */}
        <View className="flex-col gap-2">
          {openTime && (
            <TextIconBox
              icon="clock"
              iconColor="#6B7280"
              iconSize={14}
              text={openTime}
              textClass="text-base text-[#6B7280]"
              boxClass="pl-4"
            />
          )}
        </View>
      </View>

      {/* 메뉴 카드들 */}
      {menus.map(menu => (
        <View key={menu.id} className="mb-3">
          <CafeteriaInfo
            name={menu.tags[0] ?? menu.korean_name[0] ?? ''}
            price={menu.price}
            menu={menu.korean_name}
            location={locationText}
            sortModeType={sortModeType}
            latitude={latitude}
            longitude={longitude}
            viewName={viewName}
          />
        </View>
      ))}
    </View>
  );
}
