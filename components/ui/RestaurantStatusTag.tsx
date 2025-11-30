import { View, Text, Pressable, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";
import Tag from "./Tag";
import { getColor } from "../../utils/colors";
import StarIcon from "../../assets/icon/star.svg";
import { RestaurantOperatingStatus } from "@/api/restaurants/types";

interface RestaurantStatusTagProps {
    operatingStatus?: RestaurantOperatingStatus | null;
    rating: number;
    restaurantId?: string;
    onRatingPress?: () => void;
    onStatusPress?: () => void;
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

// 오늘인지 확인하는 함수
function isToday(date: Date): boolean {
    const today = new Date();
    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
}

// 요일 포맷 함수 (요일만 반환, 예: "월")
function formatDayOfWeek(date: Date): string {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
}

// 분 차이 계산 함수
function getMinutesUntil(targetDate: Date): number {
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();
    return Math.floor(diffMs / (1000 * 60));
}

// 날짜 차이 계산 함수
function getDaysUntil(targetDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diffMs = target.getTime() - today.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// 다음 이벤트 텍스트 생성 함수
function getNextEventText(operatingStatus: RestaurantOperatingStatus): string | null {
    const currentType = operatingStatus.current.type;
    const nextAction = operatingStatus.next;
    
    if (!nextAction?.at) return null;
    
    const nextDate = new Date(nextAction.at);
    const minutesUntil = getMinutesUntil(nextDate);
    const daysUntil = getDaysUntil(nextDate);
    
    // 운영중일 때: 30분 전부터 다음 이벤트 표시
    if (currentType === 'open') {
        if (minutesUntil > 30) return null; // 30분 전이 아니면 표시 안함
        
        const nextType = nextAction.type;
        if (nextType === 'break_start') {
            return `${minutesUntil}분 뒤 브레이크타임 시작`;
        } else if (nextType === 'order_end') {
            return `${minutesUntil}분 뒤 주문 마감`;
        } else if (nextType === 'closed') {
            return `${minutesUntil}분 뒤 종료`;
        }
    }
    
    // 브레이크타임일 때: 30분 뒤에 브레이크타임 종료한다면
    if (currentType === 'break_time') {
        if (minutesUntil > 30) return null; // 30분 전이 아니면 표시 안함
        
        if (nextAction.type === 'break_end') {
            return `${minutesUntil}분 뒤 운영 재개`;
        }
    }
    
    // 운영종료일 때: 항상 작동
    if (currentType === 'closed') {
        if (nextAction.type === 'open') {
            const time = formatTime(nextAction.at);
            if (daysUntil === 0) {
                return `오늘 ${time} 운영 시작`;
            } else if (daysUntil === 1) {
                return `내일 ${time} 운영 시작`;
            } else if (daysUntil === 2) {
                return `내일모래 ${time} 운영 시작`;
            } else {
                return `${daysUntil}일 후 ${time} 운영 시작`;
            }
        }
    }
    
    return null;
}

export default function RestaurantStatusTag({ operatingStatus, rating = 0, onRatingPress, onStatusPress }: RestaurantStatusTagProps) {
    const [showNextEvent, setShowNextEvent] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    
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
    const nextEventText = getNextEventText(operatingStatus);

    // 5초마다 토글
    useEffect(() => {
        if (!nextEventText) {
            setShowNextEvent(false);
            fadeAnim.setValue(1);
            return;
        }

        // 초기 상태: 상태 레이블 표시
        setShowNextEvent(false);
        fadeAnim.setValue(1);

        const toggleText = () => {
            // 페이드 아웃
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                // 텍스트 변경
                setShowNextEvent(prev => !prev);
                // 페이드 인
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            });
        };

        // 5초 후 첫 번째 전환 (상태 레이블 → 다음 이벤트)
        const timeout = setTimeout(() => {
            toggleText();
        }, 5000);

        // 10초마다 반복 (상태 레이블 ↔ 다음 이벤트)
        const interval = setInterval(() => {
            toggleText();
        }, 10000);

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, [nextEventText, fadeAnim]);

    const displayText = showNextEvent && nextEventText ? nextEventText : statusLabel;

    return (
        <View className="flex-row items-center" style={{ gap: 8 }}>
            {/* 영업 상태 태그 */}
            <Pressable onPress={onStatusPress}>
                <Tag className={styles.filled}>
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <Text className="text-white text-sm font-medium">
                            {displayText}
                        </Text>
                    </Animated.View>
                </Tag>
            </Pressable>

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
    );
}
