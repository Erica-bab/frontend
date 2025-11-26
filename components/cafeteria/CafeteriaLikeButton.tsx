import { View, Text, TouchableOpacity } from 'react-native';
import Icon from '@/components/Icon';
import React, { useState, useEffect } from 'react';
import LoginPopup from '@/components/LoginPopup';

import { CafeteriaLikeParams, } from '@/api/cafeteria/types';
import { useCafeteriaLike, useToggleCafeteriaLike, } from '@/api/cafeteria/useCafeteria';

interface CafeteriaLikeProps {
  like: number,
  meal_id: number
  auth: boolean,
}

export default function CafeteriaLikeButton({ like, meal_id, auth, }: CafeteriaLikeProps) {
  const [loginVisible, setLoginVisible] = useState(false);
  const { mutate: toggleLike, isPending } = useToggleCafeteriaLike();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(like);

  const cafeteriaLikeParams: CafeteriaLikeParams = {
    meal_id: meal_id,
  };
  
  const { data, isLoading, error } = useCafeteriaLike(cafeteriaLikeParams);

  useEffect(() => {
    if (!data) return;
    const liked = data.user_reaction === 'like';
    setIsLiked(liked);

    if (typeof data.like_count === 'number') {
      setLikeCount(data.like_count);
    }
  }, [data]);

  const handlePress = () => {
    if (!auth) {
      setLoginVisible(true);
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
          name={isLiked ? 'good' : 'filledgood'}
          size={15}
          color="#3B82F6"
        />

        <View className="w-8 items-end pr-[10px] ml-2">
          <Text className="text-[#3B82F6] font-semibold text-base">
            {likeCount}
          </Text>
        </View>
      </TouchableOpacity>

      <LoginPopup visible={loginVisible} onClose={() => setLoginVisible(false)} />
    </View>
  );
}