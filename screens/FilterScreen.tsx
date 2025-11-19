import { View, Text, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Button from '@/components/ui/Button';
import CancelIcon from '@/assets/icon/cancel.svg';


const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function FilterScreen() {
  const navigation = useNavigation();

  return (
    <View className="flex-1">
      {/* 배경 딤 처리 - 클릭하면 닫힘 */}
      <Pressable
        className="flex-1"
        onPress={() => navigation.goBack()}
      />

      {/* 80% 올라오는 컨텐츠 */}
      <View
        className="bg-white rounded-t-3xl p-4 space-y-10"
        style={{ height: SCREEN_HEIGHT * 0.8 }}
      >
        <SafeAreaView edges={['bottom']} className="flex-1">
          <View className="p-5 flex-row justify-between">
            <Text className="text-3xl font-bold">필터</Text>
            <Pressable
              onPress={() => navigation.goBack()}
            >
            <CancelIcon />
            </Pressable>
          </View>
          <View className='h-px w-full bg-gray-100' />
          <Text className="text-2xl font-bold">운영시간</Text>
          <View className='flex-row gap-2'>
            <Button><Text>{"요일"}</Text></Button>
            <Button><Text>{"시간"}</Text></Button>
            <Button><Text>{"분"}</Text></Button>
          </View>
          <View className='h-px w-full bg-gray-100' />
          <Text className="text-2xl font-bold">제휴</Text>
          <View className='h-px w-full bg-gray-100' />
          <Text className="text-2xl font-bold">소분류</Text>
        </SafeAreaView>
      </View>
    </View>
  );
}
