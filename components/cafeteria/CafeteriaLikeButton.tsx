import { View, Text, TouchableOpacity } from 'react-native';
import Icon from '@/components/Icon';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { CafeteriaLikeParams } from '@/api/cafeteria/types';
import { useCafeteriaLike, useToggleCafeteriaLike } from '@/api/cafeteria/useCafeteria';
import { useAuth } from '@/api/auth/useAuth';

interface CafeteriaLikeProps {
  like: number;
  meal_id: number;
  auth?: boolean;          // 지금은 안 쓰고 있음
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

  const { data, isLoading: isDataLoading } = useCafeteriaLike(cafeteriaLikeParams);
  const [isInitialized, setIsInitialized] = useState(false);


  const isLiked =
    !!isAuthenticated && data?.user_reaction === 'like';

  const likeCount =
    typeof data?.like_count === 'number'
      ? data.like_count
      : like;

  const handlePress = () => {
    if (!isAuthenticated && !isAuthLoading) {
      onShowLogin?.();
      return;
    }

    if (isPending) return;

    toggleLike(
      { meal_id },
      {
        onSuccess: (res) => {
          console.log('toggleLike API response:', res);

          queryClient.invalidateQueries({
            queryKey: ['cafeteriaLike', meal_id],
          });
        },
        onError: (err) => {
          console.log('toggle like error', err?.response?.data);
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
