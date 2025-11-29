import { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
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

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (params: RestaurantListParams) => void;
}

export default function FilterBottomSheet({ visible, onClose, onApply }: FilterBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['80%'], []);

  const [selectedDay, setSelectedDay] = useState<string>();
  const [selectedHour, setSelectedHour] = useState<string>();
  const [selectedMin, setSelectedMin] = useState<string>();
  const [activeDropdown, setActiveDropdown] = useState<'day' | 'hour' | 'min' | null>(null);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<string[]>([]);
  const [selectedAffiliates, setSelectedAffiliates] = useState<string[]>([]);
  const [selectedRestaurantTypes, setSelectedRestaurantTypes] = useState<string[]>([]);

  const handleReset = () => {
    setSelectedDay(undefined);
    setSelectedHour(undefined);
    setSelectedMin(undefined);
    setSelectedFoodTypes([]);
    setSelectedAffiliates([]);
    setSelectedRestaurantTypes([]);
  };

  const handleApply = () => {
    const params = filterToParams({
      dayOfWeek: selectedDay,
      hour: selectedHour,
      minute: selectedMin,
      categories: selectedFoodTypes,
      affiliations: selectedAffiliates,
      subCategory: selectedRestaurantTypes[0],
    });
    onApply(params);
    onClose();
  };

  if (!visible) return null;

  return (
    <BottomSheet
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onClose={onClose}
      backgroundStyle={styles.container}
      handleIndicatorStyle={{ display: 'none' }}
      style={{ zIndex: 1000 }}
    >
      <BottomSheetView style={[styles.modalContent, { paddingBottom: insets.bottom }]}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>필터</Text>
          <Pressable onPress={onClose}>
            <Icon name="cancel" />
          </Pressable>
        </View>

        {/* 스크롤 가능한 컨텐츠 */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
            <Text className="pt-4 text-xl font-bold mb-4">운영시간</Text>
            <View className='flex-row gap-2 flex-wrap'>
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
                selectedValue={selectedHour?selectedHour+"시":selectedHour}
                onSelect={setSelectedHour}
                placeholder="시간"
                isOpen={activeDropdown === 'hour'}
                onToggle={() => setActiveDropdown(activeDropdown === 'hour' ? null : 'hour')}
              />
              <Dropdown
                label="분"
                options={MIN}
                selectedValue={selectedMin?selectedMin+"분":selectedMin}
                onSelect={setSelectedMin}
                placeholder="분"
                isOpen={activeDropdown === 'min'}
                onToggle={() => setActiveDropdown(activeDropdown === 'min' ? null : 'min')}
              />
            </View>

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
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.buttonContainer}>
          <Button variant="secondary" onPress={handleReset} className="flex-1">
            초기화
          </Button>
          <Button onPress={handleApply} className="flex-1">
            적용
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    paddingBottom: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
});