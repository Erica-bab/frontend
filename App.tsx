import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import SchoolRestaurantScreen from './screens/SchoolRestaurant';
import RestuarantScreen from './screens/Restaurant';
import CafeScreen from './screens/CafeScreen';
import BarScreen from './screens/BarScreen';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';
import CommentScreen from './screens/CommentScreen';
import './global.css';

const Tab = createBottomTabNavigator();


export default function App() {
  return (
    <SafeAreaView className="flex-1">
      <NavigationContainer>
        
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#3b82f6',
            tabBarInactiveTintColor: '#9ca3af',
            headerShown: true,
          }}
        >
          <Tab.Screen
            name="SchoolRestaruant"
            component={SchoolRestaurantScreen}
            options={{
              title: '학식',
              tabBarLabel: '학식'
            }}
          />
          <Tab.Screen
            name="Restaurant"
            component={RestuarantScreen}
            options={{
              title: '식당',
              tabBarLabel: '식당'
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
            name="Bar"
            component={BarScreen}
            options={{
              title: '술집',
              tabBarLabel: '술집'
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
          <Tab.Screen
            name="test"
            component={CommentScreen}
            options={{
              title: 'test',
              tabBarLabel: 'test',
            }}/>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}