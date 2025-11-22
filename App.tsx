import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CafeteriaScreen from './screens/CafeteriaScreen';
import RestuarantScreen from './screens/Restaurant';
import CafeScreen from './screens/CafeScreen';
import ProfileScreen from './screens/ProfileScreen';
import FilterScreen from './screens/FilterScreen';
import RestaurantDetailScreen from './screens/RestaurantDetailScreen';
import CommentDetailScreen from './screens/CommentsDetailScreen';

import MyIcon from './assets/icon/tabicon/my.svg';
import CafeIcon from './assets/icon/tabicon/cafe.svg';
import BobIcon from './assets/icon/tabicon/bab.svg';
import SchoolIcon from './assets/icon/tabicon/school.svg';
import './global.css';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#000000',
      }}
    >
      <Tab.Screen
        name="Restaurant"
        component={RestuarantScreen}
        options={{
          title: '식당',
          tabBarIcon: ({ color, size }) => (
            <BobIcon width={size} height={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="SchoolRestaruant"
        component={CafeteriaScreen}
        options={{
          title: '학식',
          tabBarIcon: ({ color, size }) => (
            <SchoolIcon width={size} height={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Cafe"
        component={CafeScreen}
        options={{
          title: '카페',
          tabBarIcon: ({ color, size }) => (
            <CafeIcon width={size} height={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: '마이',
          tabBarIcon: ({ color, size }) => (
            <MyIcon width={size} height={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen
              name="Filter"
              component={FilterScreen}
              options={{
                headerShown: false,
                presentation: 'transparentModal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="RestaurantDetail"
              component={RestaurantDetailScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="CommentDetail"
              component={CommentDetailScreen}
              options={{
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
