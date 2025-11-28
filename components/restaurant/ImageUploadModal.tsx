import { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import BottomSheetModal, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useUploadRestaurantImage } from '@/api/restaurants/useRestaurantImage';
import { useAuth } from '@/api/auth/useAuth';
import Button from '@/components/ui/Button';
import Icon from '@/components/Icon';

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
      // mediaTypes를 생략하면 기본값으로 이미지만 선택 가능
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
    }
  };

  const takePhoto = async () => {
    try {
      // 로그인 체크
      if (!isAuthenticated) {
        onClose();
        onShowLogin?.();
        return;
      }

      // 권한 요청
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '사진을 촬영하려면 카메라 접근 권한이 필요합니다.');
        return;
      }

      // 사진 촬영 (모달은 열어둠)
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('Camera result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('오류', '사진을 촬영하는 중 오류가 발생했습니다.');
    }
  };

  const handleUpload = () => {
    if (!selectedImage) {
      Alert.alert('알림', '사진을 선택해주세요.');
      return;
    }

    if (!isAuthenticated) {
      onClose();
      onShowLogin?.();
      return;
    }

    uploadImage(
      { imageUri: selectedImage },
      {
        onSuccess: () => {
          Alert.alert('완료', '사진이 업로드되었습니다.');
          setSelectedImage(null);
          onSuccess?.();
          onClose();
        },
        onError: (error: any) => {
          console.error('Upload error:', error);
          console.error('Error response:', error?.response);
          console.error('Error data:', error?.response?.data);
          Alert.alert(
            '오류', 
            error?.response?.data?.detail || error?.response?.data?.message || error?.message || '사진 업로드에 실패했습니다.'
          );
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
      key={selectedImage ? 'with-image' : 'without-image'}
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
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold">사진 추가</Text>
              <Pressable onPress={handleClose}>
                <Icon name="cancel" />
              </Pressable>
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

