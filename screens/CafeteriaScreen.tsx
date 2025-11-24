import React, { useState } from 'react';
import { View } from 'react-native';
import CafeteriaList from '@/components/cafeteria/CafeteriaList';
import CafeteriaHeader from '@/components/cafeteria/CafeteriaHeader';

type sortType = 'time' | 'location';
type LocationType = 'student' | 'staff' | 'startup' | 'dorm';
type TimeType = 'breakfast' | 'lunch' | 'dinner';

export default function SchoolRestaurantScreen() {
  const [sortModeType, setSortModeType] = useState<sortType>('time');
  const [selectedLocation, setSelectedLocation] = useState<LocationType>('student');
  const [selectedTime, setSelectedTime] = useState<TimeType>('lunch');
  const [currentDate, setCurrentDate] = useState(new Date());

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

  console.log({
    sortModeType,
    selectedLocation,
    selectedTime,
    currentDate,
  });

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

      {/* 나중에 필요하면 여기에도 props 넘겨서 필터링에 사용 */}
      {/* 
      <CafeteriaList
        sortModeType={sortModeType}
        selectedLocation={selectedLocation}
        selectedTime={selectedTime}
        currentDate={currentDate}
      />
      */}
      <CafeteriaList />
    </View>
  );
}
