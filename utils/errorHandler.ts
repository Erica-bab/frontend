import { AxiosError } from 'axios';

/**
 * API 에러를 사용자에게 안전하게 표시할 메시지로 변환
 * 
 * 보안상의 이유로 서버의 상세 에러 메시지는 숨기고,
 * 일반적인 에러 메시지만 표시합니다.
 */
export function getSafeErrorMessage(error: unknown, defaultMessage: string = '요청을 처리하는 중 오류가 발생했습니다.'): string {
  // Axios 에러인 경우
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    
    // HTTP 상태 코드에 따른 일반적인 메시지
    switch (status) {
      case 400:
        return '잘못된 요청입니다. 입력한 정보를 확인해주세요.';
      case 401:
        return '로그인이 필요합니다.';
      case 403:
        return '권한이 없습니다.';
      case 404:
        return '요청한 정보를 찾을 수 없습니다.';
      case 409:
        return '이미 존재하는 정보입니다.';
      case 422:
        return '입력한 정보가 올바르지 않습니다.';
      case 429:
        return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
      case 500:
      case 502:
      case 503:
      case 504:
        return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default:
        // 네트워크 에러인 경우
        if (!error.response) {
          return '네트워크 연결을 확인해주세요.';
        }
        return defaultMessage;
    }
  }
  
  // 일반 에러인 경우
  if (error instanceof Error) {
    // 개발 환경에서만 상세 메시지 표시 (프로덕션에서는 숨김)
    // @ts-ignore - React Native 전역 변수
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      return error.message;
    }
  }
  
  return defaultMessage;
}

