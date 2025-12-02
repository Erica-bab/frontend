import { View, Text, TextInput, Pressable, Animated, ActivityIndicator, RefreshControl, AppState, AppStateStatus } from 'react-native';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import Icon from '@/components/Icon';
import { useRestaurantSearch } from '@/api/restaurants/useRestaurant';
import { SearchResultItem } from '@/api/restaurants/types';
import MapModal from '@/components/cafeteria/MapModal';
import { formatDistance } from '@/utils/formatDistance';

interface SearchScreenProps {
  children?: React.ReactNode;
  onFilterPress?: () => void;
  isFilterApplied?: boolean;
  filterResultCount?: number;
  onLocationUpdate?: (coords: { lat: number; lng: number }) => void;
  onRefresh?: () => void;
}

// 검색 결과 아이템 컴포넌트
function SearchResultCard({ item }: { item: SearchResultItem }) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  if (item.type === 'restaurant' && item.restaurant) {
    const restaurant = item.restaurant;
    
    // 운영 상태 레이블
    const statusLabels = {
      open: '영업중',
      break_time: '브레이크타임',
      order_end: '주문마감',
      closed: '영업종료',
    };
    const statusText = restaurant.operating_status 
      ? statusLabels[restaurant.operating_status.current.type] 
      : null;

    return (
      <Pressable
        className="p-4 border-b border-gray-100 bg-white"
        onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id })}
      >
        <View className="flex-row items-center">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-semibold">{restaurant.name}</Text>
              <Text className="text-xs text-gray-500">{restaurant.category}</Text>
            </View>
            <Text className="text-sm text-gray-500 mt-1">
              {restaurant.location.address}
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              {statusText && (
                <Text className="text-sm text-gray-600">{statusText}</Text>
              )}
              <Text className="text-sm text-blue-500">
                ★ {restaurant.average_rating.toFixed(1)}
              </Text>
              <Text className="text-sm text-gray-400">
                ({restaurant.rating_count})
              </Text>
            </View>
            {restaurant.average_price && (
              <Text className="text-sm text-gray-500 mt-1">
                평균 {Math.round(restaurant.average_price).toLocaleString()}원
              </Text>
            )}
          </View>
          <Icon name="rightAngle" size={16} color="#9CA3AF" />
        </View>
      </Pressable>
    );
  }

  if (item.type === 'menu' && item.menu && item.restaurant) {
    const restaurant = item.restaurant;
    
    // 운영 상태 레이블
    const statusLabels = {
      open: '영업중',
      break_time: '브레이크타임',
      order_end: '주문마감',
      closed: '영업종료',
    };
    const statusText = restaurant.operating_status 
      ? statusLabels[restaurant.operating_status.current.type] 
      : null;

    return (
      <Pressable
        className="p-4 border-b border-gray-100 bg-white"
        onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id })}
      >
        <View className="flex-row items-center">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">메뉴</Text>
              <Text className="text-base font-semibold">{item.menu.name}</Text>
            </View>
            <Text className="text-sm text-gray-500 mt-1">
              {restaurant.name}
            </Text>
            {item.menu.price && (
              <Text className="text-sm text-gray-600 mt-1">
                {item.menu.price.toLocaleString()}원
              </Text>
            )}
            <View className="flex-row items-center gap-2 mt-1">
              {statusText && (
                <Text className="text-sm text-gray-600">{statusText}</Text>
              )}
              <Text className="text-sm text-blue-500">
                ★ {restaurant.average_rating.toFixed(1)}
              </Text>
              <Text className="text-sm text-gray-400">
                ({restaurant.rating_count})
              </Text>
            </View>
          </View>
          <Icon name="rightAngle" size={16} color="#9CA3AF" />
        </View>
      </Pressable>
    );
  }

  return null;
}


