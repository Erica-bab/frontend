import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { useUploadRestaurantImage } from "@/api/restaurants/useRestaurantImage";
import { useAuth } from "@/api/auth/useAuth";
import Button from "@/components/ui/Button";
import Icon from "@/components/Icon";
import { getSafeErrorMessage } from "@/utils/errorHandler";

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
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const { mutate: uploadImage, isPending: isUploading } =
    useUploadRestaurantImage(restaurantId);

  // 임시 파일 URI 추적용 (메모리 해제를 위해)
  const tempImageUriRef = useRef<string | null>(null);

  // BottomSheet snap points
  const snapPoints = useMemo(
    () => [selectedImage ? "70%" : "38%"],
    [selectedImage]
  );

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      cleanupImage();
    };
  }, []);

  // 이미지 메모리 정리 함수
  const cleanupImage = async () => {
    if (tempImageUriRef.current) {
      try {
        // 임시 파일 삭제 시도 (리사이즈된 이미지)
        const fileInfo = await FileSystem.getInfoAsync(tempImageUriRef.current);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(tempImageUriRef.current, {
            idempotent: true,
          });
          console.log("🧹 임시 이미지 파일 삭제:", tempImageUriRef.current);
        }
      } catch (error) {
        // 삭제 실패는 무시 (OS가 나중에 정리함)
        console.log("임시 파일 삭제 실패 (무시):", error);
      }
      tempImageUriRef.current = null;
    }
    setSelectedImage(null);
  };

  const pickImage = async () => {
    try {
      // 로그인 체크
      if (!isAuthenticated) {
        onClose();
        onShowLogin?.();
        return;
      }

      // 권한 요청
      let permissionResult;
      try {
        permissionResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
      } catch (permError) {
        console.error("갤러리 권한 요청 실패:", permError);
        Alert.alert(
          "오류",
          "갤러리 권한을 요청할 수 없습니다. 앱 설정에서 권한을 확인해주세요."
        );
        return;
      }

      if (permissionResult.status !== "granted") {
        Alert.alert(
          "권한 필요",
          "사진을 선택하려면 갤러리 접근 권한이 필요합니다."
        );
        return;
      }

      // 이미지 선택 (모달은 열어둠)
      let result;
      try {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
        console.log("Image picker result:", result);
      } catch (pickerError) {
        console.error("이미지 선택 실패:", pickerError);
        Alert.alert("오류", "이미지를 선택할 수 없습니다. 다시 시도해주세요.");
        return;
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        try {
          // 이전 이미지가 있으면 먼저 정리
          await cleanupImage();

          // 안드로이드 메모리 절약을 위해 이미지 리사이즈
          const asset = result.assets[0];
          const originalWidth = asset.width || 1200;

          // 큰 이미지는 바로 1200px로 리사이즈 (단계 축소로 메모리 문제 해결)
          console.log(`📏 이미지 리사이즈 (${originalWidth}px -> 1200px)`);

          const resized = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: Math.min(originalWidth, 1200) } }],
            {
              compress: 0.7,
              format: ImageManipulator.SaveFormat.JPEG,
            }
          );
          console.log("✅ 리사이즈 완료:", resized.uri);

          // 새 이미지 URI 저장
          tempImageUriRef.current = resized.uri;
          setSelectedImage(resized.uri);
        } catch (resizeError) {
          console.error("이미지 리사이즈 실패:", resizeError);
          Alert.alert(
            "오류",
            "이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요."
          );
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("오류", "이미지를 선택하는 중 오류가 발생했습니다.");
    }
  };

  const takePhoto = async () => {
    // 이미 카메라 로딩 중이면 무시 (중복 클릭 방지)
    if (isCameraLoading) {
      console.log("⏳ 카메라 이미 실행 중...");
      return;
    }

    try {
      setIsCameraLoading(true);
      console.log("📷 카메라 버튼 클릭됨");

      // 로그인 체크
      if (!isAuthenticated) {
        console.log("❌ 로그인 안 됨");
        setIsCameraLoading(false);
        onClose();
        onShowLogin?.();
        return;
      }

      console.log("✅ 로그인 확인");

      // 권한 요청 - 먼저 현재 권한 상태 확인
      console.log("🔐 카메라 권한 확인 중...");
      let currentPermission;
      try {
        currentPermission = await ImagePicker.getCameraPermissionsAsync();
        console.log("📋 현재 권한 상태:", currentPermission);
      } catch (permError) {
        console.error("❌ 권한 확인 실패:", permError);
        setIsCameraLoading(false);
        Alert.alert(
          "오류",
          "카메라 권한을 확인할 수 없습니다. 앱 설정에서 권한을 확인해주세요."
        );
        return;
      }

      let finalStatus = currentPermission.status;

      // 권한이 없으면 요청
      if (currentPermission.status !== "granted") {
        console.log("🔐 카메라 권한 요청 시작...");
        try {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          finalStatus = status;
          console.log("📋 새로운 권한 상태:", status);
        } catch (permReqError) {
          console.error("❌ 권한 요청 실패:", permReqError);
          setIsCameraLoading(false);
          Alert.alert(
            "오류",
            "카메라 권한 요청에 실패했습니다. 앱 설정에서 권한을 확인해주세요."
          );
          return;
        }
      }

      if (finalStatus !== "granted") {
        setIsCameraLoading(false);
        Alert.alert(
          "권한 필요",
          "사진을 촬영하려면 카메라 접근 권한이 필요합니다."
        );
        return;
      }

      // 사진 촬영 (모달은 열어둠)
      console.log("📸 카메라 앱 실행 중...");

      // Android에서 카메라 실행 (최소한의 옵션으로)
      let result: ImagePicker.ImagePickerResult | undefined;

      // 재시도 로직 추가
      const maxRetries = 2;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            console.log(`🔄 카메라 재시도 (${attempt}/${maxRetries})...`);
          }

          // 권한 처리 완료 및 카메라 리소스 준비를 위한 충분한 지연
          // 첫 시도는 300ms, 재시도는 500ms 지연
          const delay = attempt === 0 ? 300 : 500;
          await new Promise((resolve) => setTimeout(resolve, delay));

          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true, // 편집 기능 활성화 (크롭/리사이즈 가능)
            aspect: [4, 3],
            quality: 0.8,
          });
          console.log("📸 Camera result:", result);

          // 성공하면 루프 탈출
          break;
        } catch (cameraError) {
          console.error(`❌ 카메라 실행 오류 (시도 ${attempt + 1}/${maxRetries + 1}):`, cameraError);

          // 마지막 재시도가 아니면 계속 시도
          if (attempt < maxRetries) {
            continue;
          }

          // 모든 재시도 실패
          console.error(
            "❌ Error stack:",
            cameraError instanceof Error ? cameraError.stack : "No stack"
          );
          Alert.alert(
            "카메라 실행 실패",
            `카메라를 실행할 수 없습니다.\n잠시 후 다시 시도해주세요.`
          );
          return;
        }
      }

      // result가 undefined인 경우 처리
      if (!result) {
        console.error("❌ 카메라 결과 없음");
        setIsCameraLoading(false);
        return;
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        console.log("🖼️ 이미지 리사이즈 시작...");
        try {
          // 이전 이미지가 있으면 먼저 정리
          await cleanupImage();

          // 안드로이드 메모리 절약을 위해 이미지 리사이즈
          const asset = result.assets[0];
          const originalWidth = asset.width || 1200;

          // 큰 이미지는 바로 1200px로 리사이즈 (단계 축소로 메모리 문제 해결)
          console.log(`📏 이미지 리사이즈 (${originalWidth}px -> 1200px)`);

          const resized = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: Math.min(originalWidth, 1200) } }],
            {
              compress: 0.7,
              format: ImageManipulator.SaveFormat.JPEG,
            }
          );
          console.log("✅ 리사이즈 완료:", resized.uri);

          // 새 이미지 URI 저장
          tempImageUriRef.current = resized.uri;
          setSelectedImage(resized.uri);
        } catch (resizeError) {
          console.error("❌ 이미지 리사이즈 실패:", resizeError);
          Alert.alert(
            "오류",
            "이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요."
          );
        }
      } else {
        console.log("❌ 카메라 취소됨");
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("오류", "사진을 촬영하는 중 오류가 발생했습니다.");
    } finally {
      setIsCameraLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert("알림", "사진을 선택해주세요.");
      return;
    }

    if (!isAuthenticated) {
      onClose();
      onShowLogin?.();
      return;
    }

    // 디버깅: FormData 직접 테스트
    console.log("🧪 FormData 테스트 시작");
    const testFormData = new FormData();
    testFormData.append("test", "value");
    testFormData.append("image", {
      uri: selectedImage,
      type: "image/jpeg",
      name: "test.jpg",
    } as any);
    console.log("🧪 FormData 생성 완료:", testFormData);

    uploadImage(
      { imageUri: selectedImage },
      {
        onSuccess: async () => {
          console.log("✅ 사진 업로드 성공");
          // 업로드 성공 시 메모리 정리
          await cleanupImage();
          // refetchQueries 완료 대기 후 바로 닫기 (Alert 없이)
          await new Promise(resolve => setTimeout(resolve, 200));
          onSuccess?.();
          onClose();
        },
        onError: async (error: any) => {
          console.error("Upload error:", error);
          console.error("Error response:", error?.response);
          console.error("Error data:", error?.response?.data);
          console.error("Error config:", error?.config);
          const message = getSafeErrorMessage(
            error,
            "사진 업로드에 실패했습니다."
          );
          Alert.alert("오류", message);
          // 에러 시에도 메모리 정리
          await cleanupImage();
        },
      }
    );
  };

  const handleClose = useCallback(async () => {
    console.log("🔴 ImageUploadModal 닫기 - 이미지 메모리 정리");
    await cleanupImage();
    onClose();
  }, [onClose]);

  if (!visible) return null;

  return (
    <BottomSheet
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onClose={handleClose}
      backgroundStyle={styles.container}
      handleIndicatorStyle={styles.handleIndicator}
      enableDynamicSizing={false}
      index={0}
      backdropComponent={({ style }) => (
        <Pressable style={style} onPress={handleClose} />
      )}
    >
      <BottomSheetView
        style={[
          styles.modalContent,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>사진 추가</Text>
          <Pressable onPress={handleClose}>
            <Text style={styles.closeButton}>×</Text>
          </Pressable>
        </View>

        {/* 컨텐츠 */}
        <View style={styles.content}>
          {selectedImage ? (
            <View className="mb-4">
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-64 rounded-lg"
                resizeMode="contain"
                fadeDuration={0}
                onError={() => {
                  console.log("⚠️ 이미지 로드 에러");
                }}
              />
              <Pressable
                className="mt-2 items-center"
                onPress={async () => {
                  console.log("🔄 다시 선택 - 이미지 메모리 정리");
                  await cleanupImage();
                }}
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
                  <Text className="text-gray-700 text-sm font-medium mt-3">
                    갤러리
                  </Text>
                </Pressable>

                {/* 카메라 버튼 */}
                <Pressable
                  onPress={takePhoto}
                  disabled={isCameraLoading}
                  className="bg-gray-100 rounded-xl items-center justify-center"
                  style={{
                    width: 140,
                    height: 140,
                    opacity: isCameraLoading ? 0.5 : 1,
                  }}
                >
                  {isCameraLoading ? (
                    <ActivityIndicator size="large" color="#666" />
                  ) : (
                    <Icon name="camera" width={48} height={48} color="#666" />
                  )}
                  <Text className="text-gray-700 text-sm font-medium mt-3">
                    {isCameraLoading ? "카메라 실행 중..." : "카메라"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {selectedImage && (
            <View className="gap-2 mt-4">
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
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  handleIndicator: {
    backgroundColor: "#d1d5db",
    width: 40,
    height: 4,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 32,
    color: "#9ca3af",
    width: 32,
    height: 32,
    textAlign: "center",
    lineHeight: 32,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
