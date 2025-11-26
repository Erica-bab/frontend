import { View, Pressable } from 'react-native';
import Icon from '@/components/Icon';

interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
  isLoading?: boolean;
}

export default function StarRating({ rating, onRate, isLoading }: StarRatingProps) {
  return (
    <View className="flex-row gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onRate(star)} disabled={isLoading}>
          <Icon
            name="star"
            size={32}
            color={star <= rating ? '#3B82F6' : '#D1D5DB'}
          />
        </Pressable>
      ))}
    </View>
  );
}

