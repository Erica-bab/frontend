import { useState, useRef, useEffect } from 'react';
import { View, Image, ImageProps, ActivityIndicator, StyleSheet, LayoutChangeEvent, Dimensions } from 'react-native';

interface LazyImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string } | number;
  placeholder?: React.ReactNode;
  threshold?: number; // 뷰포트에서 얼마나 먼저 로드할지 (픽셀)
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

/**
 * 뷰포트에 보일 때만 이미지를 로드하는 레이지 로딩 이미지 컴포넌트
 * FlatList와 함께 사용할 때는 FlatList의 기본 레이지 로딩과 함께 작동합니다.
 */
export default function LazyImage({
  source,
  placeholder,
  threshold = 300, // 기본값: 뷰포트에서 300px 전에 로드 시작
  style,
  ...props
}: LazyImageProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const viewRef = useRef<View>(null);
  const layoutRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    layoutRef.current = { x, y, width, height };

    // 간단한 체크: 뷰포트 내에 있는지 확인
    // ScrollView나 FlatList 내부에서는 부모의 스크롤 위치를 정확히 알기 어려우므로
    // 일단 마운트되면 로드하되, FlatList의 레이지 로딩과 함께 사용
    if (!shouldLoad) {
      // y 좌표가 화면 높이의 2배 이내면 로드 (대략적인 추정)
      if (y < SCREEN_HEIGHT * 2) {
        setShouldLoad(true);
      }
    }
  };

  // 폴백: 컴포넌트가 마운트되면 일정 시간 후 자동 로드
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!shouldLoad) {
        setShouldLoad(true);
      }
    }, 300); // 0.3초 후 폴백 (더 빠른 로딩)

    return () => clearTimeout(fallbackTimer);
  }, [shouldLoad]);

  const defaultPlaceholder = (
    <View style={[styles.placeholder, style]}>
      <ActivityIndicator size="small" color="#9CA3AF" />
    </View>
  );

  if (!shouldLoad) {
    return (
      <View ref={viewRef} style={style} onLayout={handleLayout}>
        {placeholder || defaultPlaceholder}
      </View>
    );
  }

  return (
    <View ref={viewRef} style={style} onLayout={handleLayout}>
      {!isLoaded && !isError && (placeholder || defaultPlaceholder)}
      <Image
        {...props}
        source={source}
        style={[style, !isLoaded && styles.hidden]}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hidden: {
    opacity: 0,
  },
});

