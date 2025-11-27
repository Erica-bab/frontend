import { useEffect, useCallback } from 'react';
import { View, Text, Pressable, Dimensions, Modal, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useGoogleSignIn } from '@/services/googleAuth';
import { useAppleSignIn } from '@/services/appleAuth';

interface LoginPopupProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = 100; // 100px 이상 내리면 닫힘

export default function LoginPopup({ visible, onClose, onLoginSuccess }: LoginPopupProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const context = useSharedValue({ y: 0 });

  const handleAuthSuccess = (user?: any) => {
    onClose();

    // 사용자 정보가 없거나 requires_setup이 true이면 AddInfo 화면으로 이동
    if (user && (user.requires_setup || !user.student_year || !user.college)) {
      navigation.navigate('AddInfo' as never);
    }

    onLoginSuccess?.();
  };

  const { signIn: googleSignIn, isLoading: isGoogleLoading, isReady: isGoogleReady, isError: isGoogleError, error: googleError } = useGoogleSignIn(handleAuthSuccess);
  const { signIn: appleSignIn, isLoading: isAppleLoading, isAvailable: isAppleAvailable, isError: isAppleError, error: appleError } = useAppleSignIn(handleAuthSuccess);

  const isLoading = isGoogleLoading || isAppleLoading;
  const isError = isGoogleError || isAppleError;
  const error = googleError || appleError;

  const handleClose = useCallback(() => {
    translateY.value = SCREEN_HEIGHT;
    onClose();
  }, [onClose, translateY]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      // 아래로만 드래그 가능
      const newValue = event.translationY + context.value.y;
      translateY.value = Math.max(newValue, 0);
    })
    .onEnd(() => {
      // 아래로 일정 이상 내리면 닫기
      if (translateY.value > DISMISS_THRESHOLD) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 }, (finished) => {
          if (finished) {
            handleClose();
          }
        });
      } else {
        // 기본 위치로 스냅
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
    }
  }, [visible, translateY]);

  const handleGoogleLogin = async () => {
    await googleSignIn();
  };

  const handleAppleLogin = async () => {
    await appleSignIn();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View className="flex-1">
        <View className="absolute inset-0 bg-black/50">
          <Pressable className="flex-1" onPress={onClose} />
        </View>

        {/* 바텀시트 */}
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[animatedStyle]}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl"
          >
            {/* 핸들바 */}
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1 bg-gray-300 rounded-full" />
            </View>

          <View className="px-6 py-4" style={{ paddingBottom: insets.bottom + 16 }}>
            <Text className="text-xl font-bold mb-2">
              EFOO에 로그인
            </Text>
            <Text className="text-gray-500 mb-6">
              식당 저장, 리뷰, 메뉴수정은 로그인 후 이용가능해요.
            </Text>

            <Pressable
              className="rounded-xl py-4 mb-3 border border-gray-300 flex-row justify-center items-center"
              onPress={handleGoogleLogin}
              disabled={!isGoogleReady || isLoading}
            >
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text className="text-black text-center font-semibold text-lg">
                  Google 계정으로 로그인
                </Text>
              )}
            </Pressable>

            {/* Apple Sign In Button - iOS only */}
            {isAppleAvailable && Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={12}
                style={{ width: '100%', height: 56, marginBottom: 12 }}
                onPress={handleAppleLogin}
              />
            )}

            {isError && (
              <View className="mb-3 p-3 bg-red-50 rounded-lg">
                <Text className="text-red-600 text-sm text-center">
                  로그인에 실패했습니다. 다시 시도해주세요.
                </Text>
                {error && (
                  <Text className="text-red-500 text-xs text-center mt-1">
                    {String(error)}
                  </Text>
                )}
              </View>
            )}

            <Pressable
              className="py-4 bg-black rounded-xl"
              onPress={onClose}
            >
              <Text className="text-white text-center">
                계정없이 둘러보기
              </Text>
            </Pressable>
          </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}
