import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as Linking from 'expo-linking';

import CafeteriaScreen from './screens/CafeteriaScreen';
import RestuarantScreen from './screens/Restaurant';
import ProfileScreen from './screens/ProfileScreen';
import FilterScreen from './screens/FilterScreen';
import LoginScreen from './screens/LoginScreen';
import RestaurantDetailScreen from './screens/RestaurantDetailScreen';
import RestaurantEditScreen from './screens/RestaurantEditScreen';
import CommentDetailScreen from './screens/CommentsDetailScreen';
import BookmarkScreen from './screens/BookmarkScreen';
import AddInfoScreen from './screens/AddInfo';

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
        name="Profile"
        component={ProfileScreen}
        options={{
          title: '마이',
          headerShown: true,
          headerTitle: '마이페이지',
          headerStyle: { backgroundColor: '#3B82F6' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
          tabBarIcon: ({ color, size }) => (
            <MyIcon width={size} height={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const linking = {
    prefixes: ['efoo://', 'https://에리카밥.com'],
    config: {
      screens: {
        Main: 'main',
        RestaurantDetail: 'restaurant/:restaurantId',
        Filter: 'filter',
        Login: 'login',
        CommentDetail: 'comment/:commentId',
        Bookmark: 'bookmark',
        AddInfo: 'addinfo',
      },
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <NavigationContainer linking={linking}>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Main" component={TabNavigator} />
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
                  name="Login"
                  component={LoginScreen}
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
                  name="RestaurantEdit"
                  component={RestaurantEditScreen}
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
                <Stack.Screen
                  name="Bookmark"
                  component={BookmarkScreen}
                  options={{
                    headerShown: true,
                    headerTitle: '북마크',
                    headerStyle: { backgroundColor: '#3B82F6' },
                    headerTintColor: '#FFFFFF',
                    headerTitleStyle: { fontWeight: 'bold' },
                  }}
                />
                <Stack.Screen
                  name="AddInfo"
                  component={AddInfoScreen}
                  options={{
                    headerShown: true,
                    headerTitle: '정보 입력',
                    headerStyle: { backgroundColor: '#3B82F6' },
                    headerTintColor: '#FFFFFF',
                    headerTitleStyle: { fontWeight: 'bold' },
                  }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
