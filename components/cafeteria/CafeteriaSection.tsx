import { View } from 'react-native';
import TextIconBox from '@/components/ui/TextIconBox';
import CafeteriaInfo from '@/components/cafeteria/CafeteriaInfo';

interface CafeteriaSectionProps {
  sortModeType?: 'time' | 'location';
  selectedLocation?: 'student' | 'staff' | 'startup' | 'dorm';
  selectedTime?: 'breakfast' | 'lunch' | 'dinner';
  currentDate?: Date;
}

export default function CafeteriaSection() {
  console.log();

  return (
    <View className="">
      <TextIconBox icon="clock"/>
      <TextIconBox icon="clock"/>
      <CafeteriaInfo />
    </View>
  );
}