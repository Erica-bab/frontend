import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getBookmarks, removeBookmark, type Bookmark } from '@/services/bookmarkStoarge';
import { useRestaurantList } from '@/api/restaurants/useRestaurant';
import Icon from '@/components/Icon';

export default function BookmarkScreen() {
  const navigation = useNavigation();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: restaurantsData } = useRestaurantList();
  const restaurants = restaurantsData?.restaurants || [];

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const data = await getBookmarks();
      // 최신순 정렬 (timestamp 기준)
      setBookmarks(data.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  // 화면이 포커스될 때마다 북마크 새로고침
  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [])
  );

  const handleRemoveBookmark = async (restaurantId: string) => {
    try {
      await removeBookmark(restaurantId);
      await loadBookmarks();
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    }
  };

  const handleRestaurantPress = (restaurantId: string) => {
    (navigation.navigate as any)('RestaurantDetail', { restaurantId: Number(restaurantId) });
  };

  const getRestaurantInfo = (restaurantId: string) => {
    return restaurants?.find((r: any) => r.id === Number(restaurantId));
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-4">
        <Icon name="star" width={64} height={64} color="#D1D5DB" />
        <Text className="text-gray-400 text-lg mt-4">북마크한 식당이 없습니다</Text>
        <Text className="text-gray-400 text-sm mt-2">마음에 드는 식당을 북마크해보세요</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.restaurantId}
        contentContainerClassName="p-4"
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => {
          const restaurant = getRestaurantInfo(item.restaurantId);

          return (
            <Pressable
              onPress={() => handleRestaurantPress(item.restaurantId)}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-lg font-bold mb-1">
                    {restaurant?.name || '알 수 없는 식당'}
                  </Text>
                  {restaurant?.category && (
                    <Text className="text-gray-500 text-sm mb-2">
                      {restaurant.category}
                    </Text>
                  )}
                  {restaurant?.location?.address && (
                    <Text className="text-gray-400 text-xs">
                      {restaurant.location.address}
                    </Text>
                  )}
                  <Text className="text-gray-300 text-xs mt-2">
                    {new Date(item.timestamp).toLocaleDateString('ko-KR')}
                  </Text>
                </View>

                <Pressable
                  onPress={() => handleRemoveBookmark(item.restaurantId)}
                  className="ml-2 p-2"
                >
                  <Icon name="star" width={24} height={24} color="#FCD34D" />
                </Pressable>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
