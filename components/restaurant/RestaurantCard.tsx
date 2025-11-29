import { View, Text, Pressable, Image } from 'react-native';
import Card from '@/components/ui/Card';
import RestaurantStatusTag from '@/components/ui/RestaurantStatusTag';
import Icon from '@/components/Icon';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RestaurantOperatingStatus } from '@/api/restaurants/types';
import { useRestaurantImages } from '@/api/restaurants/useRestaurantImage';
import { formatDistance } from '@/utils/formatDistance';

interface RestaurantCardProps {
  name: string;
  category: string;
  operatingStatus?: RestaurantOperatingStatus | null;
  rating: number;
  comment?: string;
  restaurantId?: string;
  thumbnailUrls?: string[];
  distance?: number | null;
}

export default function RestaurantCard({ name, category, operatingStatus, rating, comment, restaurantId, thumbnailUrls, distance }: RestaurantCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const displayComment = comment || null;
  
  // 식당 이미지 조회 (restaurantId가 있을 때만)
  const { data: imagesData } = useRestaurantImages(
    restaurantId ? Number(restaurantId) : 0
  );

  const resolveImageUri = (uri?: string) => {
    if (!uri) return null;
    const path = uri.startsWith('/') ? uri.slice(1) : uri;
    return `https://에리카밥.com/${path}`;
  };

  // 이미지 데이터에서 랜덤으로 3개 선택
  const getRandomThumbnails = (images: string[], count: number): string[] => {
    if (images.length <= count) return images;
    
    // 배열을 복사하고 셔플
    const shuffled = [...images].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const imageUrls = (imagesData?.images?.map(img => resolveImageUri(img.image_url)).filter((url): url is string => url !== null) || []);
  const displayThumbnails = imageUrls.length > 0
    ? getRandomThumbnails(imageUrls, 3)
    : getRandomThumbnails((thumbnailUrls || []).map(resolveImageUri).filter((url): url is string => url !== null), 3);
  
  // 전체 이미지 개수
  const totalImageCount = imagesData?.total_count || imageUrls.length || thumbnailUrls?.length || 0;
  const hasMoreImages = totalImageCount > 3;

  const handleRatingPress = () => {
    if (restaurantId) {
      navigation.navigate('RestaurantDetail', { restaurantId, initialTab: 'comments' });
    }
  };

  return (
    <Card className='bg-white border border-gray-100'>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-lg text-blue-500">{name}</Text>
          <Text className="ml-1">{category}</Text>
        </View>
        {distance !== null && distance !== undefined && (
          <Text className="text-sm text-gray-500">
            {formatDistance(distance)}
          </Text>
        )}
      </View>
      <RestaurantStatusTag operatingStatus={operatingStatus} rating={rating} onRatingPress={handleRatingPress} />
      
      {/* 썸네일 표시 */}
      <Pressable
        onPress={() => navigation.navigate('RestaurantDetail', { restaurantId, initialTab: 'photos' })}
      >
        <View className="flex-row gap-2 h-[200px] bg-gray-100 mb-2">
          {[0, 1, 2].map(index => {
            const url = displayThumbnails[index];
            return url ? (
              <View key={index} className="flex-1 h-full rounded-lg overflow-hidden relative">
                <Image
                  source={{ uri: url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                {/* 마지막 썸네일이고 더 많은 사진이 있을 때 "더보기" 오버레이 */}
                {index === 2 && hasMoreImages && (
                  <View className="absolute inset-0 bg-black/40 items-center justify-center">
                    <Text className="text-white font-bold text-sm">+{totalImageCount - 3}</Text>
                  </View>
                )}
              </View>
            ) : (
              <View key={index} className="flex-1 h-full rounded-lg bg-gray-200 items-center justify-center">
                <Text className="text-gray-500 text-xs">이미지가 없습니다</Text>
              </View>
            );
          })}
        </View>
      </Pressable>

      {displayComment && (
        <Pressable
          className='bg-gray-100 flex-row rounded-lg p-4 w-full justify-between items-center gap-2'
          onPress={() => navigation.navigate('RestaurantDetail', { restaurantId, initialTab: 'comments' })}
        >
          <Text className='text-gray-500 flex-1' numberOfLines={2}>
            {displayComment}
          </Text>
          <Icon name='rightAngle' width={8}/>
        </Pressable>
      )}
      <Pressable
        onPress={() => navigation.navigate('RestaurantDetail', { restaurantId })}
        className='w-full justify-center items-center bg-blue-500 p-1 rounded-lg'
      >
        <Text className='text-white font-bold p-1'>자세히보기</Text>
      </Pressable>
    </Card>
  );
}
