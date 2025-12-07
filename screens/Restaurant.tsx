import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Alert, AppState, AppStateStatus, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import SearchBar from '@/components/SearchBar';
import AdBanner from '@/components/ui/AdBanner';
import RouletteModal from '@/components/ui/RouletteModal';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRestaurantListV2, useUpdateRestaurantOperatingStatus } from '@/api/restaurants/useRestaurant';
import { RestaurantListParams } from '@/api/restaurants/types';
import Icon from '@/components/Icon';
import { calculateDistance } from '@/utils/calculateDistance';
import { isRestaurantOpenAt, hasOperatingHoursOnDay } from '@/utils/operatingStatus';
import { getSafeErrorMessage } from '@/utils/errorHandler';

const SORT_OPTIONS = ['위치순', '별점순', '댓글순', '가격순'];

export default function RestuarantScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const queryClient = useQueryClient();
    const [filterParams, setFilterParams] = useState<Omit<RestaurantListParams, 'sort'>>({});
    // 운영시간 필터는 로컬에서 처리하므로 별도로 관리
    const [operatingTimeFilter, setOperatingTimeFilter] = useState<{ dayOfWeek?: string; hour?: string; minute?: string } | null>(null);
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
    // 별점과 댓글 변경사항을 반영하기 위해 리스트와 별점 쿼리 모두 무효화
    useFocusEffect(
        useCallback(() => {
            // 리스트 쿼리 새로고침 (별점 포함)
            refetch();
            // 별점 통계 쿼리도 무효화하여 최신 별점 반영
            queryClient.invalidateQueries({ queryKey: ['ratingStats'] });
        }, [refetch, queryClient])
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
            // 현재 적용된 필터 상태 전달 (스토리지와 동기화 확인용)
            currentFilter: {
                filterParams,
                operatingTimeFilter,
            },
            onApply: (params: RestaurantListParams) => {
                // sort, lat, lng, is_open_only, day_of_week, time 제거하고 필터 파라미터만 추출
                // 운영시간 필터는 로컬에서 처리하므로 서버 파라미터에서 제외
                const { sort, lat, lng, is_open_only, day_of_week, time, ...filterOnly } = params;
                
                // 운영시간 필터 정보 저장 (로컬 필터링용)
                // 요일만 선택한 경우도 포함
                if (day_of_week) {
                    const [hour, minute] = time ? time.split(':') : [undefined, undefined];
                    setOperatingTimeFilter({
                        dayOfWeek: day_of_week,
                        hour,
                        minute,
                    });
                } else {
                    setOperatingTimeFilter(null);
                }
                
                // 필터가 비어있는지 확인 (모든 값이 없거나 빈 배열/문자열인지)
                const hasOtherFilters = Object.keys(filterOnly).length > 0 && 
                    Object.values(filterOnly).some(value => {
                        if (Array.isArray(value)) return value.length > 0;
                        if (typeof value === 'string') return value.length > 0;
                        return value !== undefined && value !== null;
                    });
                
                const hasOperatingTimeFilter = !!day_of_week;
                const hasAnyFilter = hasOtherFilters || hasOperatingTimeFilter;
                
                if (hasAnyFilter) {
                    // 필터가 있으면 완전히 교체 (병합이 아닌 교체로 변경하여 이전 필터 제거)
                    // filterToParams에서 생성된 모든 필터 필드를 명시적으로 설정
                    const newFilterParams: any = {};
                    
                    // categories가 있으면 설정, 없으면 undefined (명시적으로 제거)
                    if (filterOnly.categories) {
                        newFilterParams.categories = filterOnly.categories;
                    }
                    
                    // affiliations가 있으면 설정, 없으면 undefined (명시적으로 제거)
                    if (filterOnly.affiliations) {
                        newFilterParams.affiliations = filterOnly.affiliations;
                    }
                    
                    // sub_category가 있으면 설정, 없으면 undefined (명시적으로 제거)
                    if (filterOnly.sub_category) {
                        newFilterParams.sub_category = filterOnly.sub_category;
                    }
                    
                    setFilterParams(newFilterParams);
                } else {
                    // 필터가 없으면 완전히 초기화
                    setFilterParams({});
                    setOperatingTimeFilter(null);
                    // 스토리지도 함께 초기화
                    AsyncStorage.removeItem('restaurantFilter').catch(error => {
                        console.error('Failed to remove filter from storage:', error);
                    });
                }
            },
        });
    };

    // 필터가 적용되었는지 확인 (sort 제외, 운영시간 필터 포함)
    const isFilterApplied = useMemo(() => {
        const hasOtherFilters = Object.keys(filterParams).some(key => key !== 'sort');
        const hasOperatingTimeFilter = operatingTimeFilter !== null;
        return hasOtherFilters || hasOperatingTimeFilter;
    }, [filterParams, operatingTimeFilter]);

    // 클라이언트에서 운영시간 필터링 및 정렬된 식당 리스트
    const sortedRestaurants = useMemo(() => {
        if (!data?.restaurants) return [];
        
        let restaurants = [...data.restaurants];
        
        // 운영시간 필터 적용 (로컬 필터링)
        if (operatingTimeFilter?.dayOfWeek) {
            if (operatingTimeFilter.hour && operatingTimeFilter.minute) {
                // 요일 + 시간 + 분 모두 선택한 경우: 해당 시간에 운영중인지 확인
                const filterTime = `${operatingTimeFilter.hour}:${operatingTimeFilter.minute}`;
                restaurants = restaurants.filter(restaurant => {
                    return isRestaurantOpenAt(
                        restaurant.business_hours,
                        operatingTimeFilter.dayOfWeek!,
                        filterTime
                    );
                });
            } else {
                // 요일만 선택한 경우: 해당 요일에 운영시간이 있는지만 확인
                restaurants = restaurants.filter(restaurant => {
                    return hasOperatingHoursOnDay(
                        restaurant.business_hours,
                        operatingTimeFilter.dayOfWeek!
                    );
                });
            }
        }
        
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
        } else if (sortOption === '댓글순') {
            // 댓글순 정렬 (내림차순)
            return restaurants.sort((a, b) => {
                if (a.comment_count === b.comment_count) {
                    // 댓글 수가 같으면 별점으로 정렬 (내림차순)
                    return b.average_rating - a.average_rating;
                }
                return b.comment_count - a.comment_count;
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
    }, [data?.restaurants, sortOption, userLocation, operatingTimeFilter]);

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

                {/* 로딩 상태 */}
                {isLoading && (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text className="text-gray-600 mt-4 text-base">식당 정보를 불러오는 중...</Text>
                    </View>
                )}

                {/* 에러 상태 */}
                {error && !isLoading && (
                    <View className="flex-1 items-center justify-center py-20 px-4">
                        <Icon name="warnning" width={64} height={64} color="#EF4444" />
                        <Text className="text-gray-900 font-semibold text-lg mt-4 text-center">
                            {(() => {
                                const axiosError = error as AxiosError;
                                if (axiosError?.code === 'NETWORK_ERROR' || axiosError?.message?.includes('Network') || !axiosError?.response) {
                                    return '네트워크 연결 오류';
                                }
                                if (axiosError?.response?.status === 500) {
                                    return '서버 오류가 발생했습니다';
                                }
                                return '데이터를 불러오는데 실패했습니다';
                            })()}
                        </Text>
                        <Text className="text-gray-500 text-sm mt-2 text-center">
                            {getSafeErrorMessage(error, '잠시 후 다시 시도해주세요')}
                        </Text>
                        <Pressable
                            onPress={() => refetch()}
                            className="mt-6 bg-blue-500 px-6 py-3 rounded-lg"
                        >
                            <Text className="text-white font-semibold">다시 시도</Text>
                        </Pressable>
                    </View>
                )}

                {/* 빈 상태 */}
                {!isLoading && !error && sortedRestaurants.length === 0 && (
                    <View className="flex-1 items-center justify-center py-20 px-4">
                        <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                            <Icon name="search" width={32} height={32} color="#9CA3AF" />
                        </View>
                        <Text className="text-gray-400 text-lg mt-2 text-center font-medium">
                            {isFilterApplied ? '필터 조건에 맞는 식당이 없습니다' : '등록된 식당이 없습니다'}
                        </Text>
                        <Text className="text-gray-400 text-sm mt-2 text-center">
                            {isFilterApplied ? '다른 조건으로 검색해보세요' : '첫 번째 식당을 등록해보세요'}
                        </Text>
                        {isFilterApplied && (
                            <Pressable
                                onPress={handleFilterPress}
                                className="mt-6 bg-gray-100 px-6 py-3 rounded-lg"
                            >
                                <Text className="text-gray-700 font-semibold">필터 수정하기</Text>
                            </Pressable>
                        )}
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
                            commentCount={restaurant.comment_count}
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
