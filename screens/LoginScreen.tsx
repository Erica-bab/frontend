import { useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useGoogleSignIn } from '@/services/googleAuth';
import { useAppleSignIn } from '@/services/appleAuth';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { onSuccess } = route.params as { onSuccess?: () => void } || {};

  const snapPoints = useMemo(() => ['45%'], []);

  const handleAuthSuccess = (user?: any) => {
    navigation.goBack();

    // requires_setup이 true이면 AddInfo 화면으로 이동
    if (user?.requires_setup === true) {
      navigation.navigate('AddInfo' as never);
    }

    onSuccess?.();
  };

  const { signIn: googleSignIn, isLoading: isGoogleLoading, isReady: isGoogleReady, isError: isGoogleError, error: googleError } = useGoogleSignIn(handleAuthSuccess);
  const { signIn: appleSignIn, isLoading: isAppleLoading, isAvailable: isAppleAvailable, isError: isAppleError, error: appleError } = useAppleSignIn(handleAuthSuccess);

  const isLoading = isGoogleLoading || isAppleLoading;
  const isError = isGoogleError || isAppleError;
  const error = googleError || appleError;

  const handleGoogleLogin = async () => {
    await googleSignIn();
  };

  const handleAppleLogin = async () => {
    await appleSignIn();
  };

  const handleClose = () => {
    navigation.goBack();
  };

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
        <Pressable
          onPress={handleClose}
        />
      )}
    >
      <BottomSheetView style={[styles.modalContent, { paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Text style={styles.title}>EFOO에 로그인</Text>
          <Pressable onPress={handleClose}>
            <Text style={styles.closeButton}>×</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>
            식당 저장, 리뷰, 메뉴수정은 로그인 후 이용가능해요.
          </Text>

          <Pressable
            style={[styles.button, styles.googleButton, (!isGoogleReady || isLoading) && styles.buttonDisabled]}
            onPress={handleGoogleLogin}
            disabled={!isGoogleReady || isLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={[styles.buttonText, styles.googleButtonText]}>
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
              style={styles.appleButton}
              onPress={handleAppleLogin}
            />
          )}

          {isError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                로그인에 실패했습니다. 다시 시도해주세요.
              </Text>
              {error && (
                <Text style={styles.errorDetail}>
                  {String(error)}
                </Text>
              )}
            </View>
          )}

          <Pressable
            style={[styles.button, styles.buttonSmall, styles.closeButtonAlt]}
            onPress={handleClose}
          >
            <Text style={styles.closeButtonText}>
              계정 없이 둘러보기
            </Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  handleIndicator: {
    backgroundColor: '#d1d5db',
    width: 40,
    height: 4,
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 32,
    color: '#9ca3af',
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    minHeight: 56,
  },
  buttonSmall: {
    minHeight: 48,
    paddingVertical: 12,
  },
  googleButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  googleButtonText: {
    color: '#000',
  },
  appleButton: {
    width: '100%',
    height: 56,
    marginBottom: 12,
  },
  closeButtonAlt: {
    backgroundColor: 'transparent',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  closeButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '400',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  errorDetail: {
    color: '#ef4444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
