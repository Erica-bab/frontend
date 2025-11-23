import { View, Text, Pressable, Image } from 'react-native';
import Card from '@/components/ui/Card';
import RestaurantStatusTag from '@/components/ui/RestaurantStatusTag';
import Icon from '@/components/Icon';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface RestaurantCardProps {
  name: string;
  category: string;
  status: '영업중' | '영업종료' | '브레이크타임';
  rating: number;
  comment?: string;
  restaurantId?: string;
  thumbnailUrls?: string[];
}

export default function RestaurantCard({ name, category, status, rating, comment, restaurantId, thumbnailUrls }: RestaurantCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const displayComment = comment || null;
  const displayThumbnails = thumbnailUrls?.slice(0, 3) || [];

  return (
    <Card className='bg-white border border-gray-100'>
      <View className="flex-row items-center">
        <Text className="text-lg text-blue-500">{name}</Text>
        <Text className="ml-1">{category}</Text>
      </View>
      <RestaurantStatusTag status={status} rating={rating} />
      {displayThumbnails.length > 0 ? (
        <View className="flex-row gap-2 h-[100px]">
          {displayThumbnails.map((url, index) => (
            <Image
              key={index}
              source={{ uri: url }}
              className="flex-1 h-full rounded-lg"
              resizeMode="cover"
            />
          ))}
        </View>
      ) : (
        <View className='bg-gray-200 h-[100px] rounded-lg' />
      )}
      {displayComment && <View className= 'bg-gray-100 flex-row rounded-lg p-4 w-full justify-between items-center gap-2'>
        <Text className='text-gray-500 flex-1' numberOfLines={2}>
          {displayComment}
        </Text>
        <Icon name='rightAngle' width={8}/>
      </View>}
      <Pressable
        onPress={() => navigation.navigate('RestaurantDetail', { restaurantId })}
        className='w-full justify-center items-center bg-blue-500 p-1 rounded-lg'
      >
        <Text className='text-white font-bold p-1'>자세히보기</Text>
      </Pressable>
    </Card>
  );
}
