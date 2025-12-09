import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

// 로그아웃 이벤트 리스너들
const logoutListeners: (() => void)[] = [];

export const onAuthError = (callback: () => void) => {
  logoutListeners.push(callback);
  return () => {
    const index = logoutListeners.indexOf(callback);
    if (index > -1) logoutListeners.splice(index, 1);
  };
};

const notifyAuthError = () => {
  logoutListeners.forEach(listener => listener());
};

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});
    

apiClient.interceptors.request.use(
    async (config: any) => {
        const accessToken = await AsyncStorage.getItem('accessToken');

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // FormData인 경우 특별 처리
        if (config.data instanceof FormData) {
            // React Native에서는 Content-Type을 명시적으로 설정하지 않아야 함
            // XMLHttpRequest가 자동으로 multipart/form-data와 boundary를 설정함
            // transformRequest에서 Content-Type 헤더 제거
            config.transformRequest = [(data: any, headers: any) => {
                // 헤더에서 Content-Type 제거 (대소문자 구분 없이)
                if (headers) {
                    delete headers['Content-Type'];
                    delete headers['content-type'];
                }
                // FormData는 그대로 반환
                return data;
            }];
        }

        // 개발 환경에서만 요청 로그 출력
        if (__DEV__) {
        console.log('API Request:', {
            url: config.url,
            method: config.method,
            data: config.data instanceof FormData ? '[FormData]' : config.data,
            headers: config.headers,
        });
        }

        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);


apiClient.interceptors.response.use(
    (response: any) => {
        // 개발 환경에서만 응답 로그 출력
        if (__DEV__) {
        console.log('API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data,
        });
        }
        return response;
    },
    async (error: any) => {
        // 개발 환경에서만 에러 로그 출력 (에러는 항상 로깅하는 것이 좋지만, 프로덕션에서는 간소화)
        if (__DEV__) {
        console.error('API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
        });
        }
        const originalRequest = error.config;
        // 401 에러이고, refresh 엔드포인트가 아니고, 아직 재시도하지 않은 경우
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refreshToken');

                if (!refreshToken) {
                    // refresh token이 없으면 토큰 삭제
                    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
                    throw error;
                }

                // 백엔드는 Authorization 헤더로 refreshToken을 받음
                const response = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${refreshToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                const { access_token: newAccessToken, refresh_token: newRefreshToken } = response.data;

                // 새 access token 저장
                await AsyncStorage.setItem('accessToken', newAccessToken);
                
                // 새 refresh token이 있으면 업데이트, 없으면 기존 것 유지
                if (newRefreshToken) {
                    await AsyncStorage.setItem('refreshToken', newRefreshToken);
                }

                // 원래 요청에 새 access token 설정
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // 원래 요청 재시도
                return apiClient(originalRequest);
            } catch (refreshError) {
                // 리프레시 실패 시 토큰 삭제
                await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
                // 인증 에러 알림 (로그아웃 처리)
                notifyAuthError();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
