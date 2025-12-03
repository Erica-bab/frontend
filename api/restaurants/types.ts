export interface UserInfo {
  id: number;
  student_year?: string | null;
}

export interface LocationInfo {
  address?: string | null;
  detail_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distance?: number | null;
}

export interface BusinessHoursDay {
  open_time?: string | null;
  break_start?: string | null;
  break_end?: string | null;
  last_order?: string | null;
  close_time?: string | null;
  is_closed: boolean;
  special_note?: string | null;
  closes_next_day?: boolean;
}

export interface BusinessHours {
  월?: BusinessHoursDay | null;
  화?: BusinessHoursDay | null;
  수?: BusinessHoursDay | null;
  목?: BusinessHoursDay | null;
  금?: BusinessHoursDay | null;
  토?: BusinessHoursDay | null;
  일?: BusinessHoursDay | null;
}

export interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface RatingInfo {
  average: number;
  count: number;
  distribution: RatingDistribution;
}

export interface RatingItem {
  id: number;
  user: UserInfo;
  rating: number;
  created_at: string;
  updated_at?: string | null;
}

export interface CollegeAffiliation {
  college_id: number;
  college_name: string;
  year: number;
  description?: string | null;
}

export interface PopularMenu {
  id: number;
  name: string;
  price?: number | null;
  image_url?: string | null;
}

export interface MenuSummary {
  total_count: number;
  average_price?: number | null;
  popular_menus: PopularMenu[];
}

export interface MenuMeta {
  created_by?: UserInfo | null;
  created_at?: string | null;
  last_edited_by?: UserInfo | null;
  last_edited_at?: string | null;
  edit_count: number;
  version: number;
}

export interface MenuItem {
  id: number;
  name: string;
  price?: number | null;
  description?: string | null;
  category?: string | null;
  image_url?: string | null;
  images: string[];
  is_popular: boolean;
  is_available: boolean;
  display_order: number;
  is_verified: boolean;
  meta: MenuMeta;
}

export interface CommentUser {
  id: number;
  student_year?: string | null;
}

export interface RecentComment {
  id: number;
  user: object;
  content: string;
  created_at: string;
}

export interface CommentSummary {
  total_count: number;
  recent_comments: RecentComment[];
}

export interface CommentItem {
  id: number;
  user: CommentUser;
  content: string;
  status: string;
  is_reported: boolean;
  like_count: number;
  dislike_count: number;
  created_at: string;
  updated_at?: string | null;
  parent_id?: number | null;
  is_parent_writer: boolean;
  replies: CommentItem[];
}

export interface RestaurantMeta {
  created_by?: UserInfo | null;
  created_at?: string | null;
  last_edited_by?: UserInfo | null;
  last_edited_at?: string | null;
  edit_count: number;
  version: number;
}

export interface RestaurantOperatingStatus {
  current: {
    type: 'open' | 'break_time' | 'order_end' | 'closed';
    until: string | null;
  };
  next?: {
    type: 'break_start' | 'break_end' | 'order_end' | 'closed' | 'open';
    at: string | null;
  } | null;
}

export interface PopularComment {
  id: number;
  user: {
    id: number;
    student_year?: string | null;
  };
  content: string;
  like_count: number;
  created_at: string;
}

export interface RestaurantListItem {
  id: number;
  name: string;
  thumbnail_urls: string[];
  average_rating: number;
  rating_count: number;
  location: LocationInfo;
  business_hours: BusinessHours;
  affiliations: CollegeAffiliation[];
  category: string;
  sub_category: string;
  average_price?: number | null;
  is_verified: boolean;
  status: string;
  operating_status?: RestaurantOperatingStatus | null;
  popular_comment?: PopularComment | null;
}

export interface RestaurantListResponse {
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  restaurants: RestaurantListItem[];
}

export interface RestaurantDetailResponse {
  id: number;
  name: string;
  category: string;
  sub_category: string;
  description?: string | null;
  phone?: string | null;
  location: LocationInfo;
  images: string[];
  rating: RatingInfo;
  business_hours: BusinessHours;
  affiliations: CollegeAffiliation[];
  menu_summary: MenuSummary;
  comment_summary: CommentSummary;
  meta: RestaurantMeta;
  is_verified: boolean;
  status: string;
  operating_status?: RestaurantOperatingStatus | null;
}

export interface RestaurantListParams {
  sort?: 'distance' | 'rating' | 'recent' | 'price';
  lat?: number;
  lng?: number;
  is_open_only?: boolean;
  day_of_week?: string;
  time?: string;
  categories?: string;
  affiliations?: string;
  sub_category?: string;
  page?: number;
  limit?: number;
}

export interface CommentListParams {
  page?: number;
  limit?: number;
  sort?: 'recent' | 'likes';
}

export interface CreateRatingRequest {
  rating: number;
}

export interface CreateCommentRequest {
  content: string;
  parent_id?: number;
}

// 검색 관련 타입
export interface SearchParams {
  q: string;
  page?: number;
  limit?: number;
}

export interface SearchResultItem {
  type: 'restaurant' | 'menu';
  score: number;
  restaurant: RestaurantListItem | null;
  menu: MenuItem | null;
}

export interface SearchResponse {
  query: string;
  total: number;
  restaurants_count: number;
  menus_count: number;
  page: number;
  limit: number;
  has_next: boolean;
  results: SearchResultItem[];
}

export interface MenuListParams {
  category?: string;
  is_available?: boolean;
  sort?: 'price' | 'popular' | 'name';
}

export interface MenuListResponse {
  restaurant_id: number;
  restaurant_name: string;
  menus: MenuItem[];
  categories: string[];
  total_count: number;
}

// 식당 수정 관련 타입
export interface AffiliationUpdate {
  college_id: number;
  description?: string;
}

export interface UpdateRestaurantRequest {
  phone?: string;
  affiliations?: AffiliationUpdate[];
  version: number;
}

export interface UpdateRestaurantResponse {
  id: number;
  name: string;
  last_edited_at: string;
  version: number;
  message: string;
}

export interface BusinessHoursDayUpdate {
  day_of_week: string;
  open_time?: string;
  break_start?: string;
  break_end?: string;
  last_order?: string;
  close_time?: string;
  is_closed?: boolean;
  special_note?: string;
  closes_next_day?: boolean;
  version?: number;
}

export interface UpdateRestaurantHoursRequest {
  hours: BusinessHoursDayUpdate[];
}

export interface UpdateRestaurantHoursResponse {
  restaurant_id: number;
  updated_count: number;
  message: string;
}

export interface CreateMenuRequest {
  name: string;
  price?: number;
  description?: string;
  category?: string;
  is_popular?: boolean;
  is_available?: boolean;
  display_order?: number;
}

export interface CreateMenuResponse {
  id: number;
  restaurant_id: number;
  name: string;
  created_at: string;
  message: string;
}

export interface UpdateMenuRequest {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  is_popular?: boolean;
  is_available?: boolean;
  display_order?: number;
  version: number;
}

export interface UpdateMenuResponse {
  id: number;
  restaurant_id: number;
  name: string;
  last_edited_at: string;
  version: number;
  message: string;
}

export interface DeleteMenuResponse {
  id: number;
  restaurant_id: number;
  deleted_at: string;
  message: string;
}

// 랜덤 메뉴 응답 타입
export interface RandomMenuResponse {
  menu: MenuItem;
  restaurant: RestaurantListItem;
}
