import { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import BottomSheetModal, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useUploadRestaurantImage } from '@/api/restaurants/useRestaurantImage';
import { useAuth } from '@/api/auth/useAuth';
import Button from '@/components/ui/Button';
import Icon from '@/components/Icon';
import { getSafeErrorMessage } from '@/utils/errorHandler';

interface ImageUploadModalProps {
  restaurantId: number;
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onShowLogin?: () => void;
}

export default function ImageUploadModal({
  restaurantId,
  visible,
  onClose,
  onSuccess,
  onShowLogin,
}: ImageUploadModalProps) {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { mutate: uploadImage, isPending: isUploading } = useUploadRestaurantImage(restaurantId);

  const snapPoints = useMemo(() => {
    return selectedImage ? ['60%'] : ['30%'];
  }, [selectedImage]);

  const pickImage = async () => {
    try {
      // 로그인 체크
      if (!isAuthenticated) {
        onClose();
        onShowLogin?.();
        return;
      }

      // 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
        return;
      }

      // 이미지 선택 (모달은 열어둠)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        // 안드로이드 메모리 절약을 위해 이미지 리사이즈
        // 큰 이미지를 단계적으로 리사이즈하여 메모리 부족 방지
        const asset = result.assets[0];
        const originalWidth = asset.width || 4000;

        // 원본이 매우 크면 (4000px 이상) 두 단계로 리사이즈
        let resized;
        if (originalWidth > 4000) {
          // 1단계: 절반으로 축소
          const intermediate = await ImageManipulator.manipulateAsync(asset.uri, [
            { resize: { width: Math.floor(originalWidth / 2) } }
          ], {
            compress: 0.9,
            format: ImageManipulator.SaveFormat.JPEG
          });

          // 2단계: 최종 크기로 축소
          resized = await ImageManipulator.manipulateAsync(intermediate.uri, [
            { resize: { width: 1200 } }
          ], {
            compress: 0.7,
            format: ImageManipulator.SaveFormat.JPEG
          });
        } else {
          // 원본이 작으면 바로 리사이즈
          resized = await ImageManipulator.manipulateAsync(asset.uri, [
            { resize: { width: 1200 } }
          ], {
            compress: 0.7,
            format: ImageManipulator.SaveFormat.JPEG
          });
        }

        setSelectedImage(resized.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
    }
  };

  const takePhoto = async () => {
    try {
      console.log('📷 카메라 버튼 클릭됨');

      // 로그인 체크
      if (!isAuthenticated) {
        console.log('❌ 로그인 안 됨');
        onClose();
        onShowLogin?.();
        return;
      }

      console.log('✅ 로그인 확인');

      // 권한 요청 - 먼저 현재 권한 상태 확인
      console.log('🔐 카메라 권한 확인 중...');
      const currentPermission = await ImagePicker.getCameraPermissionsAsync();
      console.log('📋 현재 권한 상태:', currentPermission);

      let finalStatus = currentPermission.status;

      // 권한이 없으면 요청
      if (currentPermission.status !== 'granted') {
        console.log('🔐 카메라 권한 요청 시작...');
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        finalStatus = status;
        console.log('📋 새로운 권한 상태:', status);
      }

      if (finalStatus !== 'granted') {
        Alert.alert('권한 필요', '사진을 촬영하려면 카메라 접근 권한이 필요합니다.');
        return;
      }

      // 사진 촬영 (모달은 열어둠)
      console.log('📸 카메라 앱 실행 중...');

      // Android에서 카메라 실행 (최소한의 옵션으로)
      let result;
      try {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: false, // 편집 기능 끄기 (성능 문제 방지)
          quality: 0.8,
          exif: false, // EXIF 데이터 비활성화로 성능 개선
        });
        console.log('📸 Camera result:', result);
      } catch (cameraError) {
        console.error('❌ 카메라 실행 오류:', cameraError);
        console.error('❌ Error stack:', cameraError instanceof Error ? cameraError.stack : 'No stack');
        Alert.alert(
          '카메라 실행 실패',
          `카메라를 실행할 수 없습니다.\n${cameraError instanceof Error ? cameraError.message : '알 수 없는 오류'}`
        );
        return;
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        console.log('🖼️ 이미지 리사이즈 시작...');
        // 안드로이드 메모리 절약을 위해 이미지 리사이즈
        // 큰 이미지를 단계적으로 리사이즈하여 메모리 부족 방지
        const asset = result.assets[0];
        const originalWidth = asset.width || 4000;

        // 원본이 매우 크면 (4000px 이상) 두 단계로 리사이즈
        let resized;
        if (originalWidth > 4000) {
          console.log(`📏 큰 이미지 감지 (${originalWidth}px) - 단계별 리사이즈 시작`);

          // 1단계: 절반으로 축소
          const intermediate = await ImageManipulator.manipulateAsync(asset.uri, [
            { resize: { width: Math.floor(originalWidth / 2) } }
          ], {
            compress: 0.9,
            format: ImageManipulator.SaveFormat.JPEG
          });
          console.log('✅ 1단계 리사이즈 완료');

          // 2단계: 최종 크기로 축소
          resized = await ImageManipulator.manipulateAsync(intermediate.uri, [
            { resize: { width: 1200 } }
          ], {
            compress: 0.7,
            format: ImageManipulator.SaveFormat.JPEG
          });
          console.log('✅ 2단계 리사이즈 완료');
        } else {
          console.log(`📏 일반 이미지 (${originalWidth}px) - 직접 리사이즈`);
          // 원본이 작으면 바로 리사이즈
          resized = await ImageManipulator.manipulateAsync(asset.uri, [
            { resize: { width: 1200 } }
          ], {
            compress: 0.7,
            format: ImageManipulator.SaveFormat.JPEG
          });
          console.log('✅ 리사이즈 완료');
        }

        console.log('✅ 이미지 선택 완료:', resized.uri);
        setSelectedImage(resized.uri);
      } else {
        console.log('❌ 카메라 취소됨');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('오류', '사진을 촬영하는 중 오류가 발생했습니다.');
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert('알림', '사진을 선택해주세요.');
      return;
    }

    if (!isAuthenticated) {
      onClose();
      onShowLogin?.();
      return;
    }

    // 디버깅: FormData 직접 테스트
    console.log('🧪 FormData 테스트 시작');
    const testFormData = new FormData();
    testFormData.append('test', 'value');
    testFormData.append('image', {
      uri: selectedImage,
      type: 'image/jpeg',
      name: 'test.jpg',
    } as any);
    console.log('🧪 FormData 생성 완료:', testFormData);

    uploadImage(
      { imageUri: selectedImage },
      {
        onSuccess: () => {
          console.log('✅ 사진 업로드 성공');
          Alert.alert('완료', '사진이 업로드되었습니다.');
          setSelectedImage(null);
          onSuccess?.();
          onClose();
        },
        onError: (error: any) => {
          console.error('Upload error:', error);
          console.error('Error response:', error?.response);
          console.error('Error data:', error?.response?.data);
          console.error('Error config:', error?.config);
          const message = getSafeErrorMessage(error, '사진 업로드에 실패했습니다.');
          Alert.alert('오류', message);
        },
      }
    );
  };

  const handleClose = () => {
    setSelectedImage(null);
    onClose();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        onPress={handleClose}
      />
    ),
    [handleClose]
  );

  return (
    <BottomSheetModal
      index={visible ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onChange={(index) => {
        if (index === -1) {
          handleClose();
        }
      }}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: 'white' }}
      handleIndicatorStyle={{ backgroundColor: '#D1D5DB' }}
      enableDynamicSizing={false}
      animateOnMount={true}
    >
      <BottomSheetView style={{ flex: 1 }}>
        <View 
          className="px-6" 
          style={{ 
            flex: 1,
            justifyContent: 'center',
            paddingTop: 4,
            paddingBottom: selectedImage 
              ? Math.max(insets.bottom, 20) 
              : Math.max(insets.bottom, 4)
          }}
        >
          <View style={{ justifyContent: 'center' }}>
            <View className="mb-6">
              <Text className="text-xl font-bold">사진 추가</Text>
            </View>

            {selectedImage ? (
              <View className="mb-4">
                <Image
                  source={{ uri: selectedImage }}
                  className="w-full h-64 rounded-lg"
                  resizeMode="contain"
                />
                <Pressable
                  className="mt-2 items-center"
                  onPress={() => setSelectedImage(null)}
                >
                  <Text className="text-blue-500">다시 선택</Text>
                </Pressable>
              </View>
            ) : (
              <View className="mb-2">
                <View className="flex-row gap-4 justify-center">
                  {/* 갤러리 버튼 */}
                  <Pressable
                    onPress={pickImage}
                    className="bg-gray-100 rounded-xl items-center justify-center"
                    style={{ width: 140, height: 140 }}
                  >
                    <Icon name="gallery" width={48} height={48} color="#666" />
                    <Text className="text-gray-700 text-sm font-medium mt-3">갤러리</Text>
                  </Pressable>
                  
                  {/* 카메라 버튼 */}
                  <Pressable
                    onPress={takePhoto}
                    className="bg-gray-100 rounded-xl items-center justify-center"
                    style={{ width: 140, height: 140 }}
                  >
                    <Icon name="camera" width={48} height={48} color="#666" />
                    <Text className="text-gray-700 text-sm font-medium mt-3">카메라</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {selectedImage && (
              <View className="gap-2">
                <Button
                  onPress={handleUpload}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-semibold">업로드</Text>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  onPress={handleClose}
                  disabled={isUploading}
                  className="w-full"
                >
                  <Text>취소</Text>
                </Button>
              </View>
            )}
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

