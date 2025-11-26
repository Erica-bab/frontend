import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import TextIconButton from '../ui/TextIconButton';
import CafeteriaLikeButton from '@/components/cafeteria/CafeteriaLikeButton';
import MapModal from '@/components/cafeteria/MapModal';

interface CafeteriaInfoProps {
  name?: string;
  price?: string;
  menu?: string[];
  location?: string;
  like: number;

  latitude: number;
  longitude: number;
  viewName?: string;

  meal_id: number;

  auth: boolean
}

export default function CafeteriaInfo({
  name = '',
  price = '',
  menu = [''],
  location = '',
  like,
  latitude,
  longitude,
  viewName,
  meal_id,
  auth,
}: CafeteriaInfoProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="flex flex-col border border-[#E5E5EC] rounded-xl w-full min-w-[40vh] px-[35px] py-[20px] bg-white">
      <View className="flex flex-row justify-between">
        <View className="flex flex-row items-center mt-2">
          <Text className="text-[#3B82F6] font-semibold text-xl mr-[5px]">
            {name}
          </Text>
          <Text className="text-[#6B6B6B] text-base mt-1">{price}원</Text>
        </View>

        <CafeteriaLikeButton
          like={like}
          meal_id={meal_id}
          auth={auth}
        />
      </View>

      <View className="h-[1px] bg-gray-300 w-full my-[12px]" />

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

      <MapModal 
        location={location}
        latitude={latitude} 
        longtitude={longitude} 
        viewName={viewName} 
        visible={visible} 
        setVisible={setVisible}
      />
    </View>
  );
}