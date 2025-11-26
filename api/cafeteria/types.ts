// Get Menu (all)

export type MealType = '조식' | '중식' | '석식';
// location code re11: 교직원식당 re12: 학생식당 re13: 창의인재원식당 re15: 창업보육센터

export type RestaurantCode = 're11' | 're12' | 're13' | 're15';

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

// time
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

export interface CafeteriaParams {
  year: number;
  month: number;
  day: number;
  restaurant_codes?: RestaurantCode;
  meal_types?: MealType;
  cafeteria_details?: boolean; // 위치/운영시간 포함 여부(백엔드 정의대로)
}

// like
export interface CafeteriaLikeParams {
  meal_id: number;
}

export interface CafeteriaLikeErrorResponse {
  detail?: string;
}

// Get like
export interface CafeteriaLikeResponse {
  meal_id: number;      
  like_count: number;   
  dislike_count: number;
  user_reaction: string;
}

// post like
export interface CafeteriaLikeToggleResponse {
  meal_id: number;
  user_id: number;
  is_like: boolean;
  like_count: number;
  dislike_count: number;
  message: string;
}

export interface CafeteriaLikeToggleBody {
  is_like: true;
}