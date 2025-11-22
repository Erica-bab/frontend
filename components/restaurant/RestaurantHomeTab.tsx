import { useState } from 'react';
import { View, ScrollView, Text, Pressable } from 'react-native';
import { RestaurantDetailResponse, BusinessHoursDay } from '@/api/restaurants/types';
import Icon from '@/components/Icon';

interface RestaurantHomeTabProps {
  restaurant: RestaurantDetailResponse;
}

type DayKey = '일' | '월' | '화' | '수' | '목' | '금' | '토';

function getNextEvent(businessHours: BusinessHoursDay | null | undefined): string | null {
  if (!businessHours) return null;
  if (businessHours.is_closed) return '휴무일';

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const events: { label: string; time: number }[] = [];

  if (businessHours.open_time) {
    events.push({ label: '오픈', time: timeToMinutes(businessHours.open_time) });
  }
  if (businessHours.break_start) {
    events.push({ label: '브레이크타임', time: timeToMinutes(businessHours.break_start) });
  }
  if (businessHours.break_end) {
    events.push({ label: '브레이크타임 종료', time: timeToMinutes(businessHours.break_end) });
  }
  if (businessHours.last_order) {
    events.push({ label: '라스트오더', time: timeToMinutes(businessHours.last_order) });
  }
  if (businessHours.close_time) {
    events.push({ label: '마감', time: timeToMinutes(businessHours.close_time) });
  }

  const futureEvents = events.filter(e => e.time > currentTime);
  if (futureEvents.length === 0) return null;

  futureEvents.sort((a, b) => a.time - b.time);
  const next = futureEvents[0];

  const hours = Math.floor(next.time / 60).toString().padStart(2, '0');
  const mins = (next.time % 60).toString().padStart(2, '0');

  return `${hours}:${mins} ${next.label}`;
}

function formatDayHours(hours: BusinessHoursDay | null | undefined): string[] {
  if (!hours) return [];
  if (hours.is_closed) return ['휴무일'];

  const lines: string[] = [];

  if (hours.open_time && hours.close_time) {
    lines.push(`${hours.open_time} - ${hours.close_time}`);
  }
  if (hours.break_start && hours.break_end) {
    lines.push(`${hours.break_start} - ${hours.break_end} 브레이크타임`);
  }
  if (hours.last_order) {
    lines.push(`${hours.last_order} 라스트오더`);
  }

  return lines;
}

export default function RestaurantHomeTab({ restaurant }: RestaurantHomeTabProps) {
  const [isHoursExpanded, setIsHoursExpanded] = useState(false);
  const dayOrder: DayKey[] = ['월', '화', '수', '목', '금', '토', '일'];
  const dayMap: DayKey[] = ['일', '월', '화', '수', '목', '금', '토'];
  const today = dayMap[new Date().getDay()];
  const todayHours = restaurant.business_hours[today];
  const nextEvent = getNextEvent(todayHours);

  return (
    <View className="p-4 gap-2">
      <View className='flex-row gap-4 mb-4 items-center'>
        <Icon name='location' color="rgba(107, 114, 128, 1)"/>
        <Text>{restaurant.location.address}</Text>
      </View>
      <View className='flex-row gap-4 mb-4'>
        <Icon name='clock' color="rgba(107, 114, 128, 1)"/>
        <View>
          <Pressable
            className='flex-row items-center gap-1'
            onPress={() => setIsHoursExpanded(!isHoursExpanded)}
          >
            <Text className='mb-2'>{restaurant.status}{nextEvent ? ` · ${nextEvent}` : ''}</Text>
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
      <View className='flex-row gap-4 mb-4 items-center'>
        <Icon name='telephone'/>
        <Text>{restaurant.phone}</Text>
      </View>
      {restaurant.affiliations && restaurant.affiliations.length > 0 && (
        <View className='flex-row gap-4 mb-4 items-center'>
          <Icon name='pin'/>
          <Text>제휴 · {restaurant.affiliations.map(a => a.college_name).join(' · ')}</Text>
        </View>
      )}
    </View>
  );
}