/**
 * 식당 운영 상태 계산 유틸리티
 * 
 * 요청사항:
 * - 현재 상태(영업중/브레이크타임/주문마감/종료 등)와 다음 예정 상태를 함께 제공
 * - 브레이크타임, 라스트오더, 영업 종료, 다음날 오픈 등 모든 이벤트 고려
 * - 새벽까지 영업(마감 시간이 다음날 새벽)하는 경우도 처리
 */

import { BusinessHours, BusinessHoursDay, RestaurantOperatingStatus } from '../api/restaurants/types';

const DAY_ORDER = ["월", "화", "수", "목", "금", "토", "일"];

const STATUS_AFTER_EVENT: Record<string, 'open' | 'break_time' | 'order_end' | 'closed'> = {
  "open": "open",
  "break_start": "break_time",
  "break_end": "open",
  "order_end": "order_end",
  "closed": "closed",
};

type EventType = 'open' | 'break_start' | 'break_end' | 'order_end' | 'closed';
type Event = [Date, EventType];

/**
 * 시간 문자열(HH:MM)을 Date 객체로 변환
 */
function parseTime(timeStr: string | null | undefined): Date | null {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return new Date(0, 0, 0, hours, minutes);
}

/**
 * 날짜와 시간을 합쳐서 Date 객체 생성 (KST 기준)
 */
function combineDateTime(date: Date, time: Date | null): Date | null {
  if (!time) return null;
  const result = new Date(date);
  result.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return result;
}

/**
 * 요일 문자열을 '월'~'일' 형식으로 통일
 */
function normalizeDay(day: string | null | undefined): string | null {
  if (!day) return null;
  if (DAY_ORDER.includes(day)) return day;
  if (day.endsWith('요일')) {
    const short = day[0];
    if (DAY_ORDER.includes(short)) return short;
  }
  return day;
}

/**
 * 운영시간 한 건을 이벤트(시작 시각, 이벤트 타입) 목록으로 변환
 */
function buildEventsForEntry(
  entry: BusinessHoursDay,
  baseDate: Date,
  dayOfWeek: string
): Event[] {
  if (entry.is_closed) return [];
  if (!entry.open_time || !entry.close_time) return [];

  const events: Event[] = [];
  let lastDt = combineDateTime(baseDate, parseTime(entry.open_time));
  if (!lastDt) return [];

  events.push([lastDt, "open"]);

  function resolveDateTime(timeStr: string | null | undefined): Date | null {
    if (!timeStr) return null;
    const time = parseTime(timeStr);
    if (!time) return null;
    
    let dt = combineDateTime(baseDate, time);
    if (!dt) return null;

    // 새벽까지 영업 처리
    if (entry.closes_next_day && entry.open_time) {
      const openTime = parseTime(entry.open_time);
      if (openTime && time <= openTime) {
        dt = new Date(dt);
        dt.setDate(dt.getDate() + 1);
      }
    }
    return dt;
  }

  function addEvent(timeStr: string | null | undefined, label: EventType): void {
    let dt = resolveDateTime(timeStr);
    if (!dt) return;

    // 이전 이벤트보다 이전이면 다음날로 이동
    while (dt <= lastDt!) {
      dt = new Date(dt);
      dt.setDate(dt.getDate() + 1);
    }
    events.push([dt, label]);
    lastDt = dt;
  }

  addEvent(entry.break_start, "break_start");
  addEvent(entry.break_end, "break_end");

  // 라스트오더와 마감 시간이 같으면 라스트오더 이벤트를 추가하지 않음
  if (entry.last_order && entry.close_time) {
    if (entry.last_order !== entry.close_time) {
      addEvent(entry.last_order, "order_end");
    }
  } else {
    addEvent(entry.last_order, "order_end");
  }

  let closeDt = resolveDateTime(entry.close_time);
  if (!closeDt) return events;

  while (closeDt <= lastDt) {
    closeDt = new Date(closeDt);
    closeDt.setDate(closeDt.getDate() + 1);
  }
  events.push([closeDt, "closed"]);

  return events;
}

/**
 * 이벤트 타입으로부터 상태 반환
 */
function statusFromEvent(eventType: EventType | null): 'open' | 'break_time' | 'order_end' | 'closed' {
  if (!eventType) return "closed";
  return STATUS_AFTER_EVENT[eventType] || "closed";
}

/**
 * 식당 운영 상태 계산
 * 
 * @param businessHours 운영시간 정보
 * @param now 현재 시간 (기본값: 현재 시간)
 * @returns 운영 상태 정보
 */
