import { useState } from 'react';
import { View, Text, Pressable, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Dropdown } from '@/components/filter/Dropdown';
import { OptionBtn } from '@/components/filter/OptionButton';
import Button from '@/components/ui/Button';
import Icon from '@/components/Icon';
import { filterToParams } from '@/api/restaurants/useRestaurant';
import { RestaurantListParams } from '@/api/restaurants/types';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const DAYS = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
const FOOD_TYPES = ['전체','한식','중식','일식','양식','아시안','분식','패스트푸드']
const HOUR = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MIN = ['00','30'];
const AFFILIATE =['공학대학','소프트웨어융합대학','약학대학','첨단융합대학','글로벌문화통상대학','커뮤니케이션&컬쳐대학','경상대학','디자인대학','예체능대학','LIONS칼리지'];
const RESTAURANT_TYPE = ['개인식당','프랜차이즈']

export default function FilterScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { onApply } = route.params as { onApply?: (params: RestaurantListParams) => void } || {};

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
    onApply?.(params);
    navigation.goBack();
  };

  return (
    <View className="flex-1">
      {/* 배경 딤 처리 - 클릭하면 닫힘 */}
      <Pressable className="flex-1" onPress={() => navigation.goBack()} />

      {/* 80% 올라오는 컨텐츠 */}
      <View
        className="bg-white rounded-t-3xl"
        style={{ height: SCREEN_HEIGHT * 0.8 }}
      >
        <SafeAreaView edges={['bottom']} className="flex-1">
          {/* 헤더 */}
          <View className="p-5 flex-row justify-between bg-white">
            <Text className="text-3xl font-bold">필터</Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Icon name="cancel" />
            </Pressable>
          </View>

          {/* 스크롤 가능한 컨텐츠 */}
          <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 20 }}>
            <Text className="pt-4 text-2xl font-bold mb-4">운영시간</Text>
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
            <Text className="text-2xl font-bold mb-4">음식 종류</Text>
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
            <Text className="text-2xl font-bold mb-4">제휴</Text>
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
            <Text className="text-2xl font-bold mb-4">식당종류</Text>
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
          <View className="flex-row gap-2 p-4 bg-white">
            <Button variant="secondary" onPress={handleReset} className="flex-1">
              초기화
            </Button>
            <Button onPress={handleApply} className="flex-1">
              적용
            </Button>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}
