import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import * as FileSystem from 'expo-file-system/legacy';

export interface ImageInfo {
  id: number;
  image_url: string;
  display_order: number;
  is_verified: boolean;
  uploaded_at: string;
  uploaded_by_type?: string | null;
  uploaded_by?: number | null;
}

export interface ImageListResponse {
  restaurant_id?: number;
  menu_id?: number;
  images: ImageInfo[];
  total_count: number;
}

export interface ImageUploadResponse {
  id: number;
  restaurant_id: number;
  image_url: string;
  display_order: number;
  uploaded_at: string;
}

export interface ImageDeleteResponse {
  id: number;
  deleted_at: string;
  message: string;
}

// 식당 이미지 목록 조회
export const useRestaurantImages = (restaurantId: number) => {
  return useQuery<ImageListResponse>({
    queryKey: ['restaurant', restaurantId, 'images'],
    queryFn: async () => {
      const { data } = await apiClient.get<ImageListResponse>(`/restaurants/${restaurantId}/images`);
      return data;
    },
    enabled: !!restaurantId,
  });
};

// 식당 이미지 업로드
export const useUploadRestaurantImage = (restaurantId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageUri, displayOrder = 0 }: { imageUri: string; displayOrder?: number }) => {
      // FormData 생성
      const formData = new FormData();
      
      // 파일 정보 가져오기
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('이미지 파일을 찾을 수 없습니다.');
      }

      // 파일명 추출 (URI에서 마지막 부분)
      const uriParts = imageUri.split('/');
      const filename = uriParts[uriParts.length - 1] || 'image.jpg';
      
      // 확장자 추출 및 MIME 타입 결정
      const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeTypeMap: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
      };
      const type = mimeTypeMap[extension] || 'image/jpeg';

      // React Native FormData 형식으로 파일 추가
      formData.append('image', {
        uri: imageUri,
        type: type,
        name: filename,
      } as any);

      // display_order 추가
      formData.append('display_order', String(displayOrder));

      // 개발 환경에서만 로그 출력
      if (__DEV__) {
      console.log('Upload FormData:', {
        imageUri,
        filename,
        type,
        displayOrder,
      });
      }

      // multipart/form-data로 업로드
      // interceptor에서 FormData인 경우 Content-Type을 자동으로 제거하므로 여기서는 설정하지 않음
      const { data } = await apiClient.post<ImageUploadResponse>(
        `/restaurants/${restaurantId}/images`,
        formData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId, 'images'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};

// 식당 이미지 삭제
export const useDeleteRestaurantImage = (restaurantId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId: number) => {
      const { data } = await apiClient.delete<ImageDeleteResponse>(
        `/restaurants/${restaurantId}/images/${imageId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId, 'images'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};

