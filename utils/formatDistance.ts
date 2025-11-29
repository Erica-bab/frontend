/**
 * 거리를 포맷팅하는 유틸리티 함수
 * @param distance 미터 단위 거리 (null 가능)
 * @returns 포맷팅된 거리 문자열 (예: "123m", "1.2km", "")
 */
export const formatDistance = (distance: number | null | undefined): string => {
  if (distance === null || distance === undefined) {
    return '';
  }

  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
};

