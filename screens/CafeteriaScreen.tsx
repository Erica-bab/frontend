import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
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
  const isFocused = useIsFocused();
  const { refreshAuthState } = useAuth();
  const insets = useSafeAreaInsets();
  const [sortModeType, setSortModeType] = useState<SortType>('time');
  const [selectedLocation, setSelectedLocation] = useState<RestaurantCode>('re12');
  const [selectedTime, setSelectedTime] = useState<MealType>('조식');
  const [currentDate, setCurrentDate] = useState(new Date());

  // 저장된 필터 설정 불러오기
  useEffect(() => {
    const loadSavedFilterSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('cafeteriaFilterSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          
          // 정렬 모드 불러오기
          if (settings.sortModeType && (settings.sortModeType === 'time' || settings.sortModeType === 'location')) {
            setSortModeType(settings.sortModeType as SortType);
          }
          
          // 식당 선택 불러오기 (항상 불러오되, 정렬 모드가 'time'일 때만 사용)
          if (settings.selectedLocation) {
            setSelectedLocation(settings.selectedLocation as RestaurantCode);
          }
          
          // 시간대 선택 불러오기 (항상 불러오되, 정렬 모드가 'location'일 때만 사용)
          if (settings.selectedTime) {
            setSelectedTime(settings.selectedTime as MealType);
          }
        } else {
          // 저장된 설정이 없으면 기존 방식으로 정렬 옵션만 불러오기 (하위 호환성)
        const savedSort = await AsyncStorage.getItem('cafeteriaSortOption');
        if (savedSort && (savedSort === 'time' || savedSort === 'location')) {
          setSortModeType(savedSort as SortType);
          }
        }
      } catch (error) {
        console.error('Failed to load cafeteria filter settings:', error);
      }
    };
    loadSavedFilterSettings();
  }, []);

  // 필터 설정 저장
  const saveFilterSettings = useCallback(async (settings: {
    sortModeType: SortType;
    selectedLocation?: RestaurantCode;
    selectedTime?: MealType;
  }) => {
    try {
      await AsyncStorage.setItem('cafeteriaFilterSettings', JSON.stringify(settings));
      // 하위 호환성을 위해 정렬 옵션도 별도로 저장
      await AsyncStorage.setItem('cafeteriaSortOption', settings.sortModeType);
    } catch (error) {
      console.error('Failed to save cafeteria filter settings:', error);
    }
  }, []);

  // 정렬 옵션 변경 시 저장
  const handleSortModeChange = async (sortMode: SortType) => {
    setSortModeType(sortMode);
    // 정렬 모드 변경 시에도 현재 선택된 모든 필터 설정 저장
    await saveFilterSettings({
      sortModeType: sortMode,
      selectedLocation: selectedLocation,
      selectedTime: selectedTime,
    });
  };

  // 식당 선택 변경 시 저장
  const handleLocationChange = useCallback(async (location: RestaurantCode) => {
    setSelectedLocation(location);
    // 식당 선택 변경 시에도 모든 필터 설정 저장
    await saveFilterSettings({
      sortModeType: sortModeType,
      selectedLocation: location,
      selectedTime: selectedTime,
    });
  }, [sortModeType, selectedTime, saveFilterSettings]);

  // 시간대 선택 변경 시 저장
  const handleTimeChange = useCallback(async (time: MealType) => {
    setSelectedTime(time);
    // 시간대 선택 변경 시에도 모든 필터 설정 저장
    await saveFilterSettings({
      sortModeType: sortModeType,
      selectedLocation: selectedLocation,
      selectedTime: time,
    });
  }, [sortModeType, selectedLocation, saveFilterSettings]);

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
  const { data, isLoading, isFetching, error, refetch } = useCafeteria(cafeteriaParams);

  // 탭 재클릭 시 초기화 함수
  const resetToInitial = useCallback(async () => {
    // 필터 초기화
    setSortModeType('time');
    setSelectedLocation('re12');
    setSelectedTime('조식');
    setCurrentDate(new Date());
    // 필터 스토리지 초기화
    await AsyncStorage.removeItem('cafeteriaFilterSettings');
    await AsyncStorage.removeItem('cafeteriaSortOption');
    // 데이터 새로고침
    refetch();
  }, [refetch]);

  // 탭 재클릭 감지 (커스텀 이벤트)
  useEffect(() => {
    const unsubscribe = (navigation as any).addListener('resetToInitial', () => {
      if (isFocused) {
        resetToInitial();
      }
    });

    return unsubscribe;
  }, [navigation, isFocused, resetToInitial]);

  // 오늘 날짜로 이동
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // 데이터만 새로고침 (Pull-to-refresh용)
  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <CafeteriaHeader
        sortModeType={sortModeType}
        onChangeSortModeType={handleSortModeChange}
        selectedLocation={selectedLocation}
        onChangeLocation={handleLocationChange}
        selectedTime={selectedTime}
        onChangeTime={handleTimeChange}
        currentDate={currentDate}
        onPrevDate={goPrevDay}
        onNextDate={goNextDay}
        onGoToToday={goToToday}
        meal_data={data}
      />

      <CafeteriaList
        sortModeType={sortModeType}
        selectedLocation={selectedLocation}
        selectedTime={selectedTime}
        currentDate={currentDate}
        meal_data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        meal_error={error ?? null}
        onShowLogin={() => (navigation.navigate as any)('Login', { onSuccess: refreshAuthState })}
        onRefresh={handleRefresh}
      />
    </View>
  );
}
