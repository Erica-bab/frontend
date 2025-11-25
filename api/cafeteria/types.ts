// useCafeteriaMenu 관련 타입

// 식사 카테고리 타입 (이제 한글로)
export type MealType = '조식' | '중식' | '석식';

// 식당 코드
export type RestaurantCode = 're11' | 're12' | 're13' | 're15';
/*
re11: 교직원식당
re12: 학생식당
re13: 창의인재원식당
re15: 창업보육센터
*/

// 개별 메뉴 항목
export interface MealItem {
  korean_name: string[];
  tags: string[];
  price: string;
  image_url: string;
  id: number;
  restaurant_id: number;
  date: string;
  day_of_week: string;
  meal_type: MealType;
  like_count: number;
  dislike_count: number;
  user_reaction: string | null;
}

// 운영 시간 (API 응답 형태 그대로)
export interface OpenTimes {
  Breakfast: string | null;
  Lunch: string | null;
  Dinner: string | null;
}

// 식당 단위 데이터
export interface Restaurant {
  restaurant_code: RestaurantCode;
  restaurant_name: string;

  조식: MealItem[];
  중식: MealItem[];
  석식: MealItem[];

  address: string;
  building: string;
  floor: string;
  latitude: string;
  longitude: string;
  description: string;

  open_times: OpenTimes;
}

// 최상위 응답 구조
export interface CafeteriaResponse {
  date: string;
  day_of_week: string;
  restaurants: Restaurant[];
}

// API 요청 파라미터 타입
export interface CafeteriaParams {
  year: number;
  month: number;
  day: number;
  restaurant_codes?: RestaurantCode;
  meal_types?: MealType;
  cafeteria_details?: boolean; // 위치/운영시간 포함 여부(백엔드 정의대로)
}
