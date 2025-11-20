import { View, Text } from 'react-native';
import Card from '@/components/ui/Card';
import RestaurantStatusTag from '@/components/ui/RestaurantStatusTag';

interface RestaurantCardProps {
  name: string;
  category: string;
  status: '영업중' | '영업종료' | '브레이크타임';
  rating: number;
  comment?: string;
  restaurantId?: string;
}

export default function RestaurantCard({ name, category, status, rating, comment, restaurantId }: RestaurantCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const displayComment = comment || "치즈돈가스가 등김카츠보다 시간이 더 걸린다는 건 알았지만 이건 너무 대기 시간이 길어서 짜증났어요 진짜 최악이었습니다";

  return (
    <Card>
      <View className="flex-row items-center">
        <Text className="text-lg text-blue-500">{name}</Text>
        <Text className="ml-1">{category}</Text>
      </View>
      <RestaurantStatusTag status={status} rating={rating} />
      <View className='bg-gray-500 h-[100px]'>
      </View>
      <View className= 'bg-gray-100 flex-row rounded-lg p-4 w-full justify-between items-center gap-2'>
        <Text className='text-gray-500 flex-1' numberOfLines={2}>
          {displayComment}
        </Text>
        <Icon name='rightAngle' width={8}/>
      </View>
      <Pressable
        onPress={() => navigation.navigate('RestaurantDetail', { restaurantId })}
        className='w-full justify-center items-center bg-blue-500 p-1 rounded-lg'
      >
        <Text className='text-white font-bold p-1'>자세히보기</Text>
      </Pressable>
    </Card>
  );
}
