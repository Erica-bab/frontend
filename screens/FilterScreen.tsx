import { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, Alert } from 'react-native';
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
const FOOD_TYPES = ['전체','한식','중식','일식','양식','아시안','분식','패스트푸드']
const HOUR = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MIN = ['00','30'];
const AFFILIATE =['공학대학','소프트웨어융합대학','약학대학','첨단융합대학','글로벌문화통상대학','커뮤니케이션&컬쳐대학','경상대학','디자인대학','예체능대학','LIONS칼리지'];
const RESTAURANT_TYPE = ['개인식당','프랜차이즈']

export default function FilterScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { onApply, currentFilter } = route.params as { 
    onApply?: (params: RestaurantListParams) => void;
    currentFilter?: {
      filterParams?: any;
      operatingTimeFilter?: { dayOfWeek?: string; hour?: string; minute?: string } | null;
    };
  } || {};

  const snapPoints = useMemo(() => ['85%', '95%'], []);
  const [isClosing, setIsClosing] = useState(false);
  const [operatingTimeMode, setOperatingTimeMode] = useState<'none' | 'operating' | 'manual'>('none');
  const [selectedDay, setSelectedDay] = useState<string>();
  const [selectedHour, setSelectedHour] = useState<string>();
  const [selectedMin, setSelectedMin] = useState<string>();
  const [activeDropdown, setActiveDropdown] = useState<'day' | 'hour' | 'min' | null>(null);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<string[]>([]);
  const [selectedAffiliates, setSelectedAffiliates] = useState<string[]>([]);
  const [selectedRestaurantTypes, setSelectedRestaurantTypes] = useState<string[]>([]);
  
  // 초기 필터 상태 저장 (비교용)
  const [initialFilterState, setInitialFilterState] = useState<{
    operatingTimeMode: 'none' | 'operating' | 'manual';
    selectedDay?: string;
    selectedHour?: string;
    selectedMin?: string;
    selectedFoodTypes: string[];
    selectedAffiliates: string[];
    selectedRestaurantTypes: string[];
  } | null>(null);

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
          
          // 현재 적용된 필터 상태 확인
          const hasCurrentFilter = currentFilter && (
            (currentFilter.filterParams && Object.keys(currentFilter.filterParams).length > 0) ||
            currentFilter.operatingTimeFilter !== null
          );
          
          // 실제로 필터가 적용되지 않았는데 스토리지에 필터가 있으면 스토리지 초기화
          if (!hasCurrentFilter) {
            // 스토리지 초기화
            await AsyncStorage.removeItem('restaurantFilter');
            // UI도 초기화
            setOperatingTimeMode('none');
            setSelectedDay(undefined);
            setSelectedHour(undefined);
            setSelectedMin(undefined);
            setSelectedFoodTypes([]);
            setSelectedAffiliates([]);
            setSelectedRestaurantTypes([]);
            return;
          }
          
          const savedMode = filter.operatingTimeMode || 'none';
          
          // operatingTimeMode가 'operating'인데 시간 정보가 없으면 'none'으로 초기화
          if (savedMode === 'operating' && (!filter.selectedDay || !filter.selectedHour || !filter.selectedMin)) {
            setOperatingTimeMode('none');
            setSelectedDay(undefined);
            setSelectedHour(undefined);
            setSelectedMin(undefined);
          } else {
            setOperatingTimeMode(savedMode);
            setSelectedDay(filter.selectedDay || undefined);
            setSelectedHour(filter.selectedHour || undefined);
            setSelectedMin(filter.selectedMin || undefined);
          }
          
          setSelectedFoodTypes(filter.selectedFoodTypes || []);
          setSelectedAffiliates(filter.selectedAffiliates || []);
          setSelectedRestaurantTypes(filter.selectedRestaurantTypes || []);
          
          // 초기 필터 상태 저장
          setInitialFilterState({
            operatingTimeMode: savedMode === 'operating' && (!filter.selectedDay || !filter.selectedHour || !filter.selectedMin) ? 'none' : savedMode,
            selectedDay: filter.selectedDay || undefined,
            selectedHour: filter.selectedHour || undefined,
            selectedMin: filter.selectedMin || undefined,
            selectedFoodTypes: filter.selectedFoodTypes || [],
            selectedAffiliates: filter.selectedAffiliates || [],
            selectedRestaurantTypes: filter.selectedRestaurantTypes || [],
          });
        } else {
          // 필터가 없을 때 초기 상태 저장
          setInitialFilterState({
            operatingTimeMode: 'none',
            selectedDay: undefined,
            selectedHour: undefined,
            selectedMin: undefined,
            selectedFoodTypes: [],
            selectedAffiliates: [],
            selectedRestaurantTypes: [],
          });
        }
      } catch (error) {
        console.error('Failed to load filter:', error);
        // 에러 발생 시에도 초기 상태 저장
        setInitialFilterState({
          operatingTimeMode: 'none',
          selectedDay: undefined,
          selectedHour: undefined,
          selectedMin: undefined,
          selectedFoodTypes: [],
          selectedAffiliates: [],
          selectedRestaurantTypes: [],
        });
      }
    };
    loadSavedFilter();
  }, [currentFilter]);

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
    setIsClosing(true);
    // 약간의 지연 후 실제로 닫기 (버튼이 먼저 사라지도록)
    setTimeout(() => {
      navigation.goBack();
    }, 50);
  }, [navigation]);

  const handleReset = () => {
    // 필터 초기화
    setOperatingTimeMode('none');
    setSelectedDay(undefined);
    setSelectedHour(undefined);
    setSelectedMin(undefined);
    setSelectedFoodTypes([]);
    setSelectedAffiliates([]);
    setSelectedRestaurantTypes([]);
    
    // 초기 상태 업데이트
    setInitialFilterState({
      operatingTimeMode: 'none',
      selectedDay: undefined,
      selectedHour: undefined,
      selectedMin: undefined,
      selectedFoodTypes: [],
      selectedAffiliates: [],
      selectedRestaurantTypes: [],
    });
    
    // 저장된 필터도 삭제 (비동기, await 없이)
    AsyncStorage.removeItem('restaurantFilter').catch(error => {
      console.error('Failed to remove filter:', error);
    });
    
    // 바로 적용하고 모달 닫기
    onApply?.({});
    goBack();
  };

  // 운영중 버튼 클릭 시 현재 시간으로 설정 (토글)
  const handleOperatingNow = () => {
    if (operatingTimeMode === 'operating') {
      // 이미 선택되어 있으면 취소
      setOperatingTimeMode('none');
      setSelectedDay(undefined);
      setSelectedHour(undefined);
      setSelectedMin(undefined);
    } else {
      // 선택되지 않았으면 현재 시간으로 설정
      const currentTime = getCurrentTime();
      setOperatingTimeMode('operating');
      setSelectedDay(currentTime.day);
      setSelectedHour(currentTime.hour);
      setSelectedMin(currentTime.minute);
    }
  };

  // 운영시간 수동선택 버튼 클릭 시 (토글)
  const handleManualSelect = () => {
    if (operatingTimeMode === 'manual') {
      // 이미 선택되어 있으면 취소
      setOperatingTimeMode('none');
      setSelectedDay(undefined);
      setSelectedHour(undefined);
      setSelectedMin(undefined);
    } else {
      // 선택되지 않았으면 수동선택 모드로
      setOperatingTimeMode('manual');
      setSelectedDay(undefined);
      setSelectedHour(undefined);
      setSelectedMin(undefined);
    }
  };

  // 필터가 선택되었는지 확인
  const hasSelectedFilter = useMemo(() => {
    return (
      operatingTimeMode !== 'none' ||
      selectedFoodTypes.length > 0 ||
      selectedAffiliates.length > 0 ||
      selectedRestaurantTypes.length > 0
    );
  }, [operatingTimeMode, selectedFoodTypes, selectedAffiliates, selectedRestaurantTypes]);

  // 적용된 필터가 있는지 확인
  const hasAppliedFilter = useMemo(() => {
    return currentFilter && (
      (currentFilter.filterParams && Object.keys(currentFilter.filterParams).length > 0) ||
      currentFilter.operatingTimeFilter !== null
    );
  }, [currentFilter]);

  // 초기화 버튼을 표시할지 결정
  const showResetButton = hasSelectedFilter || hasAppliedFilter;

  // 현재 필터 상태와 초기 필터 상태 비교
  const hasFilterChanged = useMemo(() => {
    if (!initialFilterState) return false;
    
    // 운영시간 모드 비교
    if (operatingTimeMode !== initialFilterState.operatingTimeMode) return true;
    
    // 운영시간 모드가 'operating'이면 현재 시간으로 자동 설정되므로 비교 불필요
    // 'manual'일 때만 비교
    if (operatingTimeMode === 'manual') {
      if (selectedDay !== initialFilterState.selectedDay) return true;
      if (selectedHour !== initialFilterState.selectedHour) return true;
      if (selectedMin !== initialFilterState.selectedMin) return true;
    } else if (operatingTimeMode === 'operating') {
      // operating 모드는 항상 현재 시간이므로 초기 상태와 다를 수 있음
      // 하지만 사용자가 변경한 것이 아니므로 비교에서 제외
      // 대신 다른 필터와 비교
    }
    
    // 음식 종류 비교
    if (selectedFoodTypes.length !== initialFilterState.selectedFoodTypes.length) return true;
    if (!selectedFoodTypes.every(type => initialFilterState.selectedFoodTypes.includes(type))) return true;
    
    // 제휴 비교
    if (selectedAffiliates.length !== initialFilterState.selectedAffiliates.length) return true;
    if (!selectedAffiliates.every(aff => initialFilterState.selectedAffiliates.includes(aff))) return true;
    
    // 식당 종류 비교
    if (selectedRestaurantTypes.length !== initialFilterState.selectedRestaurantTypes.length) return true;
    if (!selectedRestaurantTypes.every(type => initialFilterState.selectedRestaurantTypes.includes(type))) return true;
    
    return false;
  }, [initialFilterState, operatingTimeMode, selectedDay, selectedHour, selectedMin, selectedFoodTypes, selectedAffiliates, selectedRestaurantTypes]);

  const handleApply = async () => {
    // 적용 시점의 필터 상태 계산 (운영중 모드인 경우 현재 시간으로 업데이트)
    let finalDay = selectedDay;
    let finalHour = selectedHour;
    let finalMin = selectedMin;
    
    if (operatingTimeMode === 'operating') {
      // 운영중 모드: 적용 시점의 현재 시간 사용
      const currentTime = getCurrentTime();
      finalDay = currentTime.day;
      finalHour = currentTime.hour;
      finalMin = currentTime.minute;
    } else if (operatingTimeMode === 'none') {
      // 초기화 상태일 때는 시간 파라미터를 undefined로 설정
      finalDay = undefined;
      finalHour = undefined;
      finalMin = undefined;
    } else if (operatingTimeMode === 'manual') {
      // 수동 선택 모드에서 시간만 선택하고 요일이 없으면 경고
      if (finalHour && !finalDay) {
        Alert.alert('요일 선택 필요', '시간을 선택하려면 요일도 선택해주세요.');
        return;
      }
      
      // 분이 선택되지 않았으면 00분을 기본값으로 사용
      if (finalDay && finalHour && !finalMin) {
        finalMin = '00';
      }
    }

    // 적용 시점의 필터 상태 확인 (finalDay, finalHour, finalMin 사용)
    const hasFilterAtApply = (
      (finalDay !== undefined) ||
      selectedFoodTypes.length > 0 ||
      selectedAffiliates.length > 0 ||
      selectedRestaurantTypes.length > 0
    );

    // 필터가 선택되지 않았을 때는 스토리지 삭제
    if (!hasFilterAtApply) {
      try {
        await AsyncStorage.removeItem('restaurantFilter');
      } catch (error) {
        console.error('Failed to remove filter:', error);
      }
      
      // 빈 params로 onApply 호출하여 필터 해제
      onApply?.({});
      goBack();
      return;
    }

    // 필터 저장 (적용 시점의 상태 저장)
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

    // 적용 시점의 필터 상태로 params 생성
    const params = filterToParams({
      dayOfWeek: finalDay,
      hour: finalHour,
      minute: finalMin,
      categories: selectedFoodTypes,
      affiliations: selectedAffiliates,
      subCategory: selectedRestaurantTypes[0],
    });
    
    // 운영시간 필터는 로컬에서 처리하지만, Restaurant.tsx에서 필터링하기 위해 params에 포함
    // 요일만 선택한 경우도 포함
    if (finalDay) {
      params.day_of_week = finalDay;
      if (finalHour && finalMin) {
        params.time = `${finalHour}:${finalMin}`;
      }
    }
    
    // 적용 시점의 필터 상태 전달
    onApply?.(params);
    goBack();
  };

  return (
    <>
    <BottomSheet
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onClose={goBack}
      onChange={(index) => {
        // 바텀시트가 닫히기 시작하면 (index가 -1이 되면) 버튼 숨기기
        if (index === -1) {
          setIsClosing(true);
        }
      }}
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
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollViewContent, { paddingBottom: 100 + insets.bottom }]}
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

          </BottomSheetScrollView>
    </View>
    </BottomSheet>
    
    {/* 하단 버튼 - 화면 하단 고정 (모달과 독립적) */}
    {!isClosing && (
    <View 
      style={[
        styles.fixedButtonContainer, 
        { 
          bottom: 0,
        }
      ]}
      pointerEvents="box-none"
    >
      <View 
        style={[
          styles.buttonContainer, 
          { 
            paddingBottom: insets.bottom + 16,
            paddingTop: 16,
            paddingHorizontal: 16,
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            flexDirection: showResetButton ? 'row' : 'column',
            gap: showResetButton ? 8 : 0,
          }
        ]}
      >
            {showResetButton && (
              <Button variant="secondary" onPress={handleReset} className="flex-1">
                초기화
              </Button>
            )}
            <Button 
              onPress={handleApply} 
              className={showResetButton ? "flex-1" : "w-full"}
              disabled={!hasFilterChanged}
            >
              적용
            </Button>
          </View>
    </View>
    )}
  </>
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
    // flexDirection과 gap은 조건부로 설정됨
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
