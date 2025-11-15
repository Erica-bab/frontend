import { View, Text, Image } from 'react-native';

interface cafeteriaProps {
    name?: string,
    price?: string,
    menu?: string,
    location?: string,
}

export default function cafeteriaInfo({ name = "천원의 아침밥", price = "1000", menu = "야호", location = "창의인재원" }: cafeteriaProps) {
    return (
        <View className="flex flex-col border border-gray-400 w-full max-w-[35vh] p-4">
            <Text className="text-xl font-bold">{name}</Text>
            <Text className="text-lg mt-2">메뉴: {menu}</Text>
            <Text className="text-lg mt-2">가격: {price}원</Text>
            <Text className="text-lg mt-2">위치: {location}</Text>
        </View>
    );
}