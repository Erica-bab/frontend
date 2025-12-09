/**
 * 이미지 관련 유틸리티 함수
 */

/**
 * 이미지 URI를 완전한 URL로 변환
 * @param uri 상대 경로 또는 절대 경로
 * @returns 완전한 URL 또는 null
 */
export function resolveImageUri(uri?: string | null): string | null {
  if (!uri) return null;
  const path = uri.startsWith('/') ? uri.slice(1) : uri;
  return `https://에리카밥.com/${path}`;
}

/**
 * 이미지 배열에서 랜덤으로 지정된 개수만큼 선택
 * @param images 이미지 배열
 * @param count 선택할 개수
 * @returns 선택된 이미지 배열
 */
export function getRandomThumbnails(images: string[], count: number): string[] {
  if (images.length <= count) return images;
  
  // 배열을 복사하고 셔플
  const shuffled = [...images].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

