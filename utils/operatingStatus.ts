/**
 * ⚡ 실전용 식당 운영 상태 계산 (간단 버전)
 *
 * - 클라이언트 타이머 기반
 * - 서버 부하 없음
 * - "영업중 / 곧 종료 / 브레이크타임 / 종료" 계산
 */

import { BusinessHours } from '../api/restaurants/types';

export type OperatingStatusType =
  | "open"
  | "closing_soon"
  | "break_time"
  | "order_end"
  | "closed";

export interface OperatingStatusResult {
  type: OperatingStatusType;
  label: string;
  minutesLeft?: number;
}

/**
 * ⚡ 핵심: 식당 운영 상태 계산 (실전용)
 *
 * @param businessHours 운영시간 정보 (API 형식 그대로)
 * @param now 현재 시간
 * @returns 영업 상태
 */
export function getOperatingStatus(
  businessHours: BusinessHours | null | undefined,
  now: Date
): OperatingStatusResult {
  if (!businessHours) {
    return { type: "closed", label: "영업정보 없음" };
  }

  // 현재 요일 계산 (일=0 → 일=6으로 변환)
  const dayIndex = now.getDay(); // 0(일) ~ 6(토)
  const DAY_MAP = ["일", "월", "화", "수", "목", "금", "토"];
  const dayOfWeek = DAY_MAP[dayIndex];

  const today = businessHours[dayOfWeek as keyof BusinessHours];
  if (!today || today.is_closed) {
    return { type: "closed", label: "영업종료" };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 시간 파싱
  const openTime = parseTime(today.open_time);
  const closeTime = parseTime(today.close_time);
  const breakStart = today.break_start ? parseTime(today.break_start) : null;
  const breakEnd = today.break_end ? parseTime(today.break_end) : null;
  const lastOrder = today.last_order ? parseTime(today.last_order) : null;

  if (openTime == null || closeTime == null) {
    return { type: "closed", label: "영업종료" };
  }

  // 영업 전
  if (currentMinutes < openTime) {
    return { type: "closed", label: "영업전" };
  }

  // 브레이크타임 확인
  if (breakStart != null && breakEnd != null) {
    if (currentMinutes >= breakStart && currentMinutes < breakEnd) {
      return { type: "break_time", label: "브레이크타임" };
    }
  }

  // 라스트오더 확인
  if (lastOrder != null) {
    if (currentMinutes >= lastOrder) {
      return { type: "order_end", label: "주문마감" };
    }
  }

  // 영업 종료
  if (currentMinutes >= closeTime) {
    return { type: "closed", label: "영업종료" };
  }

  // 영업중 - 곧 종료 확인 (10분 기준)
  const minutesLeft = closeTime - currentMinutes;
  if (minutesLeft <= 10) {
    return {
      type: "closing_soon",
      label: `곧 종료 (${minutesLeft}분 남음)`,
      minutesLeft,
    };
  }

  return { type: "open", label: "영업중" };
}

/**
 * HH:MM 형식을 분 단위로 변환
 */
function parseTime(time: string | null | undefined): number | null {
  if (!time) return null;
  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

/**
 * ===== 기존 복잡한 로직 (필요시 유지) =====
 */
import { BusinessHoursDay, RestaurantOperatingStatus } from '../api/restaurants/types';

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

function parseTimeOld(timeStr: string | null | undefined): Date | null {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return new Date(0, 0, 0, hours, minutes);
}

function combineDateTime(date: Date, time: Date | null): Date | null {
  if (!time) return null;
  const result = new Date(date);
  result.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return result;
}

function normalizeDay(day: string | null | undefined): string | null {
  if (!day) return null;
  if (DAY_ORDER.includes(day)) return day;
  if (day.endsWith('요일')) {
    const short = day[0];
    if (DAY_ORDER.includes(short)) return short;
  }
  return day;
}

function buildEventsForEntry(
  entry: BusinessHoursDay,
  baseDate: Date,
  dayOfWeek: string
): Event[] {
  if (entry.is_closed) return [];
  if (!entry.open_time || !entry.close_time) return [];

  const events: Event[] = [];
  let lastDt = combineDateTime(baseDate, parseTimeOld(entry.open_time));
  if (!lastDt) return [];

  events.push([lastDt, "open"]);

  function resolveDateTime(timeStr: string | null | undefined): Date | null {
    if (!timeStr) return null;
    const time = parseTimeOld(timeStr);
    if (!time) return null;

    let dt = combineDateTime(baseDate, time);
    if (!dt) return null;

    if (entry.closes_next_day && entry.open_time) {
      const openTime = parseTimeOld(entry.open_time);
      if (openTime && time <= openTime) {
        dt = new Date(dt);
        dt.setDate(dt.getDate() + 1);
      }
    }
    return dt;
  }

  function addEvent(timeStr: string | null | undefined, label: EventType): void {
    let dt = resolveDateTime(timeStr);
    if (!dt) return null;

    while (dt <= lastDt!) {
      dt = new Date(dt);
      dt.setDate(dt.getDate() + 1);
    }
    events.push([dt, label]);
    lastDt = dt;
  }

  addEvent(entry.break_start, "break_start");
  addEvent(entry.break_end, "break_end");

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

function statusFromEvent(eventType: EventType | null): 'open' | 'break_time' | 'order_end' | 'closed' {
  if (!eventType) return "closed";
  return STATUS_AFTER_EVENT[eventType] || "closed";
}

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

  const todayIdx = currentTime.getDay() === 0 ? 6 : currentTime.getDay() - 1;

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

  if (nextEvent === null) {
    const lastEvent = events[events.length - 1];
    const lastType = lastEvent[1];
    currentType = statusFromEvent(lastType);
    currentUntil = null;

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

export function hasOperatingHoursOnDay(
  businessHours: BusinessHours | null | undefined,
  dayOfWeek: string
): boolean {
  if (!businessHours) return false;

  const normalizedDay = normalizeDay(dayOfWeek);
  if (!normalizedDay) return false;

  const dayHours = businessHours[normalizedDay as keyof BusinessHours];
  return !!(dayHours && !dayHours.is_closed && dayHours.open_time && dayHours.close_time);
}

export function isRestaurantOpenAt(
  businessHours: BusinessHours | null | undefined,
  dayOfWeek: string,
  time?: string
): boolean {
  if (!businessHours) return false;

  const normalizedDay = normalizeDay(dayOfWeek);
  if (!normalizedDay) return false;

  const dayHours = businessHours[normalizedDay as keyof BusinessHours];
  if (!dayHours || dayHours.is_closed) return false;

  if (!time) {
    return !!(dayHours.open_time && dayHours.close_time);
  }

  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return false;

  const dayIndex = DAY_ORDER.indexOf(normalizedDay);
  if (dayIndex === -1) return false;

  const today = new Date();
  const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const daysDiff = dayIndex - todayIndex;

  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + daysDiff);
  targetDate.setHours(hours, minutes, 0, 0);

  const status = calculateOperatingStatus(businessHours, targetDate);

  return status.current.type === 'open' || status.current.type === 'break_time';
}
