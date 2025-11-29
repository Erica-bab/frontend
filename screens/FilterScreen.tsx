import { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Dropdown } from '@/components/filter/Dropdown';
import { OptionBtn } from '@/components/filter/OptionButton';
import Button from '@/components/ui/Button';
import Icon from '@/components/Icon';
import { filterToParams } from '@/api/restaurants/useRestaurant';
import { RestaurantListParams } from '@/api/restaurants/types';

const DAYS = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
const FOOD_TYPES = ['전체','한식','중식','일식','양식','아시안','분식','패스트푸드','고기']
const HOUR = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MIN = ['00','30'];
const AFFILIATE =['공학대학','소프트웨어융합대학','약학대학','첨단융합대학','글로벌문화통상대학','커뮤니케이션&컬쳐대학','경상대학','디자인대학','예체능대학','LIONS칼리지'];
const RESTAURANT_TYPE = ['개인식당','프랜차이즈']

export default function FilterScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { onApply } = route.params as { onApply?: (params: RestaurantListParams) => void } || {};

  const snapPoints = useMemo(() => ['85%', '95%'], []);
  const [operatingTimeMode, setOperatingTimeMode] = useState<'none' | 'operating' | 'manual'>('none');
  const [selectedDay, setSelectedDay] = useState<string>();
  const [selectedHour, setSelectedHour] = useState<string>();
  const [selectedMin, setSelectedMin] = useState<string>();
  const [activeDropdown, setActiveDropdown] = useState<'day' | 'hour' | 'min' | null>(null);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<string[]>([]);
  const [selectedAffiliates, setSelectedAffiliates] = useState<string[]>([]);
  const [selectedRestaurantTypes, setSelectedRestaurantTypes] = useState<string[]>([]);

  // 현재 시간을 가져와서 요일, 시간, 분으로 변환하는 함수
  const getCurrentTime = useCallback(() => {
    const now = new Date();
    const dayIndex = now.getDay(); // 0(일요일) ~ 6(토요일)
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes();
    // 30분 단위로 반올림 (0-29분 -> 00, 30-59분 -> 30)
    const roundedMinute = minute < 30 ? '00' : '30';
    
    // dayIndex를 DAYS 배열 인덱스로 변환 (일요일=0 -> 일요일=6, 월요일=1 -> 월요일=0)
    const dayName = DAYS[dayIndex === 0 ? 6 : dayIndex - 1];
    
    return {
      day: dayName,
      hour,
      minute: roundedMinute,
    };
  }, []);

  // 저장된 필터 불러오기
  useEffect(() => {
    const loadSavedFilter = async () => {
      try {
        const savedFilter = await AsyncStorage.getItem('restaurantFilter');
        if (savedFilter) {
          const filter = JSON.parse(savedFilter);
          setOperatingTimeMode(filter.operatingTimeMode || 'none');
          setSelectedDay(filter.selectedDay);
          setSelectedHour(filter.selectedHour);
          setSelectedMin(filter.selectedMin);
          setSelectedFoodTypes(filter.selectedFoodTypes || []);
          setSelectedAffiliates(filter.selectedAffiliates || []);
          setSelectedRestaurantTypes(filter.selectedRestaurantTypes || []);
        }
      } catch (error) {
        console.error('Failed to load filter:', error);
      }
    };
    loadSavedFilter();
  }, []);

  // 시간 선택 시 분 드롭다운 활성화
  useEffect(() => {
    if (selectedHour && operatingTimeMode === 'manual') {
      // 시간이 선택되면 분도 초기화하지 않고 유지
    } else if (!selectedHour && operatingTimeMode === 'manual') {
      // 시간이 없으면 분도 초기화
      setSelectedMin(undefined);
    }
  }, [selectedHour, operatingTimeMode]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleReset = () => {
    setOperatingTimeMode('none');
    setSelectedDay(undefined);
    setSelectedHour(undefined);
    setSelectedMin(undefined);
    setSelectedFoodTypes([]);
    setSelectedAffiliates([]);
    setSelectedRestaurantTypes([]);
  };

  // 운영중 버튼 클릭 시 현재 시간으로 설정
  const handleOperatingNow = () => {
    const currentTime = getCurrentTime();
    setOperatingTimeMode('operating');
    setSelectedDay(currentTime.day);
    setSelectedHour(currentTime.hour);
    setSelectedMin(currentTime.minute);
  };

  // 운영시간 수동선택 버튼 클릭 시
  const handleManualSelect = () => {
    setOperatingTimeMode('manual');
    setSelectedDay(undefined);
    setSelectedHour(undefined);
    setSelectedMin(undefined);
  };

  const handleApply = async () => {
    // 운영중 모드인 경우 현재 시간으로 업데이트
    let finalDay = selectedDay;
    let finalHour = selectedHour;
    let finalMin = selectedMin;
    
    if (operatingTimeMode === 'operating') {
      const currentTime = getCurrentTime();
      finalDay = currentTime.day;
      finalHour = currentTime.hour;
      finalMin = currentTime.minute;
    }

    // 필터 저장
    try {
      const filterData = {
        operatingTimeMode,
        selectedDay: finalDay,
        selectedHour: finalHour,
        selectedMin: finalMin,
        selectedFoodTypes,
        selectedAffiliates,
        selectedRestaurantTypes,
      };
      await AsyncStorage.setItem('restaurantFilter', JSON.stringify(filterData));
    } catch (error) {
      console.error('Failed to save filter:', error);
    }

    const params = filterToParams({
      dayOfWeek: finalDay,
      hour: finalHour,
      minute: finalMin,
      categories: selectedFoodTypes,
      affiliations: selectedAffiliates,
      subCategory: selectedRestaurantTypes[0],
    });
    onApply?.(params);
    goBack();
  };

  return (
    <BottomSheet
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onClose={goBack}
      backgroundStyle={styles.container}
      handleIndicatorStyle={styles.handleIndicator}
      enableDynamicSizing={false}
      index={0}
    >
      <View style={styles.modalContent}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>필터</Text>
          <Pressable onPress={() => goBack()}>
            <Icon name="cancel" />
          </Pressable>
        </View>

        {/* 스크롤 가능한 컨텐츠 */}
        <BottomSheetScrollView
          contentContainerStyle={[styles.scrollViewContent]}
          showsVerticalScrollIndicator={false}
        >
            <Text className="pt-4 text-xl font-bold mb-4">운영시간</Text>
            
            {/* 운영시간 모드 선택 버튼 */}
            <View className='flex-row gap-2 mb-4'>
              <OptionBtn
                text="운영중"
                isSelected={operatingTimeMode === 'operating'}
                onPress={handleOperatingNow}
              />
              <OptionBtn
                text="운영시간 수동선택"
                isSelected={operatingTimeMode === 'manual'}
                onPress={handleManualSelect}
              />
            </View>

            {/* 운영중 모드일 때 선택된 시간 표시 */}
            {operatingTimeMode === 'operating' && selectedDay && selectedHour && selectedMin && (
              <View className='mb-4 p-3 bg-blue-50 rounded-lg'>
                <Text className='text-sm text-blue-700'>
                  현재 운영중인 식당만 표시됩니다 ({selectedDay} {selectedHour}시 {selectedMin}분 기준)
                </Text>
              </View>
            )}

            {/* 수동선택 모드일 때만 요일/시간/분 선택 UI 표시 */}
            {operatingTimeMode === 'manual' && (
              <View className='flex-row gap-2 flex-wrap mb-4'>
                <Dropdown
                  label="요일"
                  options={DAYS}
                  selectedValue={selectedDay}
                  onSelect={setSelectedDay}
                  placeholder="요일"
                  isOpen={activeDropdown === 'day'}
                  onToggle={() => setActiveDropdown(activeDropdown === 'day' ? null : 'day')}
                />
                <Dropdown
                  label="시간"
                  options={HOUR}
                  selectedValue={selectedHour ? selectedHour + "시" : selectedHour}
                  onSelect={setSelectedHour}
                  placeholder="시간"
                  isOpen={activeDropdown === 'hour'}
                  onToggle={() => setActiveDropdown(activeDropdown === 'hour' ? null : 'hour')}
                />
                {/* 시간이 선택되었을 때만 분 드롭다운 표시 */}
                {selectedHour && (
                  <Dropdown
                    label="분"
                    options={MIN}
                    selectedValue={selectedMin ? selectedMin + "분" : selectedMin}
                    onSelect={setSelectedMin}
                    placeholder="분"
                    isOpen={activeDropdown === 'min'}
                    onToggle={() => setActiveDropdown(activeDropdown === 'min' ? null : 'min')}
                  />
                )}
              </View>
            )}

            <View className="h-px w-full bg-gray-100 my-4" />
            <Text className="text-xl font-bold mb-4">음식 종류</Text>
            <View className='flex-row gap-2 flex-wrap'>
              {FOOD_TYPES.map((name,idx)=>(
                <OptionBtn
                  key={idx}
                  text={name}
                  isSelected={selectedFoodTypes.includes(name)}
                  onPress={() => {
                    if (name === '전체') {
                      // 전체를 누르면 모든 항목 선택/해제
                      if (selectedFoodTypes.length === FOOD_TYPES.length) {
                        setSelectedFoodTypes([]);
                      } else {
                        setSelectedFoodTypes(FOOD_TYPES);
                      }
                    } else {
                      setSelectedFoodTypes(prev => {
                        const newSelection = prev.includes(name)
                          ? prev.filter(item => item !== name)
                          : [...prev, name];
                        // '전체'를 제거
                        return newSelection.filter(item => item !== '전체');
                      });
                    }
                  }}
                />
              ))}
            </View>
            <View className="h-px w-full bg-gray-100 my-4" />
            <Text className="text-xl font-bold mb-4">제휴</Text>
            <View className='flex-row gap-2 flex-wrap'>
              {AFFILIATE.map((name,idx)=>(
                <OptionBtn
                  key={idx}
                  text={name}
                  isSelected={selectedAffiliates.includes(name)}
                  onPress={() => {
                    setSelectedAffiliates(prev =>
                      prev.includes(name)
                        ? prev.filter(item => item !== name)
                        : [...prev, name]
                    );
                  }}
                />
              ))}
            </View>
            <View className="h-px w-full bg-gray-100 my-4" />
            <Text className="text-xl font-bold mb-4">식당종류</Text>
            <View className='flex-row gap-2 flex-wrap'>
              {RESTAURANT_TYPE.map((name,idx)=>(
                <OptionBtn
                  key={idx}
                  text={name}
                  isSelected={selectedRestaurantTypes.includes(name)}
                  onPress={() => {
                    setSelectedRestaurantTypes(prev =>
                      prev.includes(name)
                        ? prev.filter(item => item !== name)
                        : [...prev, name]
                    );
                  }}
                />
              ))}
            </View>

            {/* 하단 버튼 - 스크롤뷰 안에 포함 */}
            <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 16 }]}>
              <Button variant="secondary" onPress={handleReset} className="flex-1">
                초기화
              </Button>
              <Button onPress={handleApply} className="flex-1">
                적용
              </Button>
            </View>
        </BottomSheetScrollView>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  handleIndicator: {
    backgroundColor: '#d1d5db',
    width: 40,
    height: 4,
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 20,
    marginTop: 8,
  },
});
