import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Linking, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from '@/components/Icon';
import { useLogout, useCurrentUser } from '@/api/auth/useAuth';
import { useAuth } from '@/api/auth/useAuth';
import LoginPopup from '@/components/LoginPopup';

const MENU_ITEMS = [
  // { icon: 'chat' as const, label: '쓴 댓글 보기', action: 'comments' },
  { icon: 'bookmark1' as const, label: '북마크', action: 'bookmark' },
  { icon: 'mail' as const, label: '문의하기', action: 'contact' },
  { icon: 'paper' as const, label: '서비스 이용약관', action: 'terms' },
  { icon: 'docs' as const, label: '개인정보 처리방침', action: 'privacy' },
  { icon: 'people' as const, label: '만든사람', action: 'about' },
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { isAuthenticated, refreshAuthState } = useAuth();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // 프로필 정보 동적 생성
  const getProfileInfo = () => {
    if (!currentUser) return [];
    
    const info = [];
    
    // 유형
    const userType = currentUser.student_year && currentUser.college ? '학생' : '기타(비공개)';
    info.push({ label: '유형', value: userType });
    
    // 학번 (학생인 경우만)
    if (currentUser.student_year) {
      info.push({ label: '학번', value: currentUser.student_year });
    }
    
    // 단과대 (학생인 경우만)
    if (currentUser.college?.name) {
      info.push({ label: '단과대', value: currentUser.college.name });
    }
    
    return info;
  };

  const handleUpdateInfo = () => {
    navigation.navigate('AddInfo' as never);
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            logout(undefined, {
              onSuccess: () => {
                refreshAuthState();
                Alert.alert('로그아웃 완료', '로그아웃되었습니다.');
              },
              onError: (error) => {
                // 에러가 발생해도 로컬 토큰은 삭제되었으므로 상태 갱신
                refreshAuthState();
                console.error('로그아웃 에러:', error);
                Alert.alert('로그아웃 완료', '로그아웃되었습니다.');
              },
            });
          },
        },
      ]
    );
  };

  // 로그인 성공 시 팝업 자동 닫기
  useEffect(() => {
    if (isAuthenticated && showLoginPopup) {
      setShowLoginPopup(false);
    }
  }, [isAuthenticated, showLoginPopup]);

  const handleMenuPress = async (action: string) => {
    switch (action) {
      case 'bookmark':
        navigation.navigate('Bookmark' as never);
        break;
      case 'comments':
        // TODO: 댓글 화면 구현
        console.log('댓글 보기');
        break;
      case 'contact':
        try {
          const url = 'https://www.notion.so/2b5e2e83b8368078a7f4ed0f5347a31f';
          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
          } else {
            console.error('Cannot open URL:', url);
          }
        } catch (error) {
          console.error('Failed to open contact link:', error);
        }
        break;
      case 'terms':
        try {
          const url = 'https://www.notion.so/2b5e2e83b83680a4acb1eb3aadb6fd76';
          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
          } else {
            console.error('Cannot open URL:', url);
          }
        } catch (error) {
          console.error('Failed to open terms link:', error);
        }
        break;
      case 'privacy':
        try {
          const url = 'https://www.notion.so/2b5e2e83b8368078a7f4ed0f5347a31f';
          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
          } else {
            console.error('Cannot open URL:', url);
          }
        } catch (error) {
          console.error('Failed to open privacy link:', error);
        }
        break;
      case 'about':
        try {
          const url = 'https://www.notion.so/2b5e2e83b83680f38589d9fb508c102f';
          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
          } else {
            console.error('Cannot open URL:', url);
          }
        } catch (error) {
          console.error('Failed to open about link:', error);
        }
        break;
    }
  };
  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <View className="items-center pt-10 pb-4">
          <Text className="text-xl font-bold">오늘도 한 끼 행복하게</Text>
          <Text className="text-xl font-bold">
            <Text className="text-blue-500 text-2xl">에푸</Text>
            <Text>가 함께 합니다!</Text>
          </Text>
        </View>


        <View className="px-4 gap-2">
          <View className="bg-gray-200 h-px" />
          {isLoadingUser ? (
            <View className="p-4 items-center">
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text className="text-gray-500 mt-2">정보를 불러오는 중...</Text>
            </View>
          ) : isAuthenticated && getProfileInfo().length > 0 ? (
            <>
              {getProfileInfo().map((item, index) => (
                <View key={item.label} className={index === 0 && getProfileInfo().length === 1 ? 'py-4' : ''}>
                  <View className="p-1">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-row flex-1 items-center">
                        <Text className="text-gray-500 w-20">{item.label}</Text>
                        <Text className="font-bold">{item.value}</Text>
                      </View>
                      <Pressable
                        className="bg-blue-100 px-4 py-2 rounded-full"
                        onPress={handleUpdateInfo}
                      >
                        <Text className="text-blue-500 font-medium">수정</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </>
          ) : isAuthenticated ? (
            <View className="p-4">
              <Text className="text-gray-500 mb-2">정보가 없습니다.</Text>
              <Pressable 
                className="bg-blue-100 px-4 py-2 rounded-full self-start"
                onPress={handleUpdateInfo}
              >
                <Text className="text-blue-500 font-medium">정보 입력</Text>
              </Pressable>
            </View>
          ) : (
            <View className="p-4">
              <Text className="text-gray-500">로그인 후 정보를 확인할 수 있습니다.</Text>
            </View>
          )}
          <View className="bg-gray-200 h-px" />
        </View>
        <View>
          {MENU_ITEMS.map((item) => (
            <View key={item.label}>
              <Pressable
                className="flex-row items-center p-4 gap-2 justify-between"
                onPress={() => handleMenuPress(item.action)}
              >
                <View className="flex-row items-center gap-2">
                  <Icon name={item.icon} />
                  <Text>{item.label}</Text>
                </View>
                <Icon name="rightAngle" width={8} />
              </Pressable>
              <View className="bg-gray-200 h-px" />
            </View>
          ))}
        </View>

        <View className="flex-row justify-between p-2">
          <Text className="text-gray-400 text-sm">앱버전</Text>
          <Text className="text-gray-400 text-sm">{require('../package.json').version}</Text>
        </View>

        {/* 로그인/로그아웃 버튼 */}
        <View className="mt-4">
          {isAuthenticated ? (
            <Pressable
              className="bg-blue-500 p-3 rounded-lg"
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white text-center font-medium">로그아웃</Text>
              )}
            </Pressable>
          ) : (
            <Pressable
              className="bg-blue-500 p-3 rounded-lg"
              onPress={() => setShowLoginPopup(true)}
            >
              <Text className="text-white text-center font-medium">로그인</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      <LoginPopup
        visible={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        onLoginSuccess={async () => {
          await refreshAuthState();
        }}
      />
    </View>
  );
}
