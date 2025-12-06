import { useState } from 'react';
import { View, Text, FlatList, Pressable, Alert, ActivityIndicator, Dimensions, Modal, Image } from 'react-native';
import { RestaurantDetailResponse } from '@/api/restaurants/types';
import { useRestaurantImages, useDeleteRestaurantImage } from '@/api/restaurants/useRestaurantImage';
import { useAuth, useCurrentUser } from '@/api/auth/useAuth';
import Icon from '@/components/Icon';
import { getSafeErrorMessage } from '@/utils/errorHandler';
import LazyImage from '@/components/ui/LazyImage';
import { resolveImageUri } from '@/utils/image';

interface RestaurantPhotosTabProps {
  restaurant: RestaurantDetailResponse;
  onShowLogin?: () => void;
  onAddPhotoPress?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_GAP = 4;
const IMAGES_PER_ROW = 3;
const IMAGE_SIZE = (SCREEN_WIDTH - IMAGE_GAP * (IMAGES_PER_ROW + 1)) / IMAGES_PER_ROW;

export default function RestaurantPhotosTab({ restaurant, onShowLogin, onAddPhotoPress }: RestaurantPhotosTabProps) {
  const { isAuthenticated } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const { data: imagesData, isLoading, refetch: refetchImages } = useRestaurantImages(restaurant.id);
  const { mutate: deleteImage, isPending: isDeleting } = useDeleteRestaurantImage(restaurant.id);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 본인이 업로드한 이미지인지 확인하는 함수
  const isMyImage = (imageId: number): boolean => {
    if (!isAuthenticated || !currentUser || !imagesData?.images) return false;
    const image = imagesData.images.find(img => img.id === imageId);
    if (!image) return false;
    
    // 현재 사용자 타입과 ID 확인
    const userType = currentUser.google_id ? 'google' : (currentUser.apple_id ? 'apple' : null);
    const userId = currentUser.id;
    
    if (!userType || userId === null) return false;
    
    return image.uploaded_by_type === userType && image.uploaded_by === userId;
  };

  // 이미지 삭제 핸들러
  const handleDeleteImage = (imageId: number) => {
    Alert.alert(
      '사진 삭제',
      '이 사진을 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            deleteImage(imageId, {
              onSuccess: () => {
                refetchImages();
              },
              onError: (error: any) => {
                const message = getSafeErrorMessage(error, '사진 삭제에 실패했습니다.');
                Alert.alert('오류', message);
              },
            });
          },
        },
      ]
    );
  };

  const images = imagesData?.images || [];
  const imageUrls = images.map(img => ({
    id: img.id,
    url: resolveImageUri(img.image_url),
    isMyUpload: isMyImage(img.id),
  })).filter(item => item.url !== null);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center py-20">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">사진을 불러오는 중...</Text>
      </View>
    );
  }

  if (imageUrls.length === 0) {
    return (
      <View className="flex-1 bg-white">
        {/* 사진 추가하기 버튼 */}
        <Pressable
          onPress={() => {
            if (!isAuthenticated) {
              onShowLogin?.();
            } else {
              onAddPhotoPress?.();
            }
          }}
          className="flex-row items-center justify-center gap-2 py-3 px-4 bg-gray-100 mx-4 mt-4 mb-2 rounded-lg"
        >
          <Icon name="edit" width={16} height={16} />
          <Text className="text-gray-700 text-sm font-medium">사진 추가하기</Text>
        </Pressable>

        <View className="flex-1 justify-center items-center py-20">
          <Text className="text-gray-500 text-lg">등록된 사진이 없습니다</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white">
      {/* 사진 추가하기 버튼 */}
      <Pressable
        onPress={() => {
          if (!isAuthenticated) {
            onShowLogin?.();
          } else {
            onAddPhotoPress?.();
          }
        }}
        className="flex-row items-center justify-center gap-2 py-3 px-4 bg-gray-100 mx-4 mt-4 mb-2 rounded-lg"
      >
        <Icon name="edit" width={16} height={16} />
        <Text className="text-gray-700 text-sm font-medium">사진 추가하기</Text>
      </Pressable>

      <FlatList
        data={imageUrls}
        numColumns={IMAGES_PER_ROW}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: IMAGE_GAP }}
        columnWrapperStyle={{ marginHorizontal: -IMAGE_GAP / 2 }}
        nestedScrollEnabled={true} // ScrollView 안에서 중첩 스크롤 허용
        scrollEnabled={false} // 부모 ScrollView가 스크롤 처리
        // 레이지 로딩 최적화
        initialNumToRender={9} // 처음 9개만 렌더링 (3x3)
        maxToRenderPerBatch={6} // 한 번에 6개씩 추가 렌더링
        windowSize={5} // 화면 높이의 5배만큼만 메모리 유지
        removeClippedSubviews={true} // 뷰포트 밖의 뷰 제거
        renderItem={({ item }) => (
          <View
            style={{
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
              margin: IMAGE_GAP / 2,
            }}
            className="relative rounded-lg overflow-hidden bg-gray-200"
          >
            <Pressable onPress={() => setSelectedImage(item.url!)}>
              <LazyImage
                source={{ uri: item.url! }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                threshold={300} // 뷰포트에서 300px 전에 로드 시작
              />
            </Pressable>
            {/* 본인이 업로드한 이미지에만 삭제 버튼 표시 */}
            {item.isMyUpload && (
              <Pressable
                onPress={() => handleDeleteImage(item.id)}
                disabled={isDeleting}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full items-center justify-center"
                style={{ opacity: isDeleting ? 0.5 : 1 }}
              >
                <Text className="text-white text-base font-bold">×</Text>
              </Pressable>
            )}
          </View>
        )}
      />

      {/* 이미지 확대 모달 */}
      <Modal
        visible={selectedImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <Pressable
          className="flex-1 bg-black/90 justify-center items-center"
          onPress={() => setSelectedImage(null)}
        >
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: SCREEN_WIDTH * 0.9, height: SCREEN_WIDTH * 0.9 }}
              resizeMode="contain"
            />
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

