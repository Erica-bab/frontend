import { View, Text } from 'react-native';
import locationIcon from '../../assets/icon/location.svg';
import TextIconBox from '../ui/TextIconBox';

interface cafeteriaProps {
  name?: string,
  price?: string,
  menu?: string[],
  location?: string,
}

export default function CafeteriaInfo({ name = "천원의 아침밥", price = "1000", menu = ["스팸마요 덮밥", "꼬치 어묵국", "고로케&케찹", "치커리유자청무침", "배추김치야채샐러드&드레싱"], location = "창의인재" }: cafeteriaProps) {
  return (
    <View className="flex flex-col border border-[#E5E5EC] rounded-xl w-full min-w-[40vh] px-[35px] py-[20px] bg-white">
      <View className="flex flex-row items-center mt-2">
        <Text className="text-[#3B82F6] font-semibold text-xl mr-[5px]">{name}</Text>
        <Text className="text-[#6B6B6B] text-base mt-1">{price}원</Text>
      </View>

      <View className="h-[1px] bg-gray-300 w-full my-[12px]"/>

      {menu.map((item, index) => (
        <Text key={index} className="text-lg mb-[3px]">{item}</Text>
      ))}

      <TextIconBox
        preset="white"
        boxClass="justify-center bg-[#2563EB] rounded-2xl border-[#2563EB] border-2 mt-2"
        textClass="text-[#2563EB] font-bold text-base text-[#FFFFFF]"
        text={location}
        icon={locationIcon}
        />
    </View>
  );
}