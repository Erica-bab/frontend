import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useGoogleLogin } from '@/api/auth/useAuth';
import { useQueryClient } from '@tanstack/react-query';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

export const useGoogleSignIn = (onSuccess?: (user?: any) => void) => {
  const { mutate: googleLogin, isPending, isError, error } = useGoogleLogin();
  const queryClient = useQueryClient();
  const isProcessing = useRef(false);

  const redirectUri = makeRedirectUri({
    scheme:
      Platform.OS === 'ios'
        ? `com.googleusercontent.apps.${GOOGLE_IOS_CLIENT_ID?.split('.apps.googleusercontent.com')[0]}`
        : `com.googleusercontent.apps.${GOOGLE_ANDROID_CLIENT_ID?.split('.apps.googleusercontent.com')[0]}`,
  });

  console.log('Google OAuth redirectUri:', redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri, 
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (isProcessing.current) return;
    if (!response) return;

    if (response.type === 'error') {
      console.error('OAuth error:', response.error);
      return;
    }

    if (response.type === 'dismiss' || response.type === 'cancel') {
      return;
    }

    if (response.type === 'success') {
      isProcessing.current = true;
      const { id_token } = response.params;

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
  }, [response]);

  const signIn = async () => {
    if (!request) return;
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
