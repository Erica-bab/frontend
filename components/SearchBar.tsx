import { View, Text } from 'react-native';

export default function SearchScreen() {
  return (
    <View className="w-full flex-start items-center justify-center bg-blue-500">
      <Text className="text-2xl font-bold text-green-600">검색 창</Text>
      <Text className="text-gray-600 mt-2">검색하세요</Text>
    </View>
  );
}
