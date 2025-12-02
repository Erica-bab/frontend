import { View, Text, Pressable } from 'react-native';
import Card from './Card';
import Icon from '@/components/Icon';

export default function AdBanner() {
  const handleRoulettePress = () => {
    // TODO: 룰렛 모달 열기
    console.log('룰렛뽑기 버튼 클릭');
  };

  return (
    <Card variant="banner" className='flex-row items-center justify-center p-4 gap-6'>
      <View className='gap-4'>
        <Text className="text-white text-lg font-bold">오늘의 식당을 골라드립니다</Text>
        <Pressable
          className='bg-white px-4 py-2 rounded-lg self-start'
          onPress={handleRoulettePress}
        >
          <Text className='font-bold text-blue-500'>룰렛뽑기</Text>
        </Pressable>
      </View>
      <Icon name="roulette" width={100} height={100} className="ml-2" />
    </Card>
  );
}
