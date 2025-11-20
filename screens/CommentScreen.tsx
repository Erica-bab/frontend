import { View, Text } from 'react-native';
import Comments from '@/components/ui/Comments';
import TextIconBox from '@/components/ui/TextIconBox';
import CafeteriaInfo from '@/components/cafeteria/CafeteriaInfo';
import LocationIcon from '@/assets/icon/location.svg';

export default function CommentScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Comments />
      <TextIconBox 
        preset="gray"
        text="위치"
      />
      <TextIconBox 
        preset="red"
        text="위치"
      />
      <CafeteriaInfo
        name="천원의 아침밥"
        menu={["스팸마요 덮밥", "꼬치 어묵국", "고로케&케찹", "치커리유자청무침", "배추김치야채샐러드&드레싱"]}
        location="창의인재원"
      />
      <TextIconBox 
        preset="blue"
        icon={LocationIcon}
        text="위치 정보"
      />
      <LocationIcon width={50} height={50} color="#FF33FF"/>
    </View>
  );
}
