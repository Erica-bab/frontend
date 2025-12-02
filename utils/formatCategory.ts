/**
 * 카테고리 문자열 또는 배열을 중간점(·)으로 구분된 형식으로 변환
 * 예: "패스트푸드중식" -> "패스트푸드 · 중식"
 * 예: ["패스트푸드", "중식"] -> "패스트푸드 · 중식"
 */
export function formatCategory(category: string | string[] | null | undefined): string {
  if (!category) return '';
  
  // 배열인 경우 직접 join
  if (Array.isArray(category)) {
    return category.filter(Boolean).join(' · ');
  }
  
  // 문자열인 경우 기존 로직 사용
  if (typeof category !== 'string') return '';
  
  // 알려진 카테고리 목록 (우선순위 순서대로)
  const categories = [
    '패스트푸드',
    '아시안',
    '프랜차이즈',
    '개인식당',
    '분식',
    '일식',
    '중식',
    '한식',
    '양식',
    '고기',
  ];
  
  const foundCategories: string[] = [];
  let remaining: string = String(category);
  
  // 각 카테고리를 순회하면서 매칭되는 부분 찾기
  for (const cat of categories) {
    if (remaining && remaining.includes(cat)) {
      foundCategories.push(cat);
      // 찾은 카테고리를 제거 (중복 방지)
      remaining = remaining.replace(cat, '');
    }
  }
  
  // 매칭된 카테고리가 있으면 중간점으로 연결
  if (foundCategories.length > 0) {
    return foundCategories.join(' · ');
  }
  
  // 매칭되지 않으면 원본 반환
  return category;
}

