import { View, Text, ScrollView } from 'react-native';
import { useState } from 'react';
import { useCafeteria } from '@/api/cafeteria/useCafeteria';
import { CafeteriaResponse, CafeteriaParams } from '@/api/cafeteria/types';


export default function CommentScreen() {
    const [cafeteriaParams, setCafeteriaParams] = useState<CafeteriaParams>({});
    const { data, isLoading, error } = useCafeteria(cafeteriaParams);

    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center bg-white">
          <Text>불러오는 중...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 items-center justify-center bg-white px-4">
          <Text>에러 발생</Text>
          <Text>{error}</Text>
        </View>
      );
    }

    return (
      <ScrollView className="flex-1 bg-white px-4 py-6">
        <Text className="text-xl font-bold mb-4">학식 API 테스트</Text>
        <Text selectable className="text-xs font-mono">
          {JSON.stringify(data, null, 2)}
        </Text>
      </ScrollView>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Text>에러 발생</Text>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-4 py-6">
      <Text className="text-xl font-bold mb-4">학식 API 테스트</Text>
      <Text selectable className="text-xs font-mono">
        {JSON.stringify(data, null, 2)}
      </Text>
    </ScrollView>
  );
}
