import { View, Text, Pressable } from "react-native";
import Tag from "./Tag";
import { getColor } from "../../utils/colors";
import StarIcon from "../../assets/icon/star.svg";

type BusinessStatus = '영업중' | '영업종료' | '브레이크타임';

interface RestaurantStatusTagProps {
    status: BusinessStatus;
    rating: number;
    restaurantId?: string;
    onRatingPress?: () => void;
}

const statusStyles = {
    '영업중': {
        filled: 'bg-blue-500 border-blue-500',
        outlined: 'bg-transparent border-blue-500',
        textColor: 'text-blue-500',
        tintColor: getColor('blue-500'),
    },
    '영업종료': {
        filled: 'bg-red-500 border-red-500',
        outlined: 'bg-transparent border-red-500',
        textColor: 'text-red-500',
        tintColor: getColor('red-500'),
    },
    '브레이크타임': {
        filled: 'bg-orange-400 border-orange-400',
        outlined: 'bg-transparent border-orange-400',
        textColor: 'text-orange-400',
        tintColor: getColor('orange-400'),
    },
};

export default function RestaurantStatusTag({ status, rating = 0, onRatingPress }: RestaurantStatusTagProps) {
    const styles = statusStyles[status];

    return (
        <View className="flex-row items-center" style={{ gap: 8 }}>
            {/* 영업 상태 태그 */}
            <Tag className={styles.filled}>
                <Text className="text-white text-sm font-medium">
                    {status}
                </Text>
            </Tag>

            {/* 별점 태그 */}
            <Pressable onPress={onRatingPress}>
                <Tag className={styles.outlined}>
                    <View className="flex-row items-center" style={{ gap: 4 }}>
                        <StarIcon
                            width={16}
                            height={16}
                            color={styles.tintColor}
                        />
                        <Text className={`text-sm font-bold ${styles.textColor}`}>
                            {rating.toFixed(1)}
                        </Text>
                    </View>
                </Tag>
            </Pressable>
        </View>
    );
}
