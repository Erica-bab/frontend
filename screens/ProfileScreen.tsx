import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
    </View>
  );
}
