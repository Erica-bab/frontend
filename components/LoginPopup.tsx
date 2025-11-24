import { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGoogleSignIn } from '@/services/googleAuth';

interface LoginPopupProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginPopup({ visible, onClose, onLoginSuccess }: LoginPopupProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { signIn, isLoading, isReady } = useGoogleSignIn(() => {
    onClose();
    onLoginSuccess?.();
  });

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleGoogleLogin = async () => {
    await signIn();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View className="flex-1">
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="absolute inset-0 bg-black/50"
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        {/* 바텀시트 */}
        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
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
              disabled={!isReady || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text className="text-black text-center font-semibold text-lg">
                  Google 계정으로 로그인
                </Text>
              )}
            </Pressable>

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
      </View>
    </Modal>
  );
}
