import { View, Text, Pressable, Image } from 'react-native';
import Card from '@/components/ui/Card';
import RestaurantStatusTag from '@/components/ui/RestaurantStatusTag';
import Icon from '@/components/Icon';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RestaurantOperatingStatus, BusinessHours } from '@/api/restaurants/types';
import { useRestaurantImages } from '@/api/restaurants/useRestaurantImage';
import { useRatingStats } from '@/api/restaurants/useRating';
import { formatDistance } from '@/utils/formatDistance';
import { formatCategory } from '@/utils/formatCategory';

interface RestaurantCardProps {
  name: string;
  category: string | string[];
  operatingStatus?: RestaurantOperatingStatus | null; // 서버에서 받은 운영 상태 (선택적)
  businessHours?: BusinessHours | null; // 운영시간 정보 (클라이언트 계산용)
  rating: number;
  comment?: string;
  restaurantId?: string;
  thumbnailUrls?: string[];
  distance?: number | null;
  onStatusExpired?: () => void; // 상태가 만료되었을 때 호출되는 콜백
}

export default function RestaurantCard({ name, category, operatingStatus, businessHours, rating, comment, restaurantId, thumbnailUrls, distance, onStatusExpired }: RestaurantCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const displayComment = comment || null;
  
  const formattedCategory = category ? formatCategory(category) : '';
  
  // 별점 전용 엔드포인트로 별점 주기적 새로고침
  const { data: ratingStats } = useRatingStats(
    restaurantId ? Number(restaurantId) : 0,
    !!restaurantId,
    {
      refetchInterval: 60000, // 1분마다 새로고침
    }
  );
  
  // 최신 별점 사용 (서버에서 가져온 별점이 있으면 사용, 없으면 props의 rating 사용)
  const currentRating = ratingStats?.average ?? rating;
  
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

  const handleStatusPress = () => {
    if (restaurantId) {
      navigation.navigate('RestaurantDetail', { restaurantId, initialTab: 'home' });
    }
  };

  const handleCardPress = () => {
    navigation.navigate('RestaurantDetail', { restaurantId });
  };

  return (
    <Card className='bg-white border border-gray-100'>
      {/* 식당 이름과 카테고리 영역 - 자세히보기로 이동 */}
      <Pressable onPress={handleCardPress}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-lg text-blue-500">{name}</Text>
            {formattedCategory && (
              <Text className="ml-1 text-gray-600">{formattedCategory}</Text>
            )}
          </View>
          {distance !== null && distance !== undefined && (
            <Text className="text-sm text-gray-500">
              {formatDistance(distance)}
            </Text>
          )}
        </View>
      </Pressable>
      
      {/* 상태 태그 영역 - 상태 태그는 홈 탭으로, 별점은 댓글 탭으로 이동 */}
      <View className="pb-2">
        <RestaurantStatusTag 
          operatingStatus={operatingStatus}
          businessHours={businessHours}
          rating={currentRating} 
          onRatingPress={handleRatingPress}
          onStatusPress={handleStatusPress}
          onStatusExpired={onStatusExpired}
        />
      </View>
      
      {/* 썸네일 표시 - 이미지 영역만 사진 탭으로 이동 */}
      <Pressable
        onPress={() => navigation.navigate('RestaurantDetail', { restaurantId, initialTab: 'photos' })}
      >
        <View className="flex-row gap-2 bg-gray-100 mb-2">
        {[0, 1, 2].map(index => {
          const url = displayThumbnails[index];
          return url ? (
              <View key={index} className="flex-1 rounded-lg overflow-hidden relative" style={{ aspectRatio: 1 }}>
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
            <View key={index} className="flex-1 rounded-lg bg-gray-200 items-center justify-center" style={{ aspectRatio: 1 }}>
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
        onPress={handleCardPress}
        className='w-full justify-center items-center bg-blue-500 p-1 rounded-lg'
      >
        <Text className='text-white font-bold p-1'>자세히보기</Text>
      </Pressable>
    </Card>
  );
}
