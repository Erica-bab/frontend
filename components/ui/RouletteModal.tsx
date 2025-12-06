import { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, Dimensions, ScrollView, ActivityIndicator, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, Easing } from 'react-native-reanimated';
import Icon from '@/components/Icon';
import { useRandomMenu } from '@/api/restaurants/useRestaurant';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { calculateDistance } from '@/utils/calculateDistance';
import { useQueryClient } from '@tanstack/react-query';
import { formatCategory } from '@/utils/formatCategory';
import { calculateOperatingStatus } from '@/utils/operatingStatus';
import { resolveImageUri } from '@/utils/image';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RouletteModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function RouletteModal({
  visible,
  onClose,
}: RouletteModalProps) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const queryClient = useQueryClient();
  const [isMultiTouch, setIsMultiTouch] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const rotation = useSharedValue(0);
  const ROULETTE_SCALE = 0.7; // 룰렛 크기 고정 (70%)
  const { data: randomMenuData, refetch: fetchRandomMenu, isLoading, isFetching } = useRandomMenu();

  // 현재 위치 가져오기
  useEffect(() => {
    if (visible) {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            setUserLocation({
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            });
          }
        } catch (error) {
          console.error('Failed to get location:', error);
        }
      })();
    }
  }, [visible]);

  // 룰렛 회전 애니메이션
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  // 룰렛 요소들 스케일 고정 (70% 크기)
  const rouletteScaleStyle = {
    transform: [{ scale: ROULETTE_SCALE }],
  };

  // 픽업 위치 고정
  const pickupTop = 30;

  // 룰렛 원판 위치 고정
  const roundBottom = 35;

  const handleSpin = async () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    
    // 회전 애니메이션 시작 (빠르게 시작해서 느려지게)
    rotation.value = withSequence(
      withTiming(360 * 5, {
        duration: 2000,
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(360 * 5 + 180, {
        duration: 500,
        easing: Easing.inOut(Easing.cubic),
      })
    );

    // API 호출
    setTimeout(async () => {
      await fetchRandomMenu();
      setIsSpinning(false);
    }, 2500);
  };

  // 모달이 열릴 때마다 룰렛 내용 초기화
  useEffect(() => {
    if (visible) {
      // 쿼리 데이터 초기화
      queryClient.removeQueries({ queryKey: ['restaurants', 'menus', 'random'] });
      rotation.value = 0;
      setIsSpinning(false);
    }
  }, [visible, queryClient]);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!visible) {
      rotation.value = 0;
      setIsSpinning(false);
    }
  }, [visible]);

  // 거리 계산
  const calculateRestaurantDistance = () => {
    if (!userLocation || !randomMenuData?.restaurant.location.latitude || !randomMenuData?.restaurant.location.longitude) {
      return null;
    }
    return calculateDistance(
      userLocation.lat,
      userLocation.lng,
      randomMenuData.restaurant.location.latitude!,
      randomMenuData.restaurant.location.longitude!
    );
  };

  const distance = calculateRestaurantDistance();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/40 justify-center items-center px-4"
        style={{ paddingTop: SCREEN_HEIGHT * 0.1, paddingBottom: SCREEN_HEIGHT * 0.1 }}
        onTouchStart={(e) => {
          if (e.nativeEvent.touches.length > 1) {
            setIsMultiTouch(true);
          }
        }}
        onPress={() => {
          if (!isMultiTouch) {
            onClose();
          }
          setIsMultiTouch(false);
        }}
      >
        <Pressable
          className="bg-white rounded-2xl"
          style={{ 
            width: SCREEN_WIDTH * 0.9,
            height: SCREEN_HEIGHT * 0.7,
          }}
          onPress={(e) => {
            e.stopPropagation();
          }}
        >
          {/* 고정 헤더 */}
          <View className="flex-row items-center justify-between px-6 pt-4 pb-0">
            <View className="flex-1" />
            <Text className="text-xl font-bold flex-1 text-center" numberOfLines={2}>오늘의 메뉴는?</Text>
            <Pressable
              className="flex-1 items-end"
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="cancel" width={24} height={24} />
            </Pressable>
          </View>
          
          {/* 룰렛 이미지 (항상 표시) */}
          <Animated.View 
            className="items-center justify-center relative self-center overflow-hidden" 
            style={{
              width: 242,
              height: 320,
              marginTop: 8,
            }}
          >
            {/* 스탠드 (최하단, 원판과 1/3 겹침) */}
            <Animated.View 
              className="absolute"
              style={[
                { bottom: 0, zIndex: 1 },
                rouletteScaleStyle
              ]}
            >
              <Icon name="stand" width={101} height={84} />
            </Animated.View>
            
            {/* 룰렛 원판 (중간, 회전 애니메이션) */}
            <Animated.View 
              className="absolute"
              style={[
                { 
                  width: 242, 
                  height: 242,
                  bottom: roundBottom,
                  zIndex: 2,
                }, 
                animatedStyle,
                rouletteScaleStyle
              ]}
            >
              <Icon name="round" width={242} height={242} />
            </Animated.View>
            
            {/* 픽업 화살표 (최상단, 원판과 반 정도 겹침) */}
            <Animated.View 
              className="absolute"
              style={[
                { top: pickupTop, zIndex: 3 },
                rouletteScaleStyle
              ]}
            >
              <Icon name="pickup" width={49} height={55} />
            </Animated.View>
          </Animated.View>

          {/* 상태별 컨텐츠 */}
          {!randomMenuData && !isSpinning && !isLoading && !isFetching && (
            <View style={{ flex: 1 }} className="items-center justify-center">
              <Pressable
                className="bg-blue-500 px-6 py-3 rounded-lg"
                onPress={handleSpin}
              >
                <Text className="text-white font-bold text-base">룰렛 돌리기</Text>
              </Pressable>
            </View>
          )}

          {(isSpinning || isLoading || isFetching) && (
            <View style={{ flex: 1 }} className="items-center justify-center">
              <Text className="text-gray-500">메뉴를 뽑는 중...</Text>
            </View>
          )}

          {randomMenuData && !isSpinning && !isLoading && !isFetching && (
            <View style={{ flex: 1, paddingHorizontal: 24 }}>
              <View className="items-center mb-4">
                <Pressable
                  className="bg-blue-500 px-6 py-3 rounded-lg"
                  onPress={() => {
                    rotation.value = 0;
                    handleSpin();
                  }}
                >
                  <Text className="text-white font-bold text-base">다시 뽑기</Text>
                </Pressable>
              </View>
              <ScrollView 
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={true}
                bounces={true}
                nestedScrollEnabled={true}
              >
                  {/* 뽑힌 메뉴 정보 */}
                  <View className="mb-4 p-4 bg-gray-50 rounded-lg flex-row">
                    <Pressable
                      className="flex-1"
                      onPress={() => {
                        navigation.navigate('RestaurantDetail', { restaurantId: randomMenuData.restaurant.id });
                        onClose();
                      }}
                    >
                      <Text className="text-base font-bold mb-2">오늘의 메뉴</Text>
                      <Text className="text-sm font-semibold text-gray-700 mb-2">{randomMenuData.restaurant.name}</Text>
                      <Text className="text-xl font-bold text-blue-600 mb-2">{randomMenuData.menu.name}</Text>
                      {randomMenuData.menu.price && (
                        <Text className="text-base text-gray-700 mb-2">{randomMenuData.menu.price.toLocaleString()}원</Text>
                      )}
                      <View className="flex-row items-center gap-2">
                        {(() => {
                          const operatingStatus = calculateOperatingStatus(randomMenuData.restaurant.business_hours);
                          const statusLabels = {
                            open: '영업중',
                            break_time: '브레이크타임',
                            order_end: '주문마감',
                            closed: '영업종료',
                          };
                          const statusText = statusLabels[operatingStatus.current.type];
                          return statusText && (
                            <Text className="text-sm text-gray-600">{statusText}</Text>
                          );
                        })()}
                        <Text className="text-sm text-blue-500">
                          ★ {randomMenuData.restaurant.average_rating.toFixed(1)}
                        </Text>
                        <Text className="text-sm text-gray-400">
                          ({randomMenuData.restaurant.rating_count})
                        </Text>
                      </View>
                    </Pressable>
                    <Pressable
                      className="justify-center items-center px-2"
                      onPress={() => {
                        navigation.navigate('RestaurantDetail', { restaurantId: randomMenuData.restaurant.id });
                        onClose();
                      }}
                    >
                      <Icon name="rightAngle" width={24} height={24} />
                    </Pressable>
                  </View>
              </ScrollView>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
