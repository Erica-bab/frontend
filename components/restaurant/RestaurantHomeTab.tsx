import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { RestaurantDetailResponse, BusinessHoursDay } from '@/api/restaurants/types';
import Icon from '@/components/Icon';
import { formatDistance } from '@/utils/formatDistance';

interface RestaurantHomeTabProps {
  restaurant: RestaurantDetailResponse;
}

type DayKey = '일' | '월' | '화' | '수' | '목' | '금' | '토';

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

// 시간 포맷 함수 (ISO 문자열 → "HH:MM")
function formatTime(isoString: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatDayHours(hours: BusinessHoursDay | null | undefined): string[] {
  if (!hours) return [];
  if (hours.is_closed) return ['휴무일'];

  const lines: string[] = [];

  // 영업시간
  if (hours.open_time && hours.close_time) {
    lines.push(`${hours.open_time} - ${hours.close_time}`);
  }

  // 브레이크타임
  if (hours.break_start && hours.break_end) {
    lines.push(`${hours.break_start} - ${hours.break_end} 브레이크타임`);
  }

  // 라스트오더
  if (hours.last_order) {
    lines.push(`라스트오더 ${hours.last_order}`);
  }

  // 특이사항
  if (hours.special_note) {
    lines.push(hours.special_note);
  }

  return lines.length > 0 ? lines : ['정보 없음'];
}

export default function RestaurantHomeTab({ restaurant }: RestaurantHomeTabProps) {
  const [isHoursExpanded, setIsHoursExpanded] = useState(false);
  const dayOrder: DayKey[] = ['월', '화', '수', '목', '금', '토', '일'];
  const dayMap: DayKey[] = ['일', '월', '화', '수', '목', '금', '토'];
  const today = dayMap[new Date().getDay()];

  // operating_status 사용
  const operatingStatus = restaurant.operating_status;
  const statusText = operatingStatus ? statusLabels[operatingStatus.current.type] : restaurant.status;

  // next 액션 텍스트
  const nextAction = operatingStatus?.next;
  const nextActionTime = nextAction?.at ? formatTime(nextAction.at) : null;
  const nextActionLabel = nextAction?.type ? nextActionLabels[nextAction.type] : null;
  const nextEventText = nextActionTime && nextActionLabel ? `${nextActionTime} ${nextActionLabel}` : null;

  return (
    <View className="p-4 gap-2">
      <View className='flex-row gap-4 mb-4 items-center justify-between'>
        <View className='flex-row gap-4 items-center flex-1'>
          <Icon name='location' color="rgba(107, 114, 128, 1)"/>
          <Text className="flex-1">{restaurant.location.address}</Text>
        </View>
        {restaurant.location.distance !== null && restaurant.location.distance !== undefined && (
          <Text className="text-sm text-gray-500">
            {formatDistance(restaurant.location.distance)}
          </Text>
        )}
      </View>
      <View className='flex-row gap-4 mb-4'>
        <Icon width={20} name='clock' color="rgba(107, 114, 128, 1)"/>
        <View>
          <Pressable
            className='flex-row items-center gap-1'
            onPress={() => setIsHoursExpanded(!isHoursExpanded)}
          >
            <Text>{statusText}{nextEventText ? ` · ${nextEventText}예정` : ''}</Text>
            <Icon width={12} name={isHoursExpanded ? 'upAngle' : 'downAngle'} />
          </Pressable>

          {isHoursExpanded && (
            <View className='mt-2 gap-2'>
              {dayOrder.map((day) => {
                const hours = restaurant.business_hours[day];
                const lines = formatDayHours(hours);
                const isToday = day === today;

                return (
                  <View key={day} className='gap-1'>
                    <Text className={isToday ? 'font-bold' : ''}>{day}</Text>
                    {lines.length > 0 ? (
                      lines.map((line, idx) => (
                        <Text key={idx} className={isToday ? 'text-gray-600 font-bold' : 'text-gray-600'}>{line}</Text>
                      ))
                    ) : (
                      <Text className='text-gray-400 ml-2'>정보 없음</Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
      {restaurant.phone && (
        <View className='flex-row gap-4 mb-4 items-center'>
          <Icon width={20} name='telephone'/>
          <Text>{restaurant.phone}</Text>
        </View>
      )}
      {restaurant.affiliations && restaurant.affiliations.length > 0 && (
        <View className='flex-row gap-4 mb-4 items-center'>
          <Icon name='pin'/>
          <Text>제휴 · {restaurant.affiliations.map(a => a.college_name).join(' · ')}</Text>
        </View>
      )}
    </View>
  );
}