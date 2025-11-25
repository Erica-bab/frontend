import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RestaurantCode, MealType } from '@/api/cafeteria/types';
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
}: CafeteriaHeaderProps) {
  const TabClasses = {
    baseBoxClass: '-pb-4',
    offTextClass: 'text-[#000000] font-medium text-xl',
    onTextClass: 'text-[#2563EB] font-medium text-xl',
    onBoxClass: 'border-b-2 border-[#2563EB] -pb-2',
  };

  return (
    <SafeAreaView className="w-full flex bg-white px-10 -mb-4">
      {/* 정렬 버튼 */}
      <View className="flex-row justify-end -mr-4 mt-1">
        <ChangeSortButton
          sortModeType={sortModeType}
          onChangeSortModeType={onChangeSortModeType}
        />
      </View>

      {/* 날짜 */}
      <View className="flex-row items-center justify-center mb-4 gap-2">
        <TextIconButton
          isOn={false}
          iconName="rightAngle"
          iconSize={25}
          iconStyle={{ transform: [{ rotate: '180deg' }] }}
          onPress={onPrevDate}
          baseBoxClass="px-0 py-0"
        />
        <Text className="font-bold text-4xl mt-1">
          {formatDate(currentDate)}
        </Text>
        <Text className="font-medium text-xl mt-3 text-[#6B7280] mr-2">
          {formatDay(currentDate)}
        </Text>
        <TextIconButton
          isOn={false}
          iconName="rightAngle"
          iconSize={25}
          onPress={onNextDate}
          baseBoxClass="px-0 py-0"
        />
      </View>

      {/* 탭 */}
      {sortModeType === 'time' ? (
        // 위치 탭
        <View className="w-full flex-row justify-around">
          <TextIconButton
            isOn={selectedLocation === 're12'}
            onPress={() => onChangeLocation('re12')}
            text="학생"
            {...TabClasses}
          />
          <TextIconButton
            isOn={selectedLocation === 're11'}
            onPress={() => onChangeLocation('re11')}
            text="교직원"
            {...TabClasses}
          />
          <TextIconButton
            isOn={selectedLocation === 're15'}
            onPress={() => onChangeLocation('re15')}
            text="창업보육"
            {...TabClasses}
          />
          <TextIconButton
            isOn={selectedLocation === 're13'}
            onPress={() => onChangeLocation('re13')}
            text="창의관"
            {...TabClasses}
          />
        </View>
      ) : (
        // 시간대 탭 (조/중/석)
        <View className="w-full flex-row justify-around">
          <TextIconButton
            isOn={selectedTime === '조식'}
            onPress={() => onChangeTime('조식')}
            text="조식"
            {...TabClasses}
          />
          <TextIconButton
            isOn={selectedTime === '중식'}
            onPress={() => onChangeTime('중식')}
            text="중식"
            {...TabClasses}
          />
          <TextIconButton
            isOn={selectedTime === '석식'}
            onPress={() => onChangeTime('석식')}
            text="석식"
            {...TabClasses}
          />
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
      onPress={() => onChangeSortModeType(nextMode)}
      baseBoxClass="px-2 py-1"
    />
  );
}
