import { View, Text, ScrollView } from 'react-native';
import SearchBar from '../components/SearchBar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RestaurantStatusTag from '../components/ui/RestaurantStatusTag';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RestuarantScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <SearchBar />
            <ScrollView className="flex-1 bg-white">
                <Card variant="banner">
                    <View>
                        <Text className="text-white">{"일상 속 모든 순간, 한장으로\n더 똑똑한 소비의 시작 에리 체크카드"}</Text>
                        <Button>혜택 확인하기</Button>
                    </View>
                </Card>
                <Card variant='default'>
                    <View className='flex-row items-center'>
                        <Text className='text-lg text-blue-500'>{"백소정 안산한양대점"}</Text>
                        <Text className='ml-1'>{"일식당"}</Text>
                    </View>
                    <RestaurantStatusTag status="영업중" rating={4.5} />
                    <Card>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                    </Card>
                    <Card >
                        <Text>
                        {"치즈돈가스가 등김카츠보다 시간이 더 걸린다는 건 알았지만 이건 너무 대기 시간이 길어서 짜증났어요"}
                        </Text>
                    </Card>
                </Card>
                <Card variant='default'>
                    <View className='flex-row items-center'>
                        <Text className='text-lg text-blue-500'>{"백소정 안산한양대점"}</Text>
                        <Text className='ml-1'>{"일식당"}</Text>
                    </View>
                    <RestaurantStatusTag status="영업중" rating={4.5} />
                    <Card>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                    </Card>
                    <Card >
                        <Text>
                        {"치즈돈가스가 등김카츠보다 시간이 더 걸린다는 건 알았지만 이건 너무 대기 시간이 길어서 짜증났어요"}
                        </Text>
                    </Card>
                </Card>
                <Card variant='default'>
                    <View className='flex-row items-center'>
                        <Text className='text-lg text-blue-500'>{"백소정 안산한양대점"}</Text>
                        <Text className='ml-1'>{"일식당"}</Text>
                    </View>
                    <RestaurantStatusTag status="영업중" rating={4.5} />
                    <Card>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                    </Card>
                    <Card >
                        <Text>
                        {"치즈돈가스가 등김카츠보다 시간이 더 걸린다는 건 알았지만 이건 너무 대기 시간이 길어서 짜증났어요"}
                        </Text>
                    </Card>
                </Card>
                <Card variant='default'>
                    <View className='flex-row items-center'>
                        <Text className='text-lg text-blue-500'>{"백소정 안산한양대점"}</Text>
                        <Text className='ml-1'>{"일식당"}</Text>
                    </View>
                    <RestaurantStatusTag status="영업중" rating={4.5} />
                    <Card>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                    </Card>
                    <Card >
                        <Text>
                        {"치즈돈가스가 등김카츠보다 시간이 더 걸린다는 건 알았지만 이건 너무 대기 시간이 길어서 짜증났어요"}
                        </Text>
                    </Card>
                </Card>
                <Card variant='default'>
                    <View className='flex-row items-center'>
                        <Text className='text-lg text-blue-500'>{"백소정 안산한양대점"}</Text>
                        <Text className='ml-1'>{"일식당"}</Text>
                    </View>
                    <RestaurantStatusTag status="영업중" rating={4.5} />
                    <Card>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                        <Text>사진 들어갈 곳</Text>
                    </Card>
                    <Card >
                        <Text>
                        {"치즈돈가스가 등김카츠보다 시간이 더 걸린다는 건 알았지만 이건 너무 대기 시간이 길어서 짜증났어요"}
                        </Text>
                    </Card>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}