export function calculateOperatingStatus(
  businessHours: BusinessHours | null | undefined,
  now?: Date
): RestaurantOperatingStatus {
  const currentTime = now || new Date();

  if (!businessHours) {
    return {
      current: { type: "closed", until: null },
      next: null,
    };
  }

  // 요일별로 운영시간 그룹화
  const hoursByDay: Record<string, Array<{ day: string; hours: BusinessHoursDay }>> = {};
  for (const day of DAY_ORDER) {
    const dayHours = businessHours[day as keyof BusinessHours];
    if (dayHours) {
      const normalizedDay = normalizeDay(day) || day;
      if (!hoursByDay[normalizedDay]) {
        hoursByDay[normalizedDay] = [];
      }
      hoursByDay[normalizedDay].push({ day, hours: dayHours });
    }
  }

  const todayIdx = currentTime.getDay() === 0 ? 6 : currentTime.getDay() - 1; // 월=0, 일=6

  // 어제부터 1주일 뒤까지의 이벤트 생성
  const events: Event[] = [];
  for (let offset = -1; offset < 8; offset++) {
    const targetIdx = (todayIdx + offset + 7) % 7;
    const dayName = DAY_ORDER[targetIdx];
    const targetDate = new Date(currentTime);
    targetDate.setDate(targetDate.getDate() + offset);
    targetDate.setHours(0, 0, 0, 0);

    const entries = hoursByDay[dayName] || [];
    for (const { day, hours } of entries) {
      events.push(...buildEventsForEntry(hours, targetDate, day));
    }
  }

  // 이벤트를 시간순으로 정렬
  events.sort((a, b) => a[0].getTime() - b[0].getTime());

  if (events.length === 0) {
    return {
      current: { type: "closed", until: null },
      next: null,
    };
  }

  let currentType: 'open' | 'break_time' | 'order_end' | 'closed' = "closed";
  let currentUntil: Date | null = null;
  let nextEvent: Event | null = null;

  // 현재 시간 이후의 첫 번째 이벤트 찾기
  for (let idx = 0; idx < events.length; idx++) {
    const [eventTime, eventType] = events[idx];
    if (currentTime < eventTime) {
      const prevType = idx > 0 ? events[idx - 1][1] : null;
      currentType = statusFromEvent(prevType);
      currentUntil = eventTime;
      nextEvent = [eventTime, eventType];
      break;
    }
  }

  // 현재 시간이 모든 이벤트 이후인 경우
  if (nextEvent === null) {
    const lastEvent = events[events.length - 1];
    const lastType = lastEvent[1];
    currentType = statusFromEvent(lastType);
    currentUntil = null;

    // 다음 이벤트 찾기 (다음 주)
    for (const [eventTime, eventType] of events) {
      if (eventTime > currentTime) {
        nextEvent = [eventTime, eventType];
        break;
      }
    }
  }

  const statusBlock = {
    type: currentType,
    until: currentUntil ? currentUntil.toISOString() : null,
  };

  const nextBlock = nextEvent
    ? {
        type: nextEvent[1],
        at: nextEvent[0].toISOString(),
      }
    : null;

  return {
    current: statusBlock,
    next: nextBlock,
  };
}

/**
 * 특정 요일에 운영시간이 있는지 확인 (요일만 선택한 경우)
 * 
 * @param businessHours 운영시간 정보
 * @param dayOfWeek 요일 ('월', '화', '수', '목', '금', '토', '일')
 * @returns 해당 요일에 운영시간이 있으면 true, 없으면 false
 */
export function hasOperatingHoursOnDay(
  businessHours: BusinessHours | null | undefined,
  dayOfWeek: string
): boolean {
  if (!businessHours) return false;

  // 요일을 정규화
  const normalizedDay = normalizeDay(dayOfWeek);
  if (!normalizedDay) return false;

  const dayHours = businessHours[normalizedDay as keyof BusinessHours];
  // 해당 요일에 운영시간이 있고, 휴무일이 아니면 true
  return !!(dayHours && !dayHours.is_closed && dayHours.open_time && dayHours.close_time);
}

/**
 * 특정 요일과 시간에 식당이 운영중인지 확인
 * 
 * @param businessHours 운영시간 정보
 * @param dayOfWeek 요일 ('월', '화', '수', '목', '금', '토', '일')
 * @param time 시간 ('HH:MM' 형식, 선택사항)
 * @returns 운영중이면 true, 아니면 false
 */
export function isRestaurantOpenAt(
  businessHours: BusinessHours | null | undefined,
  dayOfWeek: string,
  time?: string
): boolean {
  if (!businessHours) return false;

  // 요일을 정규화
  const normalizedDay = normalizeDay(dayOfWeek);
  if (!normalizedDay) return false;

  const dayHours = businessHours[normalizedDay as keyof BusinessHours];
  if (!dayHours || dayHours.is_closed) return false;

  // 시간이 없으면 해당 요일에 운영시간이 있는지만 확인
  if (!time) {
    return !!(dayHours.open_time && dayHours.close_time);
  }

  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return false;

  // 해당 요일의 Date 객체 생성
  const dayIndex = DAY_ORDER.indexOf(normalizedDay);
  if (dayIndex === -1) return false;

  const today = new Date();
  const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // 월=0, 일=6
  const daysDiff = dayIndex - todayIndex;
  
  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + daysDiff);
  targetDate.setHours(hours, minutes, 0, 0);

  // 해당 시간의 운영 상태 계산
  const status = calculateOperatingStatus(businessHours, targetDate);
  
  // 영업중이거나 브레이크타임이면 true (주문마감이나 영업종료는 false)
  return status.current.type === 'open' || status.current.type === 'break_time';
}

