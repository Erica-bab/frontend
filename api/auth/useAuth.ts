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

// 인증 상태 확인 훅
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      setIsAuthenticated(!!accessToken);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
