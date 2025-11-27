import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useAppleLogin } from '@/api/auth/useAuth';
import { useQueryClient } from '@tanstack/react-query';

export const useAppleSignIn = (onSuccess?: (user?: any) => void) => {
  const { mutate: appleLogin, isPending, isError, error } = useAppleLogin();
  const queryClient = useQueryClient();
  const isProcessing = useRef(false);

  const signIn = async () => {
    // Apple Sign In은 iOS에서만 작동
    if (Platform.OS !== 'ios') {
      console.warn('Apple Sign In is only available on iOS');
      return;
    }

    // 이미 처리 중이면 무시
    if (isProcessing.current) {
      console.log('Already processing, skipping...');
      return;
    }

    try {
      isProcessing.current = true;

      // Apple Sign In 인증 시도
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('Apple Sign In success:', credential);

      // identityToken이 있는지 확인
      if (credential.identityToken) {
        const requestData: any = {
          identity_token: credential.identityToken,
        };

        // 사용자 정보가 있으면 추가 (첫 로그인 시에만 제공됨)
        if (credential.email || credential.fullName) {
          requestData.user = {
            email: credential.email || '',
            name: credential.fullName ? {
              firstName: credential.fullName.givenName || '',
              lastName: credential.fullName.familyName || '',
            } : undefined,
          };
        }

        console.log('Sending Apple credential to backend');
        appleLogin(requestData, {
          onSuccess: (data) => {
            console.log('Backend login success');
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
        });
      } else {
        console.error('No identityToken in Apple credential');
        isProcessing.current = false;
      }
    } catch (error: any) {
      console.error('Apple Sign In failed:', error);
      if (error.code === 'ERR_REQUEST_CANCELED') {
        console.log('User cancelled Apple Sign In');
      }
      isProcessing.current = false;
    }
  };

  return {
    signIn,
    isLoading: isPending,
    isAvailable: Platform.OS === 'ios',
    isError,
    error,
  };
};
