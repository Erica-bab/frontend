import { useState, useEffect } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import Card from './Card';
import ericard from '@/assets/images/ericard.png';

interface AdItem {
  id: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  image: any;
  onPress: () => void;
}

// 광고 목록
const AD_LIST: AdItem[] = [
  {
    id: 'ericard',
    title: '일상 속 모든 순간, 한장으로\n더 똑똑한 소비의 시작 에리 체크카드',
    buttonText: '혜택 확인하기',
    image: ericard,
    onPress: () => {
      console.log('에리카드 광고 클릭');
      // TODO: 광고 클릭 시 동작 구현
    },
  },
  // 여기에 더 많은 광고를 추가할 수 있습니다
];

export default function AdBanner() {
  const [currentAd, setCurrentAd] = useState<AdItem>(AD_LIST[0]);

  useEffect(() => {
    // 랜덤으로 광고 선택
    const randomIndex = Math.floor(Math.random() * AD_LIST.length);
    setCurrentAd(AD_LIST[randomIndex]);
  }, []);

  return (
    <Card variant="banner" className='flex-row justify-evenly'>
      <View className='gap-4'>
        <Text className="text-white">{currentAd.title}</Text>
        <Pressable
          className='bg-white p-1 rounded-lg self-start'
          onPress={currentAd.onPress}
        >
          <Text className='p-1 font-bold text-blue-500'>
            {currentAd.buttonText}
          </Text>
        </Pressable>
      </View>
      <Image source={currentAd.image} className="w-30 h-24" resizeMode="contain" />
    </Card>
  );
}
