import { View, Text, TouchableOpacity } from 'react-native';
import Icon from '@/components/Icon';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { CafeteriaLikeParams } from '@/api/cafeteria/types';
import { useCafeteriaLike, useToggleCafeteriaLike } from '@/api/cafeteria/useCafeteria';
import { useAuth } from '@/api/auth/useAuth';

interface CafeteriaLikeProps {
  like: number;
  meal_id: number;
  onShowLogin?: () => void;
}

export default function CafeteriaLikeButton({
  like,
  meal_id,
  onShowLogin,
}: CafeteriaLikeProps) {
  const queryClient = useQueryClient();
  const { mutate: toggleLike, isPending } = useToggleCafeteriaLike();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const cafeteriaLikeParams: CafeteriaLikeParams = { meal_id };

  // 로그인한 경우에만 좋아요 상태 조회
  const { data, isLoading: isDataLoading } = useCafeteriaLike(cafeteriaLikeParams);

  // 로그인 상태와 서버 데이터에 따라 좋아요 상태 결정
  // 로그인 안됨 또는 데이터 없음 = 좋아요 안한 상태
  const isLiked = isAuthenticated && !!data && data.user_reaction === 'like';

  // 좋아요 수: 로그인했고 서버 데이터가 있으면 서버 값, 아니면 props 초기값
  const likeCount = isAuthenticated && typeof data?.like_count === 'number'
    ? data.like_count
    : like;

  const handlePress = () => {
    // 로그인 안되어 있으면 로그인 창만 띄우고 아무것도 안함
    if (!isAuthLoading && !isAuthenticated) {
      onShowLogin?.();
      return;
    }

    if (isPending) return;

    toggleLike(
      { meal_id },
      {
        onSuccess: () => {
          // 좋아요 상태 쿼리 무효화
          queryClient.invalidateQueries({
            queryKey: ['cafeteriaLike', meal_id],
          });
          // 메인 학식 메뉴 쿼리도 무효화하여 좋아요 수 업데이트
          queryClient.invalidateQueries({
            queryKey: ['cafeteriaMenu'],
          });
        },
        onError: (err) => {
          console.error('toggle like error', err?.response?.data);
          if (err?.response?.status === 403) {
            onShowLogin?.();
          }
        },
      },
    );
  };

  return (
    <View className="items-center justify-center -mb-2">
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={isPending || isDataLoading}
        className="flex-row items-center rounded-3xl border-2 border-[#3B82F6] bg-white px-3 py-1"
      >
        <Icon
          name={isLiked ? 'goodFilled' : 'good'}
          size={15}
          color="#3B82F6"
        />

        <View className="w-8 items-end pr-[10px] ml-2">
          <Text className="text-[#3B82F6] font-semibold text-base">
            {likeCount}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
