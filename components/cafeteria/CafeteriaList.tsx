import { View } from 'react-native';
import CafeteriaInfo from '@/components/cafeteria/CafeteriaInfo';

export default function CafeteriaList() {
  return (
    <View className="flex flex-col gap-4 px-10 py-4 bg-[#F8FAFC]">
      <CafeteriaInfo />
      <CafeteriaInfo
        name="맛있는 점심"
        price="2500"
        menu={['비빔밥', '된장찌개', '계란말이', '오이무침', '과일샐러드']}
        location="학생회관"
      />
    </View>
  );
}