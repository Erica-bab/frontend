import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBar from '../components/SearchBar'

export default function CafeteriaScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View>
        <SearchBar />
        <Text className="text-2xl font-bold text-blue-600">학식 화면</Text>
        <Text className="text-gray-600 mt-2">환영합니다!</Text>
      </View>
    </SafeAreaView>
  );
}
