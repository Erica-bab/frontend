import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useGoogleLogin } from '@/api/auth/useAuth';
import { useQueryClient } from '@tanstack/react-query';

// 웹 브라우저 세션 완료 처리
WebBrowser.maybeCompleteAuthSession();

// 환경변수에서 클라이언트 ID 가져오기
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

export const useGoogleSignIn = (onSuccess?: (user?: any) => void) => {
  const { mutate: googleLogin, isPending, isError, error } = useGoogleLogin();
  const queryClient = useQueryClient();
  const isProcessing = useRef(false);

  // 플랫폼별 scheme 사용
  const redirectUri = Platform.OS === 'ios'
    ? makeRedirectUri({
        scheme: 'com.googleusercontent.apps.1041029378289-puugfhcoucnpvmi8bk8k2a5uapiaak38',
      })
    : undefined; // Android는 자동으로 package name 사용

  console.log('Google OAuth redirectUri:', redirectUri);
  console.log('Platform:', Platform.OS);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    // 이미 처리 중이면 무시
    if (isProcessing.current) {
      console.log('Already processing, skipping...');
      return;
    }
    if (!response) return;

    console.log('OAuth response type:', response.type);

    // 에러 처리
    if (response.type === 'error') {
      console.error('OAuth error:', response.error);
      return;
    }

    // 사용자 취소
    if (response.type === 'dismiss' || response.type === 'cancel') {
      console.log('OAuth cancelled by user');
      return;
    }

    // 성공 처리
    if (response.type === 'success') {
      console.log('OAuth success, params:', response.params);

      // 처리 중 플래그 설정
      isProcessing.current = true;

      // iOS, Android, Web 모두 ID Token 사용
      const { id_token } = response.params;
      if (id_token) {
        console.log('Sending id_token to backend (platform:', Platform.OS + ')');
        googleLogin(
          { id_token },
          {
            onSuccess: (data) => {
              console.log('Backend login success');
              // 사용자 정보를 콜백으로 전달
              onSuccess?.(data.user);
              isProcessing.current = false;
            },
            onError: (error: any) => {
              console.error('Backend login failed:', error);
              console.error('Error details:', {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status,
              });
              isProcessing.current = false;
            },
          }
        );
      } else {
        console.error('No id_token in response:', response.params);
        isProcessing.current = false;
      }
    }
  }, [response]);

  const signIn = async () => {
    if (!request) {
      console.warn('Google Sign-In request not ready. Check your client IDs.');
      return;
    }
    await promptAsync();
  };

  return {
    signIn,
    isLoading: isPending,
    isReady: !!request,
    isError,
    error,
  };
};
