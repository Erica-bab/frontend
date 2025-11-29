import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CafeteriaList from '@/components/cafeteria/CafeteriaList';
import CafeteriaHeader from '@/components/cafeteria/CafeteriaHeader';
import { useAuth } from '@/api/auth/useAuth';
import {
  RestaurantCode,
  MealType,
  CafeteriaParams,
} from '@/api/cafeteria/types';
import { useCafeteria } from '@/api/cafeteria/useCafeteria';

type SortType = 'time' | 'location';

export default function SchoolRestaurantScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { refreshAuthState } = useAuth();
  const [sortModeType, setSortModeType] = useState<SortType>('time');
  const [selectedLocation, setSelectedLocation] = useState<RestaurantCode>('re12');
  const [selectedTime, setSelectedTime] = useState<MealType>('조식');
  const [currentDate, setCurrentDate] = useState(new Date());

  // 저장된 정렬 옵션 불러오기
  useEffect(() => {
    const loadSavedSortOption = async () => {
      try {
        const savedSort = await AsyncStorage.getItem('cafeteriaSortOption');
        if (savedSort && (savedSort === 'time' || savedSort === 'location')) {
          setSortModeType(savedSort as SortType);
        }
      } catch (error) {
        console.error('Failed to load cafeteria sort option:', error);
      }
    };
    loadSavedSortOption();
  }, []);

  // 정렬 옵션 변경 시 저장
  const handleSortModeChange = async (sortMode: SortType) => {
    setSortModeType(sortMode);
    try {
      await AsyncStorage.setItem('cafeteriaSortOption', sortMode);
    } catch (error) {
      console.error('Failed to save cafeteria sort option:', error);
    }
  };

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

  // 오늘 날짜로 되돌리기 (Pull-to-refresh용)
  const handleRefresh = useCallback(async () => {
    setCurrentDate(new Date());
    // 날짜 변경 후 데이터도 새로고침
    await refetch();
  }, [refetch]);

  const cafeteriaParams: CafeteriaParams = {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
    day: currentDate.getDate(),
    cafeteria_details: true,
  };
  const { data, isLoading, error, refetch } = useCafeteria(cafeteriaParams);

  return (
    <View className="flex-1 bg-white">
      <CafeteriaHeader
        sortModeType={sortModeType}
        onChangeSortModeType={handleSortModeChange}
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
        onShowLogin={() => (navigation.navigate as any)('Login', { onSuccess: refreshAuthState })}
        onRefresh={handleRefresh}
      />
    </View>
  );
}
