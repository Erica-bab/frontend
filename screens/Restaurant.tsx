import { View, Text, ScrollView } from 'react-native';
import SearchBar from '../components/SearchBar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RestaurantCard from '../components/RestaurantCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRestaurantList } from '../api/restaurants/useRestaurant';

export default function RestuarantScreen() {
    const { data, isLoading, error } = useRestaurantList();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <SearchBar />
            <ScrollView className="flex-1 bg-white">
                <Card variant="banner">
                    <View>
                        <Text className="text-white">{"일상 속 모든 순간, 한장으로\n더 똑똑한 소비의 시작 에리 체크카드"}</Text>
                        <Button>혜택 확인하기</Button>
                    </View>
                </Card>

                {isLoading && <Text className="p-4">로딩중...</Text>}
                {error && <Text className="p-4 text-red-500">에러 발생</Text>}

                {data?.restaurants.map((restaurant) => (
                    <RestaurantCard
                        key={restaurant.id}
                        name={restaurant.name}
                        category={restaurant.category}
                        status={restaurant.status as '영업중' | '영업종료' | '브레이크타임'}
                        rating={restaurant.average_rating}
                    />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}
