import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../client';
import {
  AuthConfig,
  GoogleLoginRequest,
  AuthResponse,
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

  const refreshAuthState = useCallback(() => {
    checkAuth();
  }, [checkAuth]);

  return { isAuthenticated, isLoading, refreshAuthState };
};

// Auth Config 조회 (Google Client ID 등)
export const useAuthConfig = () => {
  return useQuery({
    queryKey: ['authConfig'],
    queryFn: async () => {
      const { data } = await apiClient.get<AuthConfig>('/auth/config');
      return data;
    },
    staleTime: Infinity, // 앱 실행 중 캐시 유지
  });
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

// 로그아웃
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/auth/logout');
      return data;
    },
    onSuccess: async () => {
      // 토큰 삭제
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      // 캐시 초기화
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
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await apiClient.get<User>('/auth/me');
      return data;
    },
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