export default function SearchScreen({ children, onFilterPress, isFilterApplied, filterResultCount, onLocationUpdate, onRefresh }: SearchScreenProps) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [scrollY] = useState(new Animated.Value(0));
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationText, setLocationText] = useState('현재위치');
  const [showMapModal, setShowMapModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ latitude: 0, longitude: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const locationUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);
  const STICKY_THRESHOLD = 30;

  const { data: searchData, isLoading: isSearching } = useRestaurantSearch({
    q: searchQuery,
    limit: 20,
    lat: currentLocation.latitude !== 0 ? currentLocation.latitude : undefined,
    lng: currentLocation.longitude !== 0 ? currentLocation.longitude : undefined,
  });

  // 위치 업데이트 로직 (RefreshControl 트리거 없음)
  const updateLocation = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    }
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setCurrentLocation(coords);

        const [address] = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        if (address) {
          // 주소를 상세하게 표시
          let addressText = '';
          
          if (address.formattedAddress) {
            // formattedAddress 사용 시 중복 단어 제거
            const parts = address.formattedAddress.split(' ');
            const uniqueParts: string[] = [];
            const seen = new Set<string>();
            
            for (const part of parts) {
              // 공백 제거 후 중복 체크
              const trimmedPart = part.trim();
              if (trimmedPart && !seen.has(trimmedPart)) {
                seen.add(trimmedPart);
                uniqueParts.push(trimmedPart);
              }
            }
            
            addressText = uniqueParts.join(' ');
          } else {
            // formattedAddress가 없으면 수동으로 조합 (중복 제거)
            const addressParts = [
              address.region,
              address.city,
              address.district,
              address.subregion,
              address.street,
              address.streetNumber
            ].filter(Boolean);
            
            // 중복 제거
            const uniqueParts: string[] = [];
            const seen = new Set<string>();
            
            for (const part of addressParts) {
              if (part && !seen.has(part)) {
                seen.add(part);
                uniqueParts.push(part);
              }
            }
            
            addressText = uniqueParts.join(' ');
          }
          
          // 30글자 넘어가면 ... 으로 잘라서 표시
          if (addressText.length > 30) {
            addressText = addressText.substring(0, 30) + '...';
          }
          
          setLocationText(addressText || '현재위치');
        }
        
        // 부모 컴포넌트에 위치 업데이트 알림
        onLocationUpdate?.({ lat: coords.latitude, lng: coords.longitude });
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    } finally {
      if (showRefreshIndicator) {
        setRefreshing(false);
      }
    }
  }, [onLocationUpdate]);

  // Pull-to-refresh용 위치 새로고침 (RefreshControl 트리거)
  const refreshLocation = useCallback(async () => {
    await updateLocation(true);
  }, [updateLocation]);

  useEffect(() => {
    // 초기 위치 가져오기 (RefreshControl 트리거 없음)
    updateLocation(false);

    // 1분마다 주기적으로 위치 업데이트 (RefreshControl 트리거 없음)
    locationUpdateIntervalRef.current = setInterval(() => {
      updateLocation(false);
    }, 60 * 1000); // 1분

    // 5분마다 위치 자동 새로고침
    locationUpdateIntervalRef.current = setInterval(() => {
      refreshLocation();
    }, 5 * 60 * 1000); // 5분 = 5 * 60 * 1000ms

    return () => {
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
      }
    };
  }, [updateLocation]);

  // 앱이 포그라운드로 돌아올 때 위치 새로고침 (RefreshControl 트리거 없음)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // 앱이 포그라운드로 돌아올 때 위치 새로고침 (RefreshControl 트리거 없음)
        updateLocation(false);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [updateLocation]);

  const handleRefresh = useCallback(async () => {
    await refreshLocation();
    onRefresh?.();
  }, [refreshLocation, onRefresh]);

  const handleSearch = useCallback(() => {
    if (searchText.trim()) {
      setSearchQuery(searchText.trim());
    }
  }, [searchText]);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    setSearchQuery('');
  }, []);

  const isSearchMode = searchQuery.length > 0;

  return (
    <>
    <Animated.ScrollView
      stickyHeaderIndices={[1]}
      className="flex-1 bg-[rgba(248, 250, 252, 1)]"
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
      bounces={true}
      bouncesZoom={false}
      alwaysBounceVertical={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#3B82F6"
          colors={['#3B82F6']}
        />
      }
    >
      <Animated.View
        className='w-full px-5 py-1 bg-white'
        style={{
          opacity: scrollY.interpolate({
            inputRange: [0, STICKY_THRESHOLD],
            outputRange: [1, 0],
            extrapolate: 'clamp',
          }),
          height: scrollY.interpolate({
            inputRange: [0, STICKY_THRESHOLD],
            outputRange: [40, 0],
            extrapolate: 'clamp',
          }),
        }}
      >
        <View className='w-full flex-row justify-between items-center h-full'>
          <Pressable
            className="flex-row items-center justify-center h-full gap-2"
            onPress={() => setShowMapModal(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text 
              className="text-md font-semibold text-neutral-900"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {locationText.length > 40 ? `${locationText.substring(0, 40)}...` : locationText}
            </Text>
            <Icon name="dropdown" width={10} height={13} />
          </Pressable>
          <Pressable
            onPress={onFilterPress ?? (() => navigation.navigate('Filter'))}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name={isFilterApplied ? "filterSelected" : "filter"} />
          </Pressable>
        </View>
      </Animated.View>

      <View className='w-full px-5 py-2 bg-white border-b border-b-gray-100'>
        <View className='w-full rounded-full flex-row justify-between items-center px-4 py-2 bg-gray-100'>
          <TextInput
            placeholder="찾아라! 에리카의 맛집"
            className="flex-1 text-base"
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            style={{ lineHeight: 16, paddingVertical: 8, paddingHorizontal: 4 }}
            editable={true}
          />
          {searchText.length > 0 ? (
            <Pressable 
              onPress={handleClearSearch}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Icon name="cancel" size={15} color="#9CA3AF" />
            </Pressable>
          ) : (
            <Pressable 
              onPress={handleSearch}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Icon name="search" width={35}/>
            </Pressable>
          )}
        </View>
      </View>

      {/* 검색 모드일 때 검색 결과 표시 */}
      {isSearchMode ? (
        <View className="flex-1">
          {isSearching ? (
            <View className="p-8 items-center">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-500 mt-2">검색 중...</Text>
            </View>
          ) : searchData && searchData.results.length > 0 ? (
            <View>
              <View className="px-4 py-3 bg-gray-50">
                <Text className="text-sm text-gray-600">
                  "{searchData.query}" 검색 결과 {searchData.total}개
                  {searchData.restaurants_count > 0 && ` (식당 ${searchData.restaurants_count}개`}
                  {searchData.menus_count > 0 && `, 메뉴 ${searchData.menus_count}개`}
                  {(searchData.restaurants_count > 0 || searchData.menus_count > 0) && ')'}
                </Text>
              </View>
              {searchData.results.map((item, index) => (
                <SearchResultCard key={`${item.type}-${index}`} item={item} />
              ))}
            </View>
          ) : (
            <View className="p-8 items-center">
              <Text className="text-gray-500">검색 결과가 없습니다</Text>
            </View>
          )}
        </View>
      ) : (
        // 검색 모드가 아닐 때 기존 children 표시
        <>
          {filterResultCount !== undefined && (
            <View className="px-4 py-3 bg-gray-50">
              <Text className="text-sm text-gray-600">
                {isFilterApplied ? `필터 적용 결과 ${filterResultCount}개` : `식당 ${filterResultCount}개`}
              </Text>
            </View>
          )}
          {children}
        </>
      )}
    </Animated.ScrollView>

    <MapModal
      visible={showMapModal}
      setVisible={setShowMapModal}
      location={locationText}
      latitude={currentLocation.latitude}
      longtitude={currentLocation.longitude}
      viewName="현재 위치"
    />
    </>
  );
}
