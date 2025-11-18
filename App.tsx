import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CafeteriaScreen from './screens/CafeteriaScreen';
import RestuarantScreen from './screens/Restaurant';
import CafeScreen from './screens/CafeScreen';
import ProfileScreen from './screens/ProfileScreen';
import './global.css';

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView className="flex-1 bg-white">
        <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#3b82f6',
            tabBarInactiveTintColor: '#9ca3af',
            headerShown: false,
          }}
        >
          <Tab.Screen
            name="SchoolRestaruant"
            component={CafeteriaScreen}
            options={{
              title: '학식',
              tabBarLabel: '학식',
            }}
          />
          <Tab.Screen
            name="Restaurant"
            component={RestuarantScreen}
            options={{
              title: '식당',
              tabBarLabel: '식당',
            }}
          />
          <Tab.Screen
            name="Cafe"
            component={CafeScreen}
            options={{
              title: '카페',
              tabBarLabel: '카페'
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              title: '마이',
              tabBarLabel: '마이'
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
    </QueryClientProvider>
  );
}