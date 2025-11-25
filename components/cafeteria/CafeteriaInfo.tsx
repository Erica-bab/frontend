import { View, Text, Modal, Pressable } from 'react-native';
import React, { useState } from 'react';
import NaverMapWebView from '@/components/NaverMapWebView';
import TextIconBox from '@/components/ui/TextIconBox';
import TextIconButton from '../ui/TextIconButton';

type sortType = 'time' | 'location';

interface CafeteriaInfoProps {
  name?: string;
  price?: string;
  menu?: string[];
  location?: string;
  sortModeType: sortType;
  latitude: number;
  longitude: number;
  viewName?: string;
}

export default function CafeteriaInfo({
  name = '',
  price = '',
  menu = [''],
  location = '',
  sortModeType,
  latitude,
  longitude,
  viewName
}: CafeteriaInfoProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="flex flex-col border border-[#E5E5EC] rounded-xl w-full min-w-[40vh] px-[35px] py-[20px] bg-white">
      {/* 상단: 메뉴 이름 + 가격 */}
      <View className="flex flex-row items-center mt-2">
        <Text className="text-[#3B82F6] font-semibold text-xl mr-[5px]">
          {name}
        </Text>
        <Text className="text-[#6B6B6B] text-base mt-1">{price}원</Text>
      </View>

      <View className="h-[1px] bg-gray-300 w-full my-[12px]" />

      {/* 메뉴 리스트 */}
      {menu.map((item, index) => (
        <Text key={index} className="text-lg mb-[3px]">
          {"• " + item}
        </Text>
      ))}
    
      <View className="mt-2 self-center w-full">
        <TextIconButton
          onPress={() => setVisible(true)}
          isOn

          baseBoxClass="rounded-2xl border-[#2563EB] border-2 bg-[#2563EB] justify-center"
          baseTextClass="text-[#FFFFFF] font-bold text-base"
          text={location}
          iconName="location"
          iconSize={16}
          onIconColor="#FFFFFF"
          offIconColor="#FFFFFF"
        />
      </View> 

      <Modal
  visible={visible}
  transparent
  animationType="fade"
  onRequestClose={() => setVisible(false)}
>
  {/* 반투명 배경 */}
  <Pressable
    className="flex-1 bg-black/40 justify-center items-center"
    onPress={() => setVisible(false)} // 바깥 클릭 시 닫기
  >
    {/* 모달 박스 */}
    <Pressable
      className="w-4/5 bg-white rounded-2xl p-5"
      onPress={() => {}}
    >
      <View className="w-full h-64 mb-4 rounded-xl overflow-hidden border border-[#E5E5EC]">
        <NaverMapWebView
          latitude={latitude}
          longitude={longitude}
          name={viewName}
        />
      </View>

      <View className="flex-row justify-between items-center">
        <TextIconBox
          preset='blue'
          boxClass="bg-white"
          text={location}
        />
        <Pressable
          className="px-3 py-2 rounded-full bg-[#2563EB]"
          onPress={() => setVisible(false)}
        >
          <Text className="text-white font-semibold">닫기</Text>
        </Pressable>
      </View>
    </Pressable>
  </Pressable>
</Modal>

    </View>
  );
}