import { View, Text, Pressable } from "react-native";
import Tag from "./Tag";
import { getColor } from "../../utils/colors";
import StarIcon from "../../assets/icon/star.svg";
import { RestaurantOperatingStatus } from "@/api/restaurants/types";

interface RestaurantStatusTagProps {
    operatingStatus?: RestaurantOperatingStatus | null;
    rating: number;
    restaurantId?: string;
    onRatingPress?: () => void;
}

// operating_status type에 따른 표시 텍스트
const statusLabels = {
    open: '영업중',
    break_time: '브레이크타임',
    order_end: '주문마감',
    closed: '영업종료',
};

// next type에 따른 표시 텍스트
const nextActionLabels = {
    break_start: '브레이크 시작',
    break_end: '브레이크 종료',
    order_end: '주문 마감',
    closed: '영업 종료',
    open: '오픈',
};

const statusStyles = {
    open: {
        filled: 'bg-blue-500 border-blue-500',
        outlined: 'bg-transparent border-blue-500',
        textColor: 'text-blue-500',
        tintColor: getColor('blue-500'),
    },
    break_time: {
        filled: 'bg-orange-400 border-orange-400',
        outlined: 'bg-transparent border-orange-400',
        textColor: 'text-orange-400',
        tintColor: getColor('orange-400'),
    },
    order_end: {
        filled: 'bg-yellow-500 border-yellow-500',
        outlined: 'bg-transparent border-yellow-500',
        textColor: 'text-yellow-600',
        tintColor: getColor('yellow-500'),
    },
    closed: {
        filled: 'bg-red-500 border-red-500',
        outlined: 'bg-transparent border-red-500',
        textColor: 'text-red-500',
        tintColor: getColor('red-500'),
    },
};

// 시간 포맷 함수 (ISO 문자열 → "HH:MM")
function formatTime(isoString: string | null): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

export default function RestaurantStatusTag({ operatingStatus, rating = 0, onRatingPress }: RestaurantStatusTagProps) {
    // operating_status가 없으면 기본값 사용
    if (!operatingStatus) {
        return (
            <View className="flex-row items-center" style={{ gap: 8 }}>
                <Pressable onPress={onRatingPress}>
                    <Tag className="bg-transparent border-gray-400">
                        <View className="flex-row items-center" style={{ gap: 4 }}>
                            <StarIcon width={16} height={16} color={getColor('gray-400')} />
                            <Text className="text-sm font-bold text-gray-400">
                                {rating.toFixed(1)}
                            </Text>
                        </View>
                    </Tag>
                </Pressable>
            </View>
        );
    }

    const currentType = operatingStatus.current.type;
    const styles = statusStyles[currentType];
    const statusLabel = statusLabels[currentType];

    // next 액션 표시
    const nextAction = operatingStatus.next;
    const nextActionTime = nextAction?.at ? formatTime(nextAction.at) : null;
    const nextActionLabel = nextAction?.type ? nextActionLabels[nextAction.type] : null;

    return (
        <View className="flex-col" style={{ gap: 4 }}>
            <View className="flex-row items-center" style={{ gap: 8 }}>
                {/* 영업 상태 태그 */}
                <Tag className={styles.filled}>
                    <Text className="text-white text-sm font-medium">
                        {statusLabel}
                    </Text>
                </Tag>

                {/* 별점 태그 */}
                <Pressable onPress={onRatingPress}>
                    <Tag className={styles.outlined}>
                        <View className="flex-row items-center" style={{ gap: 4 }}>
                            <StarIcon width={16} height={16} color={styles.tintColor} />
                            <Text className={`text-sm font-bold ${styles.textColor}`}>
                                {rating.toFixed(1)}
                            </Text>
                        </View>
                    </Tag>
                </Pressable>
            </View>
        </View>
    );
}
