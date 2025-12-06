/**
 * 공통 매핑 상수
 */

// 카테고리 매핑
export const CATEGORY_MAP: Record<string, number> = {
  '분식': 1,
  '패스트푸드': 2,
  '아시안': 3,
  '일식': 4,
  '중식': 5,
  '한식': 6,
  '양식': 7,
  '고기': 8,
};

// 요일 매핑
export const DAY_MAP: Record<string, number> = {
  '월요일': 1,
  '화요일': 2,
  '수요일': 3,
  '목요일': 4,
  '금요일': 5,
  '토요일': 6,
  '일요일': 7,
};

// 서브 카테고리 매핑
export const SUB_CATEGORY_MAP: Record<string, number> = {
  '개인식당': 1,
  '프랜차이즈': 2,
};

// 신고 사유 목록
export const REPORT_REASONS = [
  { label: '스팸', value: 'SPAM' },
  { label: '욕설/비방', value: 'ABUSE' },
  { label: '부적절한 내용', value: 'INAPPROPRIATE' },
  { label: '허위 정보', value: 'FAKE' },
  { label: '기타', value: 'OTHER' },
] as const;

