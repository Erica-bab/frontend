import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useRestaurantDetail } from '@/api/restaurants/useRestaurant';
import { useCreateComment } from '@/api/restaurants/useReviewComment';
import { useAuth } from '@/api/auth/useAuth';
import { useCheckBookmark, useToggleBookmark, useMyComments, useMyReplies } from '@/api/user/useUserActivity';
import { AxiosError } from 'axios';
import RestaurantStatusTag from '@/components/ui/RestaurantStatusTag';
import TextIconButton from '@/components/ui/TextIconButton';
import RestaurantHomeTab from '@/components/restaurant/RestaurantHomeTab';
import RestaurantMenuTab from '@/components/restaurant/RestaurantMenuTab';
import RestaurantCommentsTab from '@/components/restaurant/RestaurantCommentsTab';
import RestaurantPhotosTab from '@/components/restaurant/RestaurantPhotosTab';
import CommentInput from '@/components/restaurant/CommentInput';
import ImageUploadModal from '@/components/restaurant/ImageUploadModal';
import NaverMapWebView from '@/components/NaverMapWebView';
import Icon from '@/components/Icon';
import { useRestaurantImages } from '@/api/restaurants/useRestaurantImage';

type RestaurantTabType = 'home' | 'menu' | 'comments' | 'photos';

