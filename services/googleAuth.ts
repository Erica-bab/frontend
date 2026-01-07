import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useGoogleLogin, notifyAuthStateChange } from '@/api/auth/useAuth';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

export const useGoogleSignIn = (onSuccess?: (user?: any) => void) => {
  const { mutate: googleLogin, isPending, isError, error } = useGoogleLogin();
  const isProcessing = useRef(false);

  const redirectUri = makeRedirectUri({
    scheme: "com.efoo.app"
  });

  console.log('Google OAuth redirectUri:', redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    redirectUri, 
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (!response) {
      console.log('📭 No response yet');
      return;
    }

    console.log('📨 Response received:', response.type);

    // response가 새로운 객체일 때는 이전 처리 상태를 무시하고 새로 시작
    if (response.type === 'error') {
      console.error('OAuth error:', response.error);
      isProcessing.current = false;
      return;
    }

    if (response.type === 'dismiss' || response.type === 'cancel') {
      console.log('🚫 User dismissed or cancelled');
      // Android에서는 로그인 성공 후에도 dismiss가 올 수 있으므로
      // params에 id_token이 있으면 success로 처리
      const params = (response as any).params;
      if (params?.id_token) {
        console.log('✨ Dismiss but has id_token, treating as success');
        // success 처리로 fallthrough
      } else {
        isProcessing.current = false;
        return;
      }
    }

    if (response.type === 'success') {
      // 이미 처리 중인 동일한 response는 skip
      if (isProcessing.current) {
        console.log('⏭️ Already processing this response, skipping...');
        return;
      }

      console.log('🔄 Starting to process success response');
      isProcessing.current = true;
      const { id_token } = response.params;
      console.log('🎫 id_token extracted:', !!id_token);

      console.log('=== Google OAuth Debug ===');
      console.log('Platform:', Platform.OS);
      console.log('id_token exists:', !!id_token);
      console.log('id_token (first 50 chars):', id_token?.substring(0, 50));
      console.log('Android Client ID:', GOOGLE_ANDROID_CLIENT_ID);
      console.log('Web Client ID:', GOOGLE_WEB_CLIENT_ID);
      console.log('redirectUri:', redirectUri);

      // id_token 디코딩해서 aud 확인
      if (id_token) {
        try {
          const base64Payload = id_token.split('.')[1];
          const payload = JSON.parse(atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/')));
          console.log('🔍 id_token payload:');
          console.log('  - aud (audience):', payload.aud);
          console.log('  - iss (issuer):', payload.iss);
          console.log('  - email:', payload.email);
        } catch (e) {
          console.error('Failed to decode id_token:', e);
        }
      }

      console.log('========================');

      if (id_token) {
        googleLogin(
          { id_token },
          {
            onSuccess: (data) => {
              console.log('✅ Backend login success');
              notifyAuthStateChange(); // 전역 auth state 업데이트
              onSuccess?.(data.user);
              isProcessing.current = false;
            },
            onError: (error: any) => {
              console.error('❌ Backend login failed');
              console.error('Error message:', error?.message);
              console.error('Error response:', error?.response?.data);
              console.error('Error status:', error?.response?.status);
              console.error('Request URL:', error?.config?.url);
              console.error('Request data:', error?.config?.data);

              if (error?.response?.data) {
                console.error('Backend error details:', JSON.stringify(error.response.data, null, 2));
              }

              isProcessing.current = false;
            },
          }
        );
      } else {
        console.error('No id_token in response:', response.params);
        isProcessing.current = false;
      }
    }
  }, [response, googleLogin, onSuccess]);

  const signIn = async () => {
    if (!request) {
      console.log('❌ Request not ready yet');
      return;
    }
    console.log('🚀 Calling promptAsync...');

    try {
      const result = await Promise.race([
        promptAsync(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('promptAsync timeout after 30s')), 30000)
        )
      ]);
      console.log('📬 promptAsync result:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('❌ promptAsync error:', error);
    }
  };

  return {
    signIn,
    isLoading: isPending,
    isReady: !!request,
    isError,
    error,
  };
};
