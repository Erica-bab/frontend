import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchBar from '@/components/SearchBar';
import AdBanner from '@/components/ui/AdBanner';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRestaurantList } from '@/api/restaurants/useRestaurant';
import { RestaurantListParams } from '@/api/restaurants/types';
import Icon from '@/components/Icon';

const SORT_OPTIONS = ['위치순', '별점순', '가격순'];
const SORT_MAP: Record<string, 'distance' | 'rating' | 'price'> = {
    '위치순': 'distance',
    '별점순': 'rating',
    '가격순': 'price',
};

export default function RestuarantScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [filterParams, setFilterParams] = useState<RestaurantListParams>({});
    const [sortOption, setSortOption] = useState<string>('위치순');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const { data, isLoading, error } = useRestaurantList(filterParams);

    const requestLocationAndUpdate = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            const coords = {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            };
            setUserLocation(coords);
            
            // 위치순 정렬일 때 필터 파라미터 업데이트
            if (sortOption === '위치순') {
                setFilterParams(prev => ({
                    ...prev,
                    sort: 'distance',
                    lat: coords.lat,
                    lng: coords.lng,
                }));
            }
            
            return coords;
        }
        return null;
    };

    // SearchBar에서 위치 업데이트 콜백
    const handleLocationUpdate = useCallback((coords: { lat: number; lng: number }) => {
        setUserLocation(coords);
        
        // 위치순 정렬일 때 필터 파라미터 업데이트
        if (sortOption === '위치순') {
            setFilterParams(prev => ({
                ...prev,
                sort: 'distance',
                lat: coords.lat,
                lng: coords.lng,
            }));
        }
    }, [sortOption]);

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

            // 저장된 정렬 옵션에 따라 필터 적용
            if (currentSort === '위치순') {
                if (coords) {
                    setFilterParams(prev => ({
                        ...prev,
                        sort: 'distance',
                        lat: coords.lat,
                        lng: coords.lng
                    }));
                } else {
                    // 위치 권한 없으면 별점순으로 변경
                    setSortOption('별점순');
                    await AsyncStorage.setItem('restaurantSortOption', '별점순');
                    setFilterParams(prev => ({ ...prev, sort: 'rating' }));
                }
            } else {
                // 위치순이 아닌 경우 (별점순, 가격순)
                setFilterParams(prev => ({ ...prev, sort: SORT_MAP[currentSort] }));
            }
        })();
    }, []);

    const handleFilterPress = () => {
        navigation.navigate('Filter', {
            onApply: (params: RestaurantListParams) => {
                // 기존 파라미터(sort, lat, lng)를 유지하면서 필터 파라미터 병합
                setFilterParams(prev => ({
                    ...prev,
                    ...params,
                }));
            },
        });
    };

    // 필터가 적용되었는지 확인
    const isFilterApplied = useMemo(() => {
        return Object.keys(filterParams).length > 0 &&
               Object.keys(filterParams).some(key =>
                   key !== 'sort' && key !== 'lat' && key !== 'lng'
               );
    }, [filterParams]);

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-white">
            <SearchBar
                onFilterPress={handleFilterPress}
                isFilterApplied={isFilterApplied}
                filterResultCount={data?.restaurants.length}
                onLocationUpdate={handleLocationUpdate}
            >
                <AdBanner />
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
                                                if (coords) {
                                                    setFilterParams(prev => ({
                                                        ...prev,
                                                        sort: SORT_MAP[option],
                                                        lat: coords.lat,
                                                        lng: coords.lng,
                                                    }));
                                                } else {
                                                    Alert.alert('위치 권한 필요', '위치순 정렬을 사용하려면 위치 권한이 필요합니다.');
                                                    setSortOption('별점순');
                                                    await AsyncStorage.setItem('restaurantSortOption', '별점순');
                                                    setFilterParams(prev => ({ ...prev, sort: 'rating' }));
                                                }
                                            } else {
                                                setFilterParams(prev => ({ ...prev, sort: SORT_MAP[option] }));
                                            }
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

                {!isLoading && !error && data?.restaurants.length === 0 && (
                    <View className="flex-1 items-center justify-center p-8">
                        <Text className="text-gray-400 text-lg">검색 결과가 없습니다</Text>
                    </View>
                )}

                {data?.restaurants.map((restaurant) => (
                    <RestaurantCard
                        key={restaurant.id}
                        name={restaurant.name}
                        category={restaurant.category}
                        operatingStatus={restaurant.operating_status}
                        rating={restaurant.average_rating}
                        restaurantId={restaurant.id.toString()}
                        thumbnailUrls={restaurant.thumbnail_urls}
                        comment={restaurant.popular_comment?.content}
                        distance={restaurant.location.distance}
                    />
                ))}
            </SearchBar>
        </SafeAreaView>
    );
}
