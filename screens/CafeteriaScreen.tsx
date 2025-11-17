import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import TextIconButton from '../components/ui/TextIconButton';
import ClockIcon from '../assets/icon/clock.svg';
import CafeteriaList from '../components/cafeteria/CafeteriaList';
import RightanlgeICon from '../assets/icon/right_angle.svg';

type CafeteriaType = 'student' | 'staff' | 'startup' | 'dorm';

export default function SchoolRestaurantScreen() {
  const [selectedType, setSelectedType] = useState<CafeteriaType>('student');

  return (
    <View className="flex-1 bg-black">
      <CafeteriaHeader selectedType={selectedType} onChangeType={setSelectedType} />
      <CafeteriaList />
    </View>
  );
}


function CafeteriaHeader({ selectedType, onChangeType, }: { selectedType: CafeteriaType; onChangeType: (type: CafeteriaType) => void; }) {
  return (
    <View className="w-full flex bg-white px-10">
      <View className="flex-row justify-end -mr-4 mt-1">
        <TouchableOpacity onPress={() => console.log("왼쪽 클릭")}>
          <ClockIcon width={24} height={24} color={"#6B6B6B"}/>
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center justify-center mb-4 gap-2">
        <RightanlgeICon width={40} height={40} style={{ transform: [{ rotate: '180deg' }] }}/>
        <Text className="font-bold text-4xl mt-1">2024. 05. 01</Text>
        <RightanlgeICon width={40} height={40} />
      </View>
      <View className="w-full flex-row justify-around pb-2">
        <TextIconButton
          isOn={selectedType === 'student'}
          onPress={() => onChangeType('student')}
          text="학생"

          baseBoxClass="-pb-4"

          offTextClass="text-[#000000] font-medium text-xl"
          onTextClass="text-[#2563EB] font-medium text-xl"
          onBoxClass="border-b-2 border-[#2563EB] -pb-2"
        />
        <TextIconButton
          isOn={selectedType === 'staff'}
          onPress={() => onChangeType('staff')}
          text="교직원"
          
          baseBoxClass="-pb-4"

          offTextClass="text-[#000000] font-medium text-xl"
          onTextClass="text-[#2563EB] font-medium text-xl"
          onBoxClass="border-b-2 border-[#2563EB] -pb-2"
        />
        <TextIconButton
          isOn={selectedType === 'startup'}
          onPress={() => onChangeType('startup')}
          text="창업보육"
          
          baseBoxClass="-pb-4"

          offTextClass="text-[#000000] font-medium text-xl"
          onTextClass="text-[#2563EB] font-medium text-xl"
          onBoxClass="border-b-2 border-[#2563EB] -pb-2"
        />
        <TextIconButton
          isOn={selectedType === 'dorm'}
          onPress={() => onChangeType('dorm')}
          text="창의인재"
          
          baseBoxClass="-pb-4"

          offTextClass="text-[#000000] font-medium text-xl"
          onTextClass="text-[#2563EB] font-medium text-xl"
          onBoxClass="border-b-2 border-[#2563EB] -pb-2"
        />
      </View>
    </View>
  );
}
