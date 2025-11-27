import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, onAuthError } from '../client';
import {
  GoogleLoginRequest,
  AppleLoginRequest,
  AuthResponse,
  TokenResponse,
  User,
  UpdateUserRequest,
} from './types';

// 전역 상태 변경 알림을 위한 간단한 구현
let authUpdateCallbacks: (() => void)[] = [];

// 로그인 성공 시 호출될 함수
export const notifyAuthStateChange = () => {
  authUpdateCallbacks.forEach(callback => {
    try {
      callback();
    } catch (error) {
      console.error('Auth callback error:', error);
    }
  });
};

// 인증 상태 확인 훅
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updateKey, setUpdateKey] = useState(0);

  const checkAuth = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const authState = !!accessToken;
      setIsAuthenticated(authState);
      return authState;
    } catch {
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 인증 상태 변경 감지를 위한 callback
  const authStateChangeCallback = useCallback(() => {
    console.log('Auth state change callback triggered');
    // 즉시 상태를 갱신 (딜레이 제거)
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 인증 상태 변경 callback 등록/해제
  useEffect(() => {
    authUpdateCallbacks.push(authStateChangeCallback);
    return () => {
      authUpdateCallbacks = authUpdateCallbacks.filter(cb => cb !== authStateChangeCallback);
    };
  }, [authStateChangeCallback]);

  // 인증 에러 발생 시 자동으로 로그아웃 처리
  useEffect(() => {
    const unsubscribe = onAuthError(() => {
      setIsAuthenticated(false);
    });
    return unsubscribe;
  }, []);

  const refreshAuthState = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  return { isAuthenticated, isLoading, refreshAuthState };
};

// Google 로그인
export const useGoogleLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: GoogleLoginRequest) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/google', request);
      return data;
    },
    onSuccess: async (data) => {
      // 토큰 저장
      await AsyncStorage.multiSet([
        ['accessToken', data.access_token],
        ['refreshToken', data.refresh_token],
      ]);
      // 사용자 정보 캐시
      queryClient.setQueryData(['currentUser'], data.user);
      // 모든 useAuth 훅에 알림
      notifyAuthStateChange();
    },
  });
};

// Apple 로그인
export const useAppleLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: AppleLoginRequest) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/apple', request);
      return data;
    },
    onSuccess: async (data) => {
      // 토큰 저장
      await AsyncStorage.multiSet([
        ['accessToken', data.access_token],
        ['refreshToken', data.refresh_token],
      ]);
      // 사용자 정보 캐시
      queryClient.setQueryData(['currentUser'], data.user);
      // 모든 useAuth 훅에 알림
      notifyAuthStateChange();
    },
  });
};

// 로그아웃
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // 서버에 로그아웃 요청
      await apiClient.post('/auth/logout');
    },
    onSuccess: async () => {
      // 토큰 삭제 및 캐시 초기화
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      queryClient.clear();
    },
    onError: async () => {
      // 에러가 발생해도 로컬 토큰은 삭제
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      queryClient.clear();
    },
  });
};

// 현재 사용자 정보 조회
export const useCurrentUser = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await apiClient.get<User>('/auth/me');
      return data;
    },
    enabled: isAuthenticated === true, // 로그인된 경우에만 API 호출
    retry: false,
  });
};

// 사용자 정보 수정
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateUserRequest) => {
      const { data } = await apiClient.put<User>('/auth/me', request);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data);
    },
  });
};

// Access Token 갱신
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<TokenResponse>('/auth/refresh');
      return data;
    },
    onSuccess: async (data) => {
      await AsyncStorage.setItem('accessToken', data.access_token);
    },
  });
};
