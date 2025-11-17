import { View, Text } from 'react-native';
import Comments from '../components/ui/Comments';
import TextBox from '../components/ui/TextBox';
import CafeteriaInfo from '../components/cafeteria/CafeteriaInfo';

export default function CommentScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Comments />
      <TextBox
        preset="gray"
        imagefile={require('../assets/icon/cafe.png')}
        text="위치"
      />
      <TextBox 
        preset="red"
        text="위치"
      />
      <CafeteriaInfo/>
      
    </View>
  );
}
