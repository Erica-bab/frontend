import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useEffect } from 'react';
import { useGoogleLogin } from '@/api/auth/useAuth';

// 웹 브라우저 세션 완료 처리
WebBrowser.maybeCompleteAuthSession();

// 환경변수에서 클라이언트 ID 가져오기
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

export const useGoogleSignIn = (onSuccess?: () => void) => {
  const { mutate: googleLogin, isPending, isError, error } = useGoogleLogin();

  const redirectUri = makeRedirectUri({
    scheme: 'com.efoo.front',
    path: 'redirect',
  });

  console.log('Google OAuth redirectUri:', redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID || GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || GOOGLE_WEB_CLIENT_ID,
    redirectUri,
    responseType: 'id_token',
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        googleLogin(
          { id_token },
          {
            onSuccess: () => {
              onSuccess?.();
            },
          }
        );
      }
    }
  }, [response, googleLogin, onSuccess]);

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
