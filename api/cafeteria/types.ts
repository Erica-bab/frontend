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

// 식당 단위 데이터
export interface Restaurant {
  restaurant_code: string;
  restaurant_name: string;
  조식: MealItem[];
  중식: MealItem[];
  석식: MealItem[];
}

// 최상위 응답 구조
export interface CafeteriaResponse {
  date: string;
  day_of_week: string;
  restaurants: Restaurant[];
}

// 식사 카테고리 타입
export type MealType = "조식" | "중식" | "석식";

// 식당 코드 미리 정의해두고 싶으면 (선택)
export type RestaurantCode = "re11" | "re12" | "re13" | "re15";

export interface CafeteriaParams {
  year: number;
  month: number;
  day: number;
  restaurant_codes?: RestaurantCode;
  meal_type?: MealType;
}