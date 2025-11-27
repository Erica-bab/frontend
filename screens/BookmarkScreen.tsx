import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMyBookmarks, useToggleBookmark } from '@/api/user/useUserActivity';
import { useAuth } from '@/api/auth/useAuth';
import Icon from '@/components/Icon';
import { AxiosError } from 'axios';

export default function BookmarkScreen() {
  const navigation = useNavigation();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const { data: bookmarks = [], isLoading, error, refetch } = useMyBookmarks(1, 100, isAuthenticated === true);
  const { mutate: toggleBookmark } = useToggleBookmark();

  // 403 에러 처리 (로그인 필요)
  const is403Error = error instanceof Error && (error as AxiosError)?.response?.status === 403;

  const handleRemoveBookmark = async (restaurantId: number) => {
    toggleBookmark(restaurantId, {
      onSuccess: () => {
        refetch();
      },
      onError: (err) => {
        if ((err as AxiosError)?.response?.status === 403) {
          (navigation.navigate as any)('Login');
        }
        console.error('Failed to remove bookmark:', err);
      },
    });
  };

  const handleRestaurantPress = (restaurantId: number) => {
    (navigation.navigate as any)('RestaurantDetail', { restaurantId });
  };

  // 로그인 안됨 또는 403 에러
  if (is403Error || (!isAuthLoading && !isAuthenticated)) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-4">
        <Icon name="star" width={64} height={64} color="#D1D5DB" />
        <Text className="text-gray-400 text-lg mt-4">로그인이 필요합니다</Text>
        <Text className="text-gray-400 text-sm mt-2">북마크를 보려면 로그인해주세요</Text>
        <Pressable
          className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
          onPress={() => (navigation.navigate as any)('Login')}
        >
          <Text className="text-white font-semibold">로그인하기</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading || isAuthLoading) {
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
        keyExtractor={(item) => String(item.restaurant_id)}
        contentContainerClassName="p-4"
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => {
          return (
            <Pressable
              onPress={() => handleRestaurantPress(item.restaurant_id)}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-lg font-bold mb-1">
                    {item.restaurant_name || '알 수 없는 식당'}
                  </Text>
                  {item.restaurant_category && (
                    <Text className="text-gray-500 text-sm mb-2">
                      {item.restaurant_category}
                    </Text>
                  )}
                  {item.restaurant_address && (
                    <Text className="text-gray-400 text-xs">
                      {item.restaurant_address}
                    </Text>
                  )}
                  <Text className="text-gray-300 text-xs mt-2">
                    {new Date(item.created_at).toLocaleDateString('ko-KR')}
                  </Text>
                </View>

                <Pressable
                  onPress={() => handleRemoveBookmark(item.restaurant_id)}
                  className="ml-2 p-2"
                >
                  <Icon name="bookmark" width={24} height={24} color="#3B82F6" />
                </Pressable>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
