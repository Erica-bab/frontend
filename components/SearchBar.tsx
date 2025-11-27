import { View, Text, TextInput, Pressable, Animated, ActivityIndicator } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import Icon from '@/components/Icon';
import { useRestaurantSearch } from '@/api/restaurants/useRestaurant';
import { SearchResultItem } from '@/api/restaurants/types';
import MapModal from '@/components/cafeteria/MapModal';

interface SearchScreenProps {
  children?: React.ReactNode;
  onFilterPress?: () => void;
}

// 검색 결과 아이템 컴포넌트
function SearchResultCard({ item }: { item: SearchResultItem }) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  if (item.type === 'restaurant' && item.restaurant) {
    const restaurant = item.restaurant;
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
              <Text className="text-sm text-blue-500">
                ★ {restaurant.average_rating.toFixed(1)}
              </Text>
              <Text className="text-sm text-gray-400">
                ({restaurant.rating_count})
              </Text>
              {restaurant.average_price && (
                <Text className="text-sm text-gray-500">
                  평균 {Math.round(restaurant.average_price).toLocaleString()}원
                </Text>
              )}
            </View>
          </View>
          <Icon name="rightAngle" size={16} color="#9CA3AF" />
        </View>
      </Pressable>
    );
  }

  if (item.type === 'menu' && item.menu && item.restaurant) {
    return (
      <Pressable
        className="p-4 border-b border-gray-100 bg-white"
        onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.restaurant!.id })}
      >
        <View className="flex-row items-center">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">메뉴</Text>
              <Text className="text-base font-semibold">{item.menu.name}</Text>
            </View>
            <Text className="text-sm text-gray-500 mt-1">
              {item.restaurant.name}
            </Text>
            {item.menu.price && (
              <Text className="text-sm text-gray-600 mt-1">
                {item.menu.price.toLocaleString()}원
              </Text>
            )}
          </View>
          <Icon name="rightAngle" size={16} color="#9CA3AF" />
        </View>
      </Pressable>
    );
  }

  return null;
}

export default function SearchScreen({ children, onFilterPress }: SearchScreenProps) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [scrollY] = useState(new Animated.Value(0));
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationText, setLocationText] = useState('현재위치');
  const [showMapModal, setShowMapModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ latitude: 0, longitude: 0 });
  const STICKY_THRESHOLD = 30;

  const { data: searchData, isLoading: isSearching } = useRestaurantSearch({
    q: searchQuery,
    limit: 20,
  });

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          const [address] = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          if (address) {
            // 도로명 주소 포맷: 시/구/동/도로명/건물번호까지 표시
            const parts = [
              address.city,
              address.district,
              address.subregion,
              address.street,
              address.streetNumber,
              address.name // 건물명이나 상세 주소
            ].filter(Boolean);
            setLocationText(parts.join(' ') || '현재위치');
          }
        }
      } catch (error) {
        console.error('Failed to get location:', error);
      }
    })();
  }, []);

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
            <Text className="text-md font-semibold text-neutral-900">
              {locationText}
            </Text>
            <Icon name="dropdown" width={10} height={13} />
          </Pressable>
          <Pressable
            onPress={onFilterPress ?? (() => navigation.navigate('Filter'))}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="filter" />
          </Pressable>
        </View>
      </Animated.View>

      <View className='w-full px-5 py-2 bg-white border-b border-b-gray-100'>
        <View className='w-full rounded-full flex-row justify-between items-center px-4 py-2 bg-gray-100'>
          <TextInput
            placeholder="찾아라! 에리카의 맛집"
            className="flex-1 text-base p-1"
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            style={{ lineHeight: 16 }}
          />
          {searchText.length > 0 ? (
            <Pressable onPress={handleClearSearch}>
              <Icon name="cancel" size={15} color="#9CA3AF" />
            </Pressable>
          ) : (
            <Pressable onPress={handleSearch}>
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
        children
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
