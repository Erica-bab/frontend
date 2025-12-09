import { View, Text, Pressable, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
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

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_GAP = 8; // gap-2 = 8px
const IMAGES_PER_ROW = 3;
// 기존 높이 계산: (화면 너비 - 좌우 패딩 - gap) / 3 * (5/4)
const CARD_PADDING = 16; // Card의 기본 패딩
const IMAGE_CONTAINER_WIDTH = SCREEN_WIDTH - CARD_PADDING * 2;
const SINGLE_IMAGE_WIDTH = (IMAGE_CONTAINER_WIDTH - IMAGE_GAP * (IMAGES_PER_ROW - 1)) / IMAGES_PER_ROW;
const FIXED_IMAGE_HEIGHT = SINGLE_IMAGE_WIDTH * (5 / 4); // aspectRatio 4/5

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

  const cardScale = useSharedValue(1);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
    };
  });

  const handleCardPress = () => {
    navigation.navigate('RestaurantDetail', { restaurantId });
  };

  const handleCardPressIn = () => {
    cardScale.value = withSpring(0.98, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handleCardPressOut = () => {
    cardScale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handleEmptyImagePress = () => {
    if (restaurantId) {
      // 사진 탭으로 이동하고 사진 추가 모달 열기
      navigation.navigate('RestaurantDetail', { 
        restaurantId, 
        initialTab: 'photos',
        openImageUploadModal: true 
      });
    }
  };

  return (
    <Animated.View style={cardAnimatedStyle}>
      <Card className='bg-white border border-gray-100'>
        {/* 식당 이름과 카테고리 영역 - 자세히보기로 이동 */}
        <Pressable 
          onPress={handleCardPress}
          onPressIn={handleCardPressIn}
          onPressOut={handleCardPressOut}
        >
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
      <View className="flex-row gap-2 bg-gray-100 mb-2" style={{ height: FIXED_IMAGE_HEIGHT }}>
        {displayThumbnails.length === 0 ? (
          // 이미지가 없을 때: 전체 영역 하나로 합쳐서 메시지 표시
          <Pressable
            onPress={handleEmptyImagePress}
            className="flex-1 rounded-lg bg-gray-200 items-center justify-center"
          >
            <Icon name="camera" width={32} height={32} color="#9CA3AF" />
            <Text className="text-gray-500 text-sm mt-2 text-center px-4">
              여기를 눌러 식당 사진을 추가해주세요
            </Text>
          </Pressable>
        ) : displayThumbnails.length === 1 ? (
          // 이미지가 1개일 때: 1개로 전체 영역 차지 (가로 최대, 세로 가운데 정렬)
          <Pressable
            onPress={() => navigation.navigate('RestaurantDetail', { restaurantId, initialTab: 'photos' })}
            className="flex-1 rounded-lg overflow-hidden relative"
          >
            <LazyImage
              source={{ uri: displayThumbnails[0] }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              threshold={200}
            />
          </Pressable>
        ) : displayThumbnails.length === 2 ? (
          // 이미지가 2개일 때: 2개로 전체 영역 차지 (가로 최대, 세로 가운데 정렬)
          displayThumbnails.map((url, index) => (
            <Pressable
              key={index}
              onPress={() => navigation.navigate('RestaurantDetail', { restaurantId, initialTab: 'photos' })}
              className="flex-1 rounded-lg overflow-hidden relative"
            >
              <LazyImage
                source={{ uri: url }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                threshold={200}
              />
            </Pressable>
          ))
        ) : (
          // 이미지가 3개 이상일 때: 기존처럼 3개 표시
          displayThumbnails.slice(0, 3).map((url, index) => (
            <Pressable
              key={index}
              onPress={() => navigation.navigate('RestaurantDetail', { restaurantId, initialTab: 'photos' })}
              className="flex-1 rounded-lg overflow-hidden relative"
            >
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
            </Pressable>
          ))
        )}
      </View>

      {/* 댓글 영역 - 댓글이 있으면 댓글 표시, 없으면 안내 메시지 */}
      <Pressable
        className='bg-gray-100 flex-row rounded-lg p-4 w-full justify-between items-center gap-2'
        onPress={() => navigation.navigate('RestaurantDetail', { restaurantId, initialTab: 'comments' })}
      >
        {displayComment ? (
          <>
            <Text className='text-gray-500 flex-1' numberOfLines={2}>
              {displayComment}
            </Text>
            <Icon name='rightAngle' width={8}/>
          </>
        ) : (
          <>
            <Text className='text-gray-400 flex-1' numberOfLines={2}>
              여기를 눌러 댓글을 작성해보세요
            </Text>
            <Icon name='rightAngle' width={8} color="#9CA3AF"/>
          </>
        )}
      </Pressable>
      <Pressable
        onPress={handleCardPress}
        onPressIn={handleCardPressIn}
        onPressOut={handleCardPressOut}
        className='w-full justify-center items-center bg-blue-500 p-1 rounded-lg'
      >
        <Text className='text-white font-bold p-1'>자세히보기</Text>
      </Pressable>
      </Card>
    </Animated.View>
  );
}
