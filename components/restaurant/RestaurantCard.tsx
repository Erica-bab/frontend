import { View, Text, Pressable } from 'react-native';
import Card from '@/components/ui/Card';
import RestaurantStatusTag from '@/components/ui/RestaurantStatusTag';
import Icon from '@/components/Icon';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RestaurantOperatingStatus, BusinessHours } from '@/api/restaurants/types';
import { formatDistance } from '@/utils/formatDistance';
import { formatCategory } from '@/utils/formatCategory';
import { resolveImageUri, getRandomThumbnails } from '@/utils/image';
import LazyImage from '@/components/ui/LazyImage';

interface RestaurantCardProps {
  name: string;
  category: string | string[];
  operatingStatus?: RestaurantOperatingStatus | null; // 서버에서 받은 운영 상태 (선택적)
  businessHours?: BusinessHours | null; // 운영시간 정보 (클라이언트 계산용)
  rating: number; // 서버에서 받은 별점 (리스트 API에서 이미 포함)
  comment?: string;
  restaurantId?: string;
  thumbnailUrls?: string[]; // 서버에서 받은 썸네일 URL (리스트 API에서 이미 포함)
  distance?: number | null;
  onStatusExpired?: () => void; // 상태가 만료되었을 때 호출되는 콜백
}

export default function RestaurantCard({ name, category, operatingStatus, businessHours, rating, comment, restaurantId, thumbnailUrls, distance, onStatusExpired }: RestaurantCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const displayComment = comment || null;
  
  const formattedCategory = category ? formatCategory(category) : '';
  
  // props로 받은 별점 사용 (리스트 API에서 이미 포함된 데이터)
  const currentRating = rating ?? 0;
  
  // props로 받은 썸네일 URL 사용 (리스트 API에서 이미 포함된 데이터)
  const displayThumbnails = getRandomThumbnails(
    (thumbnailUrls || []).map(resolveImageUri).filter((url): url is string => url !== null),
    3
  );
  
  // 전체 이미지 개수 (썸네일 개수로 추정, 정확한 개수는 상세 화면에서 확인)
  const totalImageCount = thumbnailUrls?.length || 0;
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
          {displayThumbnails.length === 0 ? (
            // 이미지가 없을 때: 전체 영역 하나로 합쳐서 메시지 표시
            <View className="flex-1 rounded-lg bg-gray-200 items-center justify-center" style={{ aspectRatio: 4/5 }}>
              <Icon name="camera" width={32} height={32} color="#9CA3AF" />
              <Text className="text-gray-500 text-sm mt-2 text-center px-4">
                여기를 눌러 식당 사진을 추가해주세요
              </Text>
            </View>
          ) : displayThumbnails.length === 1 ? (
            // 이미지가 1개일 때: 1개로 전체 영역 차지
            <View className="flex-1 rounded-lg overflow-hidden relative" style={{ aspectRatio: 4/5 }}>
              <LazyImage
                source={{ uri: displayThumbnails[0] }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                threshold={200}
              />
            </View>
          ) : displayThumbnails.length === 2 ? (
            // 이미지가 2개일 때: 2개로 전체 영역 차지
            displayThumbnails.map((url, index) => (
              <View key={index} className="flex-1 rounded-lg overflow-hidden relative" style={{ aspectRatio: 4/5 }}>
                <LazyImage
                  source={{ uri: url }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  threshold={200}
                />
              </View>
            ))
          ) : (
            // 이미지가 3개 이상일 때: 기존처럼 3개 표시
            displayThumbnails.slice(0, 3).map((url, index) => (
              <View key={index} className="flex-1 rounded-lg overflow-hidden relative" style={{ aspectRatio: 4/5 }}>
                <LazyImage
                  source={{ uri: url }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  threshold={200}
                />
                {/* 마지막 썸네일이고 더 많은 사진이 있을 때 "더보기" 오버레이 */}
                {index === 2 && hasMoreImages && (
                  <View className="absolute inset-0 bg-black/40 items-center justify-center">
                    <Text className="text-white font-bold text-sm">+{totalImageCount - 3}</Text>
                  </View>
                )}
              </View>
            ))
          )}
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
