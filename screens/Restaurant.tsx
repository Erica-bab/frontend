import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Alert, AppState, AppStateStatus } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchBar from '@/components/SearchBar';
import AdBanner from '@/components/ui/AdBanner';
import RouletteModal from '@/components/ui/RouletteModal';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRestaurantListV2, useUpdateRestaurantOperatingStatus } from '@/api/restaurants/useRestaurant';
import { RestaurantListParams } from '@/api/restaurants/types';
import Icon from '@/components/Icon';
import { calculateDistance } from '@/utils/calculateDistance';

const SORT_OPTIONS = ['위치순', '별점순', '가격순'];

export default function RestuarantScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [filterParams, setFilterParams] = useState<Omit<RestaurantListParams, 'sort'>>({});
    const [sortOption, setSortOption] = useState<string>('위치순');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [showRouletteModal, setShowRouletteModal] = useState(false);
    const { data, isLoading, error, refetch } = useRestaurantListV2(filterParams);
    const { mutate: updateOperatingStatus } = useUpdateRestaurantOperatingStatus();
    const appState = useRef(AppState.currentState);

    const requestLocationAndUpdate = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            const coords = {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            };
            setUserLocation(coords);
            return coords;
        }
        return null;
    };

    // SearchBar에서 위치 업데이트 콜백
    const handleLocationUpdate = useCallback((coords: { lat: number; lng: number }) => {
        setUserLocation(coords);
        // 위치순 정렬은 클라이언트에서 처리하므로 API 호출 불필요
    }, []);

    useEffect(() => {
        (async () => {
            // 저장된 정렬 옵션 불러오기
            let currentSort = '위치순';
            try {
                const savedSort = await AsyncStorage.getItem('restaurantSortOption');
                if (savedSort && SORT_OPTIONS.includes(savedSort)) {
                    currentSort = savedSort;
                    setSortOption(savedSort);
                }
            } catch (error) {
                console.error('Failed to load sort option:', error);
            }

            const coords = await requestLocationAndUpdate();

            // 모든 정렬은 클라이언트에서 처리하므로 서버에 sort 파라미터 전송 안함
            // 위치순은 좌표가 필요하지만, 서버에는 전송하지 않음 (클라이언트에서 계산)
            if (currentSort === '위치순' && !coords) {
                // 위치 권한 없으면 별점순으로 변경
                setSortOption('별점순');
                await AsyncStorage.setItem('restaurantSortOption', '별점순');
            }
        })();
    }, []);

    // 화면이 포커스될 때마다 새로고침 (자세히 보기에서 돌아올 때)
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    // 앱이 포그라운드로 돌아올 때 새로고침
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // 앱이 포그라운드로 돌아올 때 위치 새로고침 + 식당 정보 새로고침
                await requestLocationAndUpdate();
                refetch();
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [refetch]);

    const handleFilterPress = () => {
        navigation.navigate('Filter', {
            onApply: (params: RestaurantListParams) => {
                // sort, lat, lng 제거하고 필터 파라미터만 추출
                const { sort, lat, lng, ...filterOnly } = params;
                
                // 필터가 비어있는지 확인 (모든 값이 없거나 빈 배열/문자열인지)
                const hasFilter = Object.keys(filterOnly).length > 0 && 
                    Object.values(filterOnly).some(value => {
                        if (Array.isArray(value)) return value.length > 0;
                        if (typeof value === 'string') return value.length > 0;
                        return value !== undefined && value !== null;
                    });
                
                if (hasFilter) {
                    // 필터가 있으면 병합
                    setFilterParams(prev => ({
                        ...prev,
                        ...filterOnly,
                    }));
                } else {
                    // 필터가 없으면 완전히 초기화
                    setFilterParams({});
                }
            },
        });
    };

    // 필터가 적용되었는지 확인 (sort 제외)
    const isFilterApplied = useMemo(() => {
        return Object.keys(filterParams).some(key => key !== 'sort');
    }, [filterParams]);

    // 클라이언트에서 정렬된 식당 리스트
    const sortedRestaurants = useMemo(() => {
        if (!data?.restaurants) return [];
        
        const restaurants = [...data.restaurants];
        
        if (sortOption === '위치순' && userLocation) {
            // 거리순 정렬 (클라이언트에서 계산)
            return restaurants.sort((a, b) => {
                const aDistance = a.location.latitude && a.location.longitude
                    ? calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        a.location.latitude,
                        a.location.longitude
                    )
                    : Infinity;
                const bDistance = b.location.latitude && b.location.longitude
                    ? calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        b.location.latitude,
                        b.location.longitude
                    )
                    : Infinity;
                return aDistance - bDistance;
            });
        } else if (sortOption === '별점순') {
            // 별점순 정렬 (내림차순)
            return restaurants.sort((a, b) => {
                if (a.average_rating === b.average_rating) {
                    // 별점이 같으면 리뷰 수로 정렬 (내림차순)
                    return b.rating_count - a.rating_count;
                }
                return b.average_rating - a.average_rating;
            });
        } else if (sortOption === '가격순') {
            // 가격순 정렬 (오름차순, 가격이 없는 경우 맨 뒤)
            return restaurants.sort((a, b) => {
                const aPrice = a.average_price ?? null;
                const bPrice = b.average_price ?? null;
                if (aPrice === null && bPrice === null) return 0;
                if (aPrice === null) return 1;
                if (bPrice === null) return -1;
                return aPrice - bPrice;
            });
        }
        
        // 기본 정렬 (ID 내림차순)
        return restaurants;
    }, [data?.restaurants, sortOption, userLocation]);

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-white">
            <SearchBar
                onFilterPress={handleFilterPress}
                isFilterApplied={isFilterApplied}
                filterResultCount={sortedRestaurants.length}
                onLocationUpdate={handleLocationUpdate}
                onRefresh={refetch}
            >
                <AdBanner onRoulettePress={() => setShowRouletteModal(true)} />
                <View className='self-end relative'>
                    <Pressable
                        className='flex-row gap-1 items-center p-2 mr-2'
                        onPress={() => setIsSortOpen(!isSortOpen)}
                    >
                        <Text>{sortOption}</Text>
                        <Icon name="dropdown" width={10} height={13} />
                    </Pressable>
                    {isSortOpen && (
                        <View
                            className="absolute top-full right-0 mt-1 bg-white rounded-lg overflow-hidden mr-2"
                            style={{
                                borderWidth: 1,
                                borderColor: 'rgba(226, 232, 240, 1)',
                                zIndex: 1000,
                            }}
                        >
                            <ScrollView>
                                {SORT_OPTIONS.map((option) => (
                                    <Pressable
                                        key={option}
                                        onPress={async () => {
                                            setSortOption(option);
                                            setIsSortOpen(false);

                                            // 정렬 옵션 저장
                                            try {
                                                await AsyncStorage.setItem('restaurantSortOption', option);
                                            } catch (error) {
                                                console.error('Failed to save sort option:', error);
                                            }

                                            if (option === '위치순') {
                                                let coords = userLocation;
                                                if (!coords) {
                                                    coords = await requestLocationAndUpdate();
                                                }
                                                if (!coords) {
                                                    Alert.alert('위치 권한 필요', '위치순 정렬을 사용하려면 위치 권한이 필요합니다.');
                                                    setSortOption('별점순');
                                                    await AsyncStorage.setItem('restaurantSortOption', '별점순');
                                                }
                                            }
                                            // 모든 정렬은 클라이언트에서 처리하므로 서버 파라미터 변경 불필요
                                        }}
                                        className="px-4 py-3 border-b border-gray-100"
                                    >
                                        <Text className={`text-base ${sortOption === option ? 'font-bold text-blue-600' : 'text-black'}`}>
                                            {option}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

                {isLoading && <Text className="p-4">로딩중...</Text>}
                {error && <Text className="p-4 text-red-500">에러 발생</Text>}

                {!isLoading && !error && sortedRestaurants.length === 0 && (
                    <View className="flex-1 items-center justify-center p-8">
                        <Text className="text-gray-400 text-lg">검색 결과가 없습니다</Text>
                    </View>
                )}
                {sortedRestaurants.map((restaurant) => {
                    // 클라이언트에서 거리 계산
                    const distance = userLocation && restaurant.location.latitude && restaurant.location.longitude
                        ? calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            restaurant.location.latitude,
                            restaurant.location.longitude
                        )
                        : null;

                    return (
                        <RestaurantCard
                            key={restaurant.id}
                            name={restaurant.name}
                            category={restaurant.category}
                            businessHours={restaurant.business_hours}
                            rating={restaurant.average_rating}
                            onStatusExpired={() => {
                                // 운영 상태는 클라이언트에서 계산하므로 새로고침 불필요
                                // 필요시 refetch() 호출
                            }}
                            restaurantId={restaurant.id.toString()}
                            thumbnailUrls={restaurant.thumbnail_urls}
                            comment={restaurant.popular_comment?.content}
                            distance={distance}
                        />
                    );
                })}
            </SearchBar>
            
            {/* 룰렛 모달 */}
            <RouletteModal
                visible={showRouletteModal}
                onClose={() => setShowRouletteModal(false)}
            />
        </SafeAreaView>
    );
}
