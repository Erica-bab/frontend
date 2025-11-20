import { useState } from 'react';
import { View, Text, Pressable, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from '@/components/filter/Dropdown';
import { OptionBtn } from '@/components/filter/OptionButton';
import CancelIcon from '@/assets/icon/cancel.svg';

const SCREEN_HEIGHT = Dimensions.get('window').height;


const DAYS = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
const FOOD_TYPES = ['전체','한식','양식','중식','일식','양식','아시안','분식','패스트푸드']
const HOUR = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MIN = ['00','30'];
const AFFILIATE =['공학대학','소프트웨어융합대학','약학대학','첨단융합대학','글로벌문화통상대학','커뮤니케이션&컬쳐대학','경상대학','디자인대학','예체능대학','LIONS칼리지'];
const RESTAURANT_TYPE = ['개인식당','프랜차이즈']

export default function FilterScreen() {
  const navigation = useNavigation();
  const [selectedDay, setSelectedDay] = useState<string>();
  const [selectedHour, setSelectedHour] = useState<string>();
  const [selectedMin, setSelectedMin] = useState<string>();
  const [activeDropdown, setActiveDropdown] = useState<'day' | 'hour' | 'min' | null>(null);
  const [selectedAffiliates, setSelectedAffiliates] = useState<string[]>([]);

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
          <View className="p-5 flex-row justify-between bg-white border border-b-1 border-b-gray-100">
            <Text className="text-3xl font-bold">필터</Text>
            <Pressable onPress={() => navigation.goBack()}>
              <CancelIcon />
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
          </ScrollView>
        </SafeAreaView>
      </View>
    </View>
  );
}
