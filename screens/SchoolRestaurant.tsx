import { View, Text, FlatList } from 'react-native';
import CafeteriaInfo from '../components/cafeteria/CafeteriaInfo';

const CAFETERIA_DATA = [
  {
    id: '1',
    name: '천원의 아침밥',
    price: '1000',
    menu: ['스팸마요 덮밥', '꼬치 어묵국', '고로케&케찹', '치커리유자청무침', '배추김치야채샐러드&드레싱'],
    location: '창의인재원',
  },
  {
    id: '2',
    name: '맛있는 점심',
    price: '2500',
    menu: ['비빔밥', '된장찌개', '계란말이', '오이무침', '과일샐러드'],
    location: '학생회관',
  },
  {
    id: '3',
    name: '건강한 한끼',
    price: '3000',
    menu: ['현미밥', '닭가슴살 구이', '야채샐러드', '미소된장국', '과일'],
    location: '기숙사 식당',
  },
];

export default function SchoolRestaurantScreen() {
  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={CAFETERIA_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CafeteriaInfo
            name={item.name}
            price={item.price}
            menu={item.menu}
            location={item.location}
          />
        )}

        ListHeaderComponent={
          <View className="items-center mb-4">
            <Text className="text-2xl font-bold text-blue-600">학식 화면</Text>
            <Text className="text-gray-600 mt-2">환영합니다!</Text>
          </View>
        }
        contentContainerClassName="items-center gap-4 py-8"
   
        showsVerticalScrollIndicator={false}
        
        overScrollMode="never"
      />
    </View>
  );
}
