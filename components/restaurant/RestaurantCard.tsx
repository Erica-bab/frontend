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
  const resolveImageUri = (uri?: string) => {
    if (!uri) return null;
    const path = uri.startsWith('/') ? uri.slice(1) : uri;
    return `https://에리카밥.com/${path}`;
  };
  const displayThumbnails = (thumbnailUrls?.slice(0, 3) || [])
    .map(resolveImageUri)
    .filter(Boolean) as string[];

  return (
    <Card className='bg-white border border-gray-100'>
      <View className="flex-row items-center">
        <Text className="text-lg text-blue-500">{name}</Text>
        <Text className="ml-1">{category}</Text>
      </View>
      <RestaurantStatusTag status={status} rating={rating} />
      <View className="flex-row gap-2 h-[200px] bg-gray-100">
        {[0, 1, 2].map(index => {
          const url = displayThumbnails[index];
          return url ? (
            <View key={index} className="flex-1 h-full rounded-lg overflow-hidden">
              <Image
                source={{ uri: url }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          ) : (
            <View key={index} className="flex-1 h-full rounded-lg bg-gray-200 items-center justify-center">
              <Text className="text-gray-500 text-xs">이미지가 없습니다</Text>
            </View>
          );
        })}
      </View>
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
