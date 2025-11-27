import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import SearchBar from '@/components/SearchBar';
import AdBanner from '@/components/ui/AdBanner';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRestaurantList } from '@/api/restaurants/useRestaurant';
import { RestaurantListParams } from '@/api/restaurants/types';
import Icon from '@/components/Icon';

const SORT_OPTIONS = ['위치순', '별점순'];
const SORT_MAP: Record<string, 'distance' | 'rating'> = {
    '위치순': 'distance',
    '별점순': 'rating',
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
            return coords;
        }
        return null;
    };

    useEffect(() => {
        (async () => {
            const coords = await requestLocationAndUpdate();
            if (coords && sortOption === '위치순') {
                setFilterParams(prev => ({
                    ...prev,
                    sort: 'distance', // 위치순 정렬 추가
                    lat: coords.lat,
                    lng: coords.lng
                }));
            }
        })();
    }, []);

    const handleFilterPress = () => {
        navigation.navigate('Filter', {
            onApply: (params: RestaurantListParams) => {
                setFilterParams(params);
            },
        });
    };

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-white">
            <SearchBar onFilterPress={handleFilterPress}>
                <AdBanner />
                <View className='self-end relative'>
                    <Pressable
                        className='flex-row gap-1 items-center p-2'
                        onPress={() => setIsSortOpen(!isSortOpen)}
                    >
                        <Text>{sortOption}</Text>
                        <Icon name="dropdown" width={10} height={13} />
                    </Pressable>
                    {isSortOpen && (
                        <View
                            className="absolute top-full right-0 mt-1 bg-white rounded-lg overflow-hidden"
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

                {data?.restaurants.map((restaurant) => (
                    <RestaurantCard
                        key={restaurant.id}
                        name={restaurant.name}
                        category={restaurant.category}
                        status={restaurant.status as '영업중' | '영업종료' | '브레이크타임'}
                        rating={restaurant.average_rating}
                        restaurantId={restaurant.id.toString()}
                        thumbnailUrls={restaurant.thumbnail_urls}
                    />
                ))}
            </SearchBar>
        </SafeAreaView>
    );
}
