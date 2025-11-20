import { View, Text } from "react-native";
import Tag from "@/components/ui/Tag";
import StarIcon from "@/assets/icon/star.svg";

type BusinessStatus = '영업중' | '영업종료' | '브레이크타임';

interface RestaurantStatusTagProps {
    status: BusinessStatus;
    rating: number;
    className?: string;
}

const statusStyles = {
    '영업중': {
        bgColor: 'bg-blue-500',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-500',
        tintColor: '#3b82f6', // blue-500
    },
    '영업종료': {
        bgColor: 'bg-red-500',
        borderColor: 'border-red-500',
        textColor: 'text-red-500',
        tintColor: '#ef4444', // red-500
    },
    '브레이크타임': {
        bgColor: 'bg-orange-400',
        borderColor: 'border-orange-400',
        textColor: 'text-orange-400',
        tintColor: '#fb923c', // orange-400
    },
};

export default function RestaurantStatusTag({ status, rating = 0 }: RestaurantStatusTagProps) {
    const styles = statusStyles[status];

    return (
        <View className="flex-row items-center gap-2">
            {/* 영업 상태 태그 */}
            <Tag bgColor={styles.bgColor}>
                <Text className="text-white text-sm font-medium">
                    {status}
                </Text>
            </Tag>

            {/* 별점 태그 */}
            <Tag variant="outlined" borderColor={styles.borderColor}>
                <View className="flex-row items-center gap-1">
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
        </View>
    );
}
