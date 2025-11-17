import { View, Text, Image } from 'react-native';
import GoodIcon from '../../assets/icon/good.svg';

interface commentsProps {
    name?: string,
    good?: number,
    comment?: string,
    date?: string,
    time?: string,
}

export default function Comments({ name = "익명", good = 0, comment = "야호", date = "00/00", time ="00:00", }: commentsProps) {
    comment = "배고파 졸려 피곤해";
    return (
        <View className="flex flex-col border border-gray-400 w-full max-w-[35vh] p-4">
            <View className="flex-row item-center justify-between">
                <Text>{name}</Text>
                <View className="flex-row gap-2">
                    
                    <Text>{good}</Text>
                </View>
            </View>                                                                            
            
            <Text className="text-gray-600 mt-2 text-xl">{comment}</Text>
            <GoodIcon width={20} height={20} color="#000000ff"/>
            <View className="flex-row">
                <Text className="text-gray-600 mt-5">{date}</Text>
                <Text className="text-gray-600 mt-5 mx-2">{time}</Text>
            </View>
        </View>
    );
}