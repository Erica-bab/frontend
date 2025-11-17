import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';

import CafeteriaScreen from './screens/CafeteriaScreen';
import RestuarantScreen from './screens/Restaurant';
import CafeScreen from './screens/CafeScreen';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';
import CommentScreen from './screens/CommentScreen';

import MyIcon from './assets/icon/tabicon/my.svg';
import CafeIcon from './assets/icon/tabicon/cafe.svg';
import BobIcon from './assets/icon/tabicon/bab.svg';
import SchoolIcon from './assets/icon/tabicon/school.svg';
import './global.css';

const Tab = createBottomTabNavigator();

interface TabIconProps {
  focused: boolean;
  label: string;
  IconComponent: React.ComponentType<any>;
}

function TabBarIcon({ focused, label, IconComponent }: TabIconProps) {
  return (
    <View className="items-center justify-center mt-10">
      <IconComponent
        width={24}
        height={24}
        color={focused ? '#2563EB' : '#000000'}
      />
      <Text
        className={`
          text-[11px] mt-1
          ${focused ? 'text-blue-600 font-semibold' : 'text-black'}
        `}
      >
        {label}
      </Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaView className="flex-1">
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: {
              height: 60,
            },
          }}
        >
          <Tab.Screen
            name="Restaurant"
            component={RestuarantScreen}
            options={{
              title: '식당',
              tabBarIcon: ({ focused }) => (
                <TabBarIcon
                  focused={focused}
                  label="식당"
                  IconComponent={BobIcon}
                />
              ),
            }}
          />

          <Tab.Screen
            name="SchoolRestaruant"
            component={CafeteriaScreen}
            options={{
              title: '학식',
              tabBarIcon: ({ focused }) => (
                <TabBarIcon
                  focused={focused}
                  label="학식"
                  IconComponent={SchoolIcon}
                />
              ),
            }}
          />

          <Tab.Screen
            name="Cafe"
            component={CafeScreen}
            options={{
              title: '카페',
              tabBarIcon: ({ focused }) => (
                <TabBarIcon
                  focused={focused}
                  label="카페"
                  IconComponent={CafeIcon}
                />
              ),
            }}
          />

          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              title: '마이',
              tabBarIcon: ({ focused }) => (
                <TabBarIcon
                  focused={focused}
                  label="마이"
                  IconComponent={MyIcon}
                />
              ),
            }}
          />

          <Tab.Screen
            name="test"
            component={CommentScreen}
            options={{
              title: 'test',
              tabBarIcon: ({ focused }) => (
                <TabBarIcon
                  focused={focused}
                  label="test"
                  IconComponent={MyIcon}
                />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