export default function RestaurantDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { restaurantId, initialTab } = route.params as { restaurantId?: string; initialTab?: RestaurantTabType };
  const [selectedTab, setSelectedTab] = useState<RestaurantTabType>(initialTab || 'home');
  const [commentText, setCommentText] = useState('');

  const { isAuthenticated, isLoading: isAuthLoading, refreshAuthState } = useAuth();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 현재 위치 가져오기
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          });
        }
      } catch (error) {
        console.error('Failed to get location:', error);
      }
    })();
  }, []);

  const { data: restaurant, isLoading, error } = useRestaurantDetail(
    Number(restaurantId),
    userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : undefined
  );
  const { mutate: createComment, isPending: isCommentLoading } = useCreateComment(Number(restaurantId));
  const { refetch: refetchRestaurantImages } = useRestaurantImages(restaurant?.id || 0);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);

  // 유저 액티비티 refetch (댓글 작성 후 업데이트용)
  const { refetch: refetchMyComments } = useMyComments(1, 100, isAuthenticated === true);
  const { refetch: refetchMyReplies } = useMyReplies(1, 100, isAuthenticated === true);

  // 북마크 상태 확인 (로그인한 경우에만)
  const { data: isBookmarked = false, refetch: refetchBookmark } = useCheckBookmark(
    Number(restaurantId),
    isAuthenticated === true
  );

  const { mutate: toggleBookmark } = useToggleBookmark();

  // 북마크 토글 핸들러
  const handleBookmarkPress = async () => {
    if (!restaurantId) return;

    // 로그인 안되어 있으면 로그인 화면으로
    if (!isAuthLoading && !isAuthenticated) {
      (navigation.navigate as any)('Login', { onSuccess: refreshAuthState });
      return;
    }

    toggleBookmark(Number(restaurantId), {
      onSuccess: () => {
        refetchBookmark();
      },
      onError: (err) => {
        if ((err as AxiosError)?.response?.status === 403) {
          (navigation.navigate as any)('Login', { onSuccess: refreshAuthState });
        }
        console.error('Failed to toggle bookmark:', err);
      },
    });
  };

  // 공유 핸들러
  const handleSharePress = async () => {
    if (!restaurant) return;
    try {
      const shareUrl = `https://에리카밥.com/share/${restaurantId}`;
      const shareMessage = `${restaurant.name} - ${restaurant.category}\n⭐ ${restaurant.rating.average.toFixed(1)}\n${restaurant.location.address || '위치 정보 없음'}\n\n${shareUrl}`;

      await Share.share({
        message: shareMessage,
        title: restaurant.name,
        url: shareUrl, // iOS에서 사용
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  // 수정 핸들러
  const handleEditPress = () => {
    Alert.alert('알림', '준비중인 기능입니다.');
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">로딩 중...</Text>
      </SafeAreaView>
    );
  }

  if (error || !restaurant) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-5">
        <Text className="text-red-500 text-center">
          {error?.message || '레스토랑 정보를 불러올 수 없습니다.'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* 뒤로가기 버튼 - 화면 고정 */}
        <Pressable
          className='absolute top-0 p-2 m-2 z-10 bg-white rounded-full'
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 3,
          }}
          onPress={() => navigation.goBack()}
        >
          <Icon name='leftAngle' size={20} />
        </Pressable>

        <ScrollView>
        <View className='h-64'>
          <NaverMapWebView
            latitude={restaurant.location.latitude ?? 0}
            longitude={restaurant.location.longitude ?? 0}
            name={restaurant.name}
          />
        </View>
        <View className="flex-1">
          <View>
            <View className="flex-row items-center m-4">
              <Text className="text-xl text-blue-500">{restaurant.name}</Text>
              <Text className="text-lg ml-1">{restaurant.category}</Text>
            </View>
            <View className='ml-4 mb-4'>
              <RestaurantStatusTag
                operatingStatus={restaurant.operating_status}
                rating={restaurant.rating.average}
                onRatingPress={() => setSelectedTab('comments')}
              />
            </View>
          </View>
          <View className="flex-row border-t border-gray-200">
            <Pressable
              className='flex-1 items-center justify-center p-2 gap-1'
              onPress={handleBookmarkPress}
            >
              <Icon
                name={isBookmarked ? 'bookmark' : 'bookmark1'}
                width={15}
                height={15}
                color={isBookmarked ? '#3B82F6' : '#000000'}
              />
              <Text>저장</Text>
            </Pressable>
            <Pressable className='flex-1 items-center justify-center p-2 gap-1' onPress={handleSharePress}>
              <Icon width={15} name='share' />
              <Text>공유</Text>
            </Pressable>
            <Pressable className='flex-1 items-center justify-center p-2 gap-1' onPress={handleEditPress}>
              <Icon width={15} name='edit' />
              <Text>수정</Text>
            </Pressable>
          </View>
          <View className="border-t border-t-2 border-gray-200 mb-4">
            <View className="w-full flex-row justify-around border-b border-gray-200">
              <TextIconButton
                isOn={selectedTab === 'home'}
                onPress={() => setSelectedTab('home')}
                text="홈"
                baseBoxClass="-pb-4"
                offTextClass="text-[#000000] font-medium text-lg"
                onTextClass="text-[#2563EB] font-medium text-lg"
                onBoxClass="border-b-2 border-[#2563EB] -pb-2"
              />
              <TextIconButton
                isOn={selectedTab === 'menu'}
                onPress={() => setSelectedTab('menu')}
                text="메뉴"
                baseBoxClass="-pb-4"
                offTextClass="text-[#000000] font-medium text-lg"
                onTextClass="text-[#2563EB] font-medium text-lg"
                onBoxClass="border-b-2 border-[#2563EB] -pb-2"
              />
              <TextIconButton
                isOn={selectedTab === 'comments'}
                onPress={() => setSelectedTab('comments')}
                text="댓글"
                baseBoxClass="-pb-4"
                offTextClass="text-[#000000] font-medium text-lg"
                onTextClass="text-[#2563EB] font-medium text-lg"
                onBoxClass="border-b-2 border-[#2563EB] -pb-2"
              />
              <TextIconButton
                isOn={selectedTab === 'photos'}
                onPress={() => setSelectedTab('photos')}
                text="사진"
                baseBoxClass="-pb-4"
                offTextClass="text-[#000000] font-medium text-lg"
                onTextClass="text-[#2563EB] font-medium text-lg"
                onBoxClass="border-b-2 border-[#2563EB] -pb-2"
              />
            </View>
          </View>

          {/* 탭 콘텐츠 조건부 렌더링 */}
          {selectedTab === 'home' && <RestaurantHomeTab restaurant={restaurant} />}
          {selectedTab === 'menu' && <RestaurantMenuTab restaurant={restaurant} />}
          {selectedTab === 'comments' && (
            <RestaurantCommentsTab
              restaurant={restaurant}
              onShowLogin={() => (navigation.navigate as any)('Login', { onSuccess: refreshAuthState })}
            />
          )}
          {selectedTab === 'photos' && (
            <RestaurantPhotosTab
              restaurant={restaurant}
              onShowLogin={() => (navigation.navigate as any)('Login', { onSuccess: refreshAuthState })}
              onAddPhotoPress={() => setShowImageUploadModal(true)}
            />
          )}
        </View>
      </ScrollView>

      {/* 댓글 입력창 - 하단 고정 */}
      {selectedTab === 'comments' && (
        <CommentInput
          commentText={commentText}
          onChangeText={(text) => {
            // 인증 상태 로딩 중이면 팝업 표시하지 않음
            if (!isAuthLoading && !isAuthenticated && text.length > 0) {
              (navigation.navigate as any)('Login', { onSuccess: refreshAuthState });
              return;
            }
            setCommentText(text);
          }}
          onSubmit={() => {
            // 인증 상태 로딩 중이면 팝업 표시하지 않음
            if (!isAuthLoading && !isAuthenticated) {
              (navigation.navigate as any)('Login', { onSuccess: refreshAuthState });
              return;
            }
            if (!commentText.trim()) return;
            createComment(
              { content: commentText.trim() },
              {
                onSuccess: () => {
                  setCommentText('');
                  // 댓글 작성 후 유저 액티비티 새로고침 (자기 댓글 강조 및 수정 버튼 표시용)
                  if (isAuthenticated) {
                    refetchMyComments();
                    refetchMyReplies();
                  }
                },
              }
            );
          }}
          isLoading={isCommentLoading}
        />
      )}

      {/* 사진 추가 모달 - 최상위 레벨에서 렌더링 */}
      {restaurant && (
        <ImageUploadModal
          restaurantId={restaurant.id}
          visible={showImageUploadModal}
          onClose={() => setShowImageUploadModal(false)}
          onSuccess={() => {
            refetchRestaurantImages();
          }}
          onShowLogin={() => {
            setShowImageUploadModal(false);
            (navigation.navigate as any)('Login', { onSuccess: refreshAuthState });
          }}
        />
      )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
