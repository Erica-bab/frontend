import { View, Text, TouchableOpacity } from 'react-native';
import Icon from '@/components/Icon';
import React, { useState, useEffect } from 'react';

import { CafeteriaLikeParams, } from '@/api/cafeteria/types';
import { useCafeteriaLike, useToggleCafeteriaLike, } from '@/api/cafeteria/useCafeteria';
import { useAuth } from '@/api/auth/useAuth';

interface CafeteriaLikeProps {
  like: number,
  meal_id: number
  auth?: boolean,
  onShowLogin?: () => void;
}

export default function CafeteriaLikeButton({ like, meal_id, auth, onShowLogin }: CafeteriaLikeProps) {
  const { mutate: toggleLike, isPending } = useToggleCafeteriaLike();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(like);

  console.log('CafeteriaLikeButton debug:', {
    isAuthenticated,
    isAuthLoading,
    isLiked,
    likeCount,
    meal_id
  });

  // 로그아웃 시 로컬 상태 리셋
  useEffect(() => {
    if (!isAuthenticated && !isAuthLoading) {
      setIsLiked(false);
      setLikeCount(like);
    }
  }, [isAuthenticated, isAuthLoading, like]);

  const cafeteriaLikeParams: CafeteriaLikeParams = {
    meal_id: meal_id,
  };

  const { data, isLoading: isDataLoading } = useCafeteriaLike(cafeteriaLikeParams);

  useEffect(() => {
    console.log('useCafeteriaLike data changed:', { data, isDataLoading, isAuthenticated });
    if (!data) return;
    const liked = data.user_reaction === 'like';
    console.log('Setting isLiked to:', liked, 'based on data.user_reaction:', data.user_reaction);
    setIsLiked(liked);

    if (typeof data.like_count === 'number') {
      setLikeCount(data.like_count);
    }
  }, [data, isAuthenticated]);

  const handlePress = () => {
    if (!isAuthenticated && !isAuthLoading) {
      onShowLogin?.();
      return;
    }

    if (isPending) return; // 중복 클릭 방지

    toggleLike(
      { meal_id },
      {
        onSuccess: res => {
          const nextLiked = res.is_like;
          setIsLiked(nextLiked);

          if (typeof res.like_count === 'number') {
            setLikeCount(res.like_count);
          } else {
            setLikeCount(prev => prev + (nextLiked ? 1 : -1));
          }
        },
        onError: err => {
          console.log('toggle like error', err?.response?.data);
          // 403 에러 시 로그인 팝업 표시
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
        disabled={isPending}
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