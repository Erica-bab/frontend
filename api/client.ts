import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

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

        // 디버깅: 요청 로그
        console.log('API Request:', {
            url: config.url,
            method: config.method,
            data: config.data,
        });

        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);


apiClient.interceptors.response.use(
    (response: any) => {
        // 디버깅: 응답 로그
        console.log('API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data,
        });
        return response;
    },
    async (error: any) => {
        // 디버깅: 에러 로그
        console.error('API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
        });
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refreshToken');

                if (!refreshToken) {
                    // refresh token이 없으면 로그인 페이지로
                    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
                    throw error;
                }

                const response = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    { refreshToken },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;


                await AsyncStorage.multiSet([
                    ['accessToken', newAccessToken],
                    ['refreshToken', newRefreshToken],
                ]);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;


                return apiClient(originalRequest);
            } catch (refreshError) {
                await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
