import { View, Text } from 'react-native';
import Card from './ui/Card';
import RestaurantStatusTag from './ui/RestaurantStatusTag';

interface RestaurantCardProps {
  name: string;
  category: string;
  status: '영업중' | '영업종료' | '브레이크타임';
  rating: number;
}

export default function RestaurantCard({ name, category, status, rating }: RestaurantCardProps) {
  return (
    <Card variant="default">
      <View className="flex-row items-center">
        <Text className="text-lg text-blue-500">{name}</Text>
        <Text className="ml-1">{category}</Text>
      </View>
      <RestaurantStatusTag status={status} rating={rating} />
      <View className='bg-blue-500'>
        <Text>사진 들어갈곳곳곳ㅅ</Text>
        <Text>사진 들어갈곳곳곳ㅅ</Text>
        <Text>사진 들어갈곳곳곳ㅅ</Text>
        <Text>사진 들어갈곳곳곳ㅅ</Text>
        <Text>사진 들어갈곳곳곳ㅅ</Text>
        <Text>사진 들어갈곳곳곳ㅅ</Text>
        <Text>사진 들어갈곳곳곳ㅅ</Text>
        <Text>사진 들어갈곳곳곳ㅅ</Text>
        <Text>사진 들어갈곳곳곳ㅅ</Text>
      </View>
      <View className='bg-white border border-gray-300 rounded-2xl p-4 self-stretch'>
        <Text>
          {"치즈돈가스가 등김카츠보다 시간이 더 걸린다는 건 알았지만 이건 너무 대기 시간이 길어서 짜증났어요"}
        </Text>
      </View>
    </Card>
  );
}
