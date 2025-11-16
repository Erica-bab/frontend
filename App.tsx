import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import SchoolRestaurantScreen from './screens/SchoolRestaurant';
import RestuarantScreen from './screens/Restaurant';
import CafeScreen from './screens/CafeScreen';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';
import CommentScreen from './screens/CommentScreen';

import { Image } from 'react-native';
import myIcon from './assets/icon/tabicon/my.png';
import cafeIcon from './assets/icon/tabicon/cafe.png';
import bobIcon from './assets/icon/tabicon/bob.png';
import schoolIcon from './assets/icon/tabicon/school.png';

import './global.css';

const Tab = createBottomTabNavigator();


export default function App() {
  return (
    <SafeAreaView className="flex-1">
      <NavigationContainer>
        
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#2563EB',
            tabBarInactiveTintColor: '#000000ff',
            headerShown: true,
          }}
        >
          <Tab.Screen
            name="Restaurant"
            component={RestuarantScreen}
            options={{
              title: '식당',
              tabBarLabel: '식당',
              tabBarIcon: ({ color, size }) => (
                <Image
                source={bobIcon}
                style={{ width: size, height: size, tintColor: color }}
                />
              ),
            }}
          />
          <Tab.Screen
            name="SchoolRestaruant"
            component={SchoolRestaurantScreen}
            options={{
              title: '학식',
              tabBarLabel: '학식',
              tabBarIcon: ({ color, size }) => (
                <Image
                  source={schoolIcon}
                  style={{ width: size, height: size, tintColor: color }}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Cafe"
            component={CafeScreen}
            options={{
              title: '카페',
              tabBarLabel: '카페',
              tabBarIcon: ({ color, size }) => (
                <Image
                  source={cafeIcon}
                  style={{ width: size, height: size, tintColor: color }}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              title: '마이',
              tabBarLabel: '마이',
              tabBarIcon: ({ color, size }) => (
                <Image
                  source={myIcon}
                  style={{ width: size, height: size, tintColor: color }}
                />
              ),
            }}
          />
          <Tab.Screen
            name="test"
            component={CommentScreen}
            options={{
              title: 'test',
              tabBarLabel: 'test',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}