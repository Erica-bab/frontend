import { View, Text, TextInput, Pressable, Animated } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DropdownIcon from '@/assets/icon/dropdown.svg';
import FilterIcon from '@/assets/icon/filter.svg';
import SearchIcon from '@/assets/icon/search.svg';

interface SearchScreenProps {
  children?: React.ReactNode;
}

export default function SearchScreen({ children }: SearchScreenProps) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [scrollY] = useState(new Animated.Value(0));
  const STICKY_THRESHOLD = 30;

  return (
    <Animated.ScrollView
      stickyHeaderIndices={[1]}
      className="flex-1 bg-white"
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      <Animated.View
        className='w-full px-5 py-1 bg-white'
        style={{
          opacity: scrollY.interpolate({
            inputRange: [0, STICKY_THRESHOLD],
            outputRange: [1, 0],
            extrapolate: 'clamp',
          }),
          height: scrollY.interpolate({
            inputRange: [0, STICKY_THRESHOLD],
            outputRange: [40, 0],
            extrapolate: 'clamp',
          }),
        }}
      >
        <View className='w-full flex-row justify-between items-center'>
          <View className="flex-row items-center gap-2">
            <Text className="text-md font-semibold text-neutral-900">
              경기 안산시 상록구 한양
            </Text>
            <DropdownIcon width={10} height={13} />
          </View>
          <Pressable className="mt-2" onPress={() => navigation.navigate('Filter')}>
            <FilterIcon/>
          </Pressable>
        </View>
      </Animated.View>

      <View className='w-full px-5 py-4 bg-white border-b border-b-gray-100'>
        <View className='w-full rounded-full flex-row justify-between items-center px-4 py-2 bg-gray-100'>
          <TextInput
            placeholder="찾아라! 에리카의 맛집"
            className="flex-1 text-base items-center justify-center p-1"
            placeholderTextColor="#9CA3AF"
          />
          <Pressable>
            <SearchIcon width={35}/>
          </Pressable>
        </View>
      </View>
      {children}
    </Animated.ScrollView>
  );
}
