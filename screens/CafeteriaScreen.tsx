import React, { useState } from 'react';
import { View } from 'react-native';
import CafeteriaList from '@/components/cafeteria/CafeteriaList';
import CafeteriaHeader from '@/components/cafeteria/CafeteriaHeader';
import {
  RestaurantCode,
  MealType,
  CafeteriaParams,
} from '@/api/cafeteria/types';
import { useCafeteria } from '@/api/cafeteria/useCafeteria';

type SortType = 'time' | 'location';

export default function SchoolRestaurantScreen() {
  const [sortModeType, setSortModeType] = useState<SortType>('time');
  const [selectedLocation, setSelectedLocation] = useState<RestaurantCode>('re12');
  const [selectedTime, setSelectedTime] = useState<MealType>('조식');
  const [currentDate, setCurrentDate] = useState(new Date());

  // switch day
  const goPrevDay = () => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 1);
      return next;
    });
  };
  const goNextDay = () => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 1);
      return next;
    });
  };

  const cafeteriaParams: CafeteriaParams = {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
    day: currentDate.getDate(),
    cafeteria_details: true,
  };
  const { data, isLoading, error } = useCafeteria(cafeteriaParams);

  return (
    <View className="flex-1 bg-white">
      <CafeteriaHeader
        sortModeType={sortModeType}
        onChangeSortModeType={setSortModeType}
        selectedLocation={selectedLocation}
        onChangeLocation={setSelectedLocation}
        selectedTime={selectedTime}
        onChangeTime={setSelectedTime}
        currentDate={currentDate}
        onPrevDate={goPrevDay}
        onNextDate={goNextDay}
      />

      <CafeteriaList
        sortModeType={sortModeType}
        selectedLocation={selectedLocation}
        selectedTime={selectedTime}
        currentDate={currentDate}
        meal_data={data}
        isLoading={isLoading}
        meal_error={error ?? null}
      />
    </View>
  );
}
