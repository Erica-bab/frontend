import { View, Text } from 'react-native';
import Comments from '../components/ui/Comments';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextBox from '../components/ui/TextBox';
import cafeIcon from '../assets/icon/cafe.png';

export default function CommentScreen() {
  return (
    <SafeAreaView className="flex-1">
        {/* 작업공간 */}
      <View className="flex-1 items-center justify-center">
        <Comments />
      <TextBox 
        boxClass="w-full h-16 border-t border-gray-300 flex-row items-center px-4"
        imagefile={cafeIcon}
        imageClass="w-8 h-8 mr-4"
        textClass="text-gray-600 text-lg"
        text="댓글을 입력하세요..."
      />
      </View>
    </SafeAreaView>
  );
}
