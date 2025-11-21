import { View, Text, TextInput, Pressable, Animated } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from '@/components/Icon';

interface SearchScreenProps {
  children?: React.ReactNode;
  onFilterPress?: () => void;
}

export default function SearchScreen({ children, onFilterPress }: SearchScreenProps) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [scrollY] = useState(new Animated.Value(0));
  const STICKY_THRESHOLD = 30;

  return (
    <Animated.ScrollView
      stickyHeaderIndices={[1]}
      className="flex-1 bg-[rgba(248, 250, 252, 1)]"
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
      bounces={true}
      bouncesZoom={false}
      alwaysBounceVertical={false}
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
        <View className='w-full flex-row justify-between items-center h-full'>
          <View className="flex-row items-center justify-center h-full gap-2">
            <Text className="text-md font-semibold text-neutral-900">
              경기 안산시 상록구 한양
            </Text>
            <Icon name="dropdown" width={10} height={13} />
          </View>
          <Pressable
            onPress={onFilterPress ?? (() => navigation.navigate('Filter'))}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="filter" />
          </Pressable>
        </View>
      </Animated.View>

      <View className='w-full px-5 py-2 bg-white border-b border-b-gray-100'>
        <View className='w-full rounded-full flex-row justify-between items-center px-4 py-2 bg-gray-100'>
          <TextInput
            placeholder="찾아라! 에리카의 맛집"
            className="flex-1 text-base items-center justify-center p-1"
            placeholderTextColor="#9CA3AF"
          />
          <Pressable>
            <Icon name="search" width={35}/>
          </Pressable>
        </View>
      </View>
      {children}
    </Animated.ScrollView>
  );
}
