import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextIconButton from '@/components/ui/TextIconButton';
import Icon from '@/components/Icon';

type sortType = 'time' | 'location';
type LocationType = 'student' | 'staff' | 'startup' | 'dorm';
type TimeType = 'breakfast' | 'lunch' | 'dinner';

interface CafeteriaHeaderProps {
  sortModeType: sortType;
  onChangeSortModeType: (type: sortType) => void;

  selectedLocation: LocationType;
  onChangeLocation: (type: LocationType) => void;

  selectedTime: TimeType;
  onChangeTime: (type: TimeType) => void;

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
  return (
    <SafeAreaView className="w-full flex bg-white px-10">
      <View className="flex-row justify-end -mr-4 mt-1">
        <ChangeSortButton
          sortModeType={sortModeType}
          onChangeSortModeType={onChangeSortModeType}
        />
      </View>

      <View>
        <View className="flex-row items-center justify-center mb-4 gap-2">
          <TouchableOpacity onPress={onPrevDate}>
            <Icon
              name="rightAngle"
              size={30}
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </TouchableOpacity>
          <Text className="font-bold text-4xl mt-1">
            {formatDate(currentDate)}
          </Text>
          <Text className="font-medium text-xl mt-3 text-[#6B7280]">
            {formatDay(currentDate)}
          </Text>
          <TouchableOpacity onPress={onNextDate}>
            <Icon name="rightAngle" size={30} />
          </TouchableOpacity>
        </View>
      </View>

      {/* tab */}
      {sortModeType === 'time' ? (
        // 위치
        <View className="w-full flex-row justify-around">
          <TextIconButton
            isOn={selectedLocation === 'student'}
            onPress={() => onChangeLocation('student')}
            text="학생"
            baseBoxClass="-pb-4"
            offTextClass="text-[#000000] font-medium text-xl"
            onTextClass="text-[#2563EB] font-medium text-xl"
            onBoxClass="border-b-2 border-[#2563EB] -pb-2"
          />
          <TextIconButton
            isOn={selectedLocation === 'staff'}
            onPress={() => onChangeLocation('staff')}
            text="교직원"
            baseBoxClass="-pb-4"
            offTextClass="text-[#000000] font-medium text-xl"
            onTextClass="text-[#2563EB] font-medium text-xl"
            onBoxClass="border-b-2 border-[#2563EB] -pb-2"
          />
          <TextIconButton
            isOn={selectedLocation === 'startup'}
            onPress={() => onChangeLocation('startup')}
            text="창업보육"
            baseBoxClass="-pb-4"
            offTextClass="text-[#000000] font-medium text-xl"
            onTextClass="text-[#2563EB] font-medium text-xl"
            onBoxClass="border-b-2 border-[#2563EB] -pb-2"
          />
          <TextIconButton
            isOn={selectedLocation === 'dorm'}
            onPress={() => onChangeLocation('dorm')}
            text="창의관"
            baseBoxClass="-pb-4"
            offTextClass="text-[#000000] font-medium text-xl"
            onTextClass="text-[#2563EB] font-medium text-xl"
            onBoxClass="border-b-2 border-[#2563EB] -pb-2"
          />
        </View>
      ) : (
        // (조/중/석)
        <View className="w-full flex-row justify-around">
          <TextIconButton
            isOn={selectedTime === 'breakfast'}
            onPress={() => onChangeTime('breakfast')}
            text="조식"
            baseBoxClass="-pb-4"
            offTextClass="text-[#000000] font-medium text-xl"
            onTextClass="text-[#2563EB] font-medium text-xl"
            onBoxClass="border-b-2 border-[#2563EB] -pb-2"
          />
          <TextIconButton
            isOn={selectedTime === 'lunch'}
            onPress={() => onChangeTime('lunch')}
            text="중식"
            baseBoxClass="-pb-4"
            offTextClass="text-[#000000] font-medium text-xl"
            onTextClass="text-[#2563EB] font-medium text-xl"
            onBoxClass="border-b-2 border-[#2563EB] -pb-2"
          />
          <TextIconButton
            isOn={selectedTime === 'dinner'}
            onPress={() => onChangeTime('dinner')}
            text="석식"
            baseBoxClass="-pb-4"
            offTextClass="text-[#000000] font-medium text-xl"
            onTextClass="text-[#2563EB] font-medium text-xl"
            onBoxClass="border-b-2 border-[#2563EB] -pb-2"
          />
        </View>
      )}
    </SafeAreaView>
  );
}


function ChangeSortButton({ sortModeType, onChangeSortModeType }: { sortModeType: sortType; onChangeSortModeType: (type: sortType) => void; }) {
  const isTimeMode = sortModeType === 'time';
  const iconName = isTimeMode ? 'clock' : 'school';
  const nextMode: sortType = isTimeMode ? 'location' : 'time';

  return (
    <TouchableOpacity
      onPress={() => 
        onChangeSortModeType(nextMode)
      }
    >
      <Icon name={iconName} size={20}/>
    </TouchableOpacity>
  );
}