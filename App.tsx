import { useEffect, useState } from 'react';
import { View, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';

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
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        animation: 'fade',
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

// 스플래시 스크린이 자동으로 숨겨지지 않도록 설정
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [splashOpacity] = useState(new Animated.Value(1));
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // 앱이 준비되면 1초 후에 스플래시 아래에서 앱 로딩 시작
    // 2초 후에 스플래시 스크린 페이드 아웃
    const prepareApp = async () => {
      try {
        // 1초 후: 앱 로딩 시작 (스플래시는 계속 보임)
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsAppReady(true);
        
        // 추가 1초 대기 (총 2초) 후 페이드 아웃 시작
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 페이드 아웃 애니메이션 (300ms)
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(async () => {
          // 애니메이션 완료 후 스플래시 스크린 숨기기
          await SplashScreen.hideAsync();
          setIsSplashVisible(false);
        });
      } catch (error) {
        console.warn('Splash screen hide error:', error);
      }
    };

    prepareApp();
  }, []);

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
    getStateFromPath(path: string, options?: any) {
      // share/:restaurantId 패턴을 RestaurantDetail로 매핑
      const shareMatch = path.match(/^share\/(\d+)$/);
      if (shareMatch) {
        const restaurantId = shareMatch[1];
        return {
          routes: [
            {
              name: 'Main',
              state: {
                routes: [{ name: 'Restaurant' }],
                index: 0,
              },
            },
            {
              name: 'RestaurantDetail',
              params: { restaurantId },
            },
          ],
          index: 1,
        };
      }
      // 기본 파싱을 위해 undefined 반환 (React Navigation이 자동으로 처리)
      return undefined;
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            {isSplashVisible && (
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: '#2563EB',
                  opacity: splashOpacity,
                  zIndex: 9999,
                }}
                pointerEvents="none"
              />
            )}
            {isAppReady && (
              <NavigationContainer linking={linking}>
              <Stack.Navigator 
                screenOptions={{ 
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              >
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen
                  name="Filter"
                  component={FilterScreen}
                  options={{
                    headerShown: false,
                    presentation: 'transparentModal',
                    animation: 'slide_from_bottom',
                    animationDuration: 250,
                  }}
                />
                <Stack.Screen
                  name="Login"
                  component={LoginScreen}
                  options={{
                    headerShown: false,
                    presentation: 'transparentModal',
                    animation: 'slide_from_bottom',
                    animationDuration: 250,
                  }}
                />
                <Stack.Screen
                  name="RestaurantDetail"
                  component={RestaurantDetailScreen}
                  options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    animationDuration: 300,
                  }}
                />
                <Stack.Screen
                  name="RestaurantEdit"
                  component={RestaurantEditScreen}
                  options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    animationDuration: 300,
                  }}
                />
                <Stack.Screen
                  name="CommentDetail"
                  component={CommentDetailScreen}
                  options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    animationDuration: 300,
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
                    animation: 'slide_from_right',
                    animationDuration: 300,
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
                    animation: 'slide_from_right',
                    animationDuration: 300,
                  }}
                />
              </Stack.Navigator>
              </NavigationContainer>
            )}
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
