import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRestaurantDetail, useUpdateRestaurant, useUpdateRestaurantHours, useCreateMenu, useUpdateMenu, useDeleteMenu, useRestaurantMenus } from '@/api/restaurants/useRestaurant';
import { RestaurantDetailResponse, BusinessHoursDay, MenuItem } from '@/api/restaurants/types';
import Icon from '@/components/Icon';
import { useAuth } from '@/api/auth/useAuth';
import { AxiosError } from 'axios';

type EditTabType = 'phone' | 'hours' | 'menu';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const DAY_NUMBERS = ['1', '2', '3', '4', '5', '6', '7'];

export default function RestaurantEditScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { restaurantId } = route.params as { restaurantId: number };
  const [selectedTab, setSelectedTab] = useState<EditTabType>('phone');
  
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { data: restaurant, isLoading, refetch } = useRestaurantDetail(restaurantId);
  const { data: menuData } = useRestaurantMenus(restaurantId, { is_available: undefined });
  
  const { mutate: updateRestaurant, isPending: isUpdatingRestaurant } = useUpdateRestaurant(restaurantId);
  const { mutate: updateHours, isPending: isUpdatingHours } = useUpdateRestaurantHours(restaurantId);
  const { mutate: createMenu, isPending: isCreatingMenu } = useCreateMenu(restaurantId);
  const { mutate: updateMenu, isPending: isUpdatingMenu } = useUpdateMenu(restaurantId);
  const { mutate: deleteMenu, isPending: isDeletingMenu } = useDeleteMenu(restaurantId);
  
  // 전화번호 수정 상태
  const [phone, setPhone] = useState('');
  
  // 운영시간 수정 상태
  const [hours, setHours] = useState<Record<string, BusinessHoursDay>>({});
  
  // 메뉴 수정 상태
  const [editingMenu, setEditingMenu] = useState<MenuItem | null | undefined>(undefined);
  
  // editingMenu 상태 변경 추적
  useEffect(() => {
    console.log('editingMenu changed:', editingMenu);
  }, [editingMenu]);
  const [menuName, setMenuName] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [menuDescription, setMenuDescription] = useState('');
  const [menuCategory, setMenuCategory] = useState('');
  const [menuIsPopular, setMenuIsPopular] = useState(false);
  const [menuIsAvailable, setMenuIsAvailable] = useState(true);
  const [menuDisplayOrder, setMenuDisplayOrder] = useState(0);
  
  // 초기 데이터 로드
  useEffect(() => {
    if (restaurant) {
      setPhone(restaurant.phone || '');
      
      // 운영시간 초기화
      const initialHours: Record<string, BusinessHoursDay> = {};
      DAYS.forEach((day, index) => {
        const dayData = restaurant.business_hours[day as keyof typeof restaurant.business_hours];
        if (dayData) {
          initialHours[day] = { ...dayData };
        } else {
          initialHours[day] = {
            is_closed: true,
            open_time: null,
            close_time: null,
            break_start: null,
            break_end: null,
            last_order: null,
            special_note: null,
            closes_next_day: false,
          };
        }
      });
      setHours(initialHours);
    }
  }, [restaurant]);
  
  // 인증 확인
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      Alert.alert('로그인 필요', '식당 정보를 수정하려면 로그인이 필요합니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    }
  }, [isAuthenticated, isAuthLoading]);
  
  // 전화번호 저장
  const handleSavePhone = () => {
    if (!restaurant) return;
    
    updateRestaurant(
      { phone: phone.trim() || undefined, version: restaurant.meta.version },
      {
        onSuccess: (data) => {
          Alert.alert('성공', data.message || '전화번호 수정 요청이 접수되었습니다.');
          refetch();
        },
        onError: (error) => {
          const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
          const message = axiosError.response?.data?.detail || axiosError.response?.data?.message || '전화번호 수정에 실패했습니다.';
          Alert.alert('오류', message);
        },
      }
    );
  };
  
  // 운영시간 저장
  const handleSaveHours = () => {
    if (!restaurant) return;
    
    const hoursArray = DAYS.map((day, index) => {
      const dayData = hours[day];
      if (!dayData) return null;
      
      const dayNumber = DAY_NUMBERS[index];
      const hourData: any = {
        day_of_week: dayNumber,
        is_closed: dayData.is_closed || false,
      };
      
      if (!dayData.is_closed) {
        if (dayData.open_time) hourData.open_time = dayData.open_time;
        if (dayData.close_time) hourData.close_time = dayData.close_time;
        if (dayData.break_start) hourData.break_start = dayData.break_start;
        if (dayData.break_end) hourData.break_end = dayData.break_end;
        if (dayData.last_order) hourData.last_order = dayData.last_order;
        if (dayData.special_note) hourData.special_note = dayData.special_note;
        // closes_next_day는 백엔드에서 자동 판별하지만, 명시적으로 전송 가능
        if (dayData.closes_next_day !== undefined) {
          hourData.closes_next_day = dayData.closes_next_day;
        }
      }
      
      return hourData;
    }).filter(Boolean);
    
    updateHours(
      { hours: hoursArray },
      {
        onSuccess: (data) => {
          Alert.alert('성공', data.message || '운영시간 수정 요청이 접수되었습니다.');
          refetch();
        },
        onError: (error) => {
          const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
          const message = axiosError.response?.data?.detail || axiosError.response?.data?.message || '운영시간 수정에 실패했습니다.';
          Alert.alert('오류', message);
        },
      }
    );
  };
  
  // 메뉴 추가/수정 모달 열기
  const handleOpenMenuEdit = (menu?: MenuItem) => {
    console.log('handleOpenMenuEdit called with menu:', menu);
    if (menu) {
      console.log('Setting editing menu:', menu);
      setEditingMenu(menu);
      setMenuName(menu.name);
      setMenuPrice(menu.price?.toString() || '');
      setMenuDescription(menu.description || '');
      setMenuCategory(menu.category || '');
      setMenuIsPopular(menu.is_popular);
      setMenuIsAvailable(menu.is_available);
      setMenuDisplayOrder(menu.display_order);
    } else {
      console.log('Setting editing menu to null (new menu)');
      setEditingMenu(null);
      setMenuName('');
      setMenuPrice('');
      setMenuDescription('');
      setMenuCategory('');
      setMenuIsPopular(false);
      setMenuIsAvailable(true);
      setMenuDisplayOrder(0);
    }
  };
  
  // 메뉴 저장
  const handleSaveMenu = () => {
    console.log('handleSaveMenu called, editingMenu:', editingMenu);
    if (!menuName.trim()) {
      Alert.alert('오류', '메뉴명을 입력해주세요.');
      return;
    }
    
    if (editingMenu) {
      console.log('Updating menu:', editingMenu.id, 'version:', editingMenu.meta?.version);
      // 메뉴 수정
      updateMenu(
        {
          menuId: editingMenu.id,
          request: {
            name: menuName.trim(),
            price: menuPrice ? parseInt(menuPrice) : undefined,
            description: menuDescription.trim() || undefined,
            category: menuCategory.trim() || undefined,
            is_popular: menuIsPopular,
            is_available: menuIsAvailable,
            display_order: menuDisplayOrder,
            version: editingMenu.meta?.version || 1,
          },
        },
        {
          onSuccess: (data) => {
            Alert.alert('성공', data.message || '메뉴 수정 요청이 접수되었습니다.');
            setEditingMenu(null);
            refetch();
          },
          onError: (error) => {
            const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
            const message = axiosError.response?.data?.detail || axiosError.response?.data?.message || '메뉴 수정에 실패했습니다.';
            Alert.alert('오류', message);
          },
        }
      );
    } else {
      // 메뉴 추가
      createMenu(
        {
          name: menuName.trim(),
          price: menuPrice ? parseInt(menuPrice) : undefined,
          description: menuDescription.trim() || undefined,
          category: menuCategory.trim() || undefined,
          is_popular: menuIsPopular,
          is_available: menuIsAvailable,
          display_order: menuDisplayOrder,
        },
        {
          onSuccess: (data) => {
            Alert.alert('성공', data.message || '메뉴 추가 요청이 접수되었습니다.');
            setEditingMenu(null);
            refetch();
          },
          onError: (error) => {
            const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
            const message = axiosError.response?.data?.detail || axiosError.response?.data?.message || '메뉴 추가에 실패했습니다.';
            Alert.alert('오류', message);
          },
        }
      );
    }
  };
  
  // 메뉴 삭제
  const handleDeleteMenu = (menu: MenuItem) => {
    Alert.alert('메뉴 삭제', '정말 이 메뉴를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          deleteMenu(menu.id, {
            onSuccess: (data) => {
              Alert.alert('성공', data.message || '메뉴 삭제 요청이 접수되었습니다.');
              refetch();
            },
            onError: (error) => {
              const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
              const message = axiosError.response?.data?.detail || axiosError.response?.data?.message || '메뉴 삭제에 실패했습니다.';
              Alert.alert('오류', message);
            },
          });
        },
      },
    ]);
  };
  
  // 시간 입력 핸들러
  const updateHour = (day: string, field: keyof BusinessHoursDay, value: string | boolean | null) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };
  
  if (isLoading || !restaurant) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">로딩 중...</Text>
      </SafeAreaView>
    );
  }
  
  const menus = menuData?.menus || [];
  const isPending = isUpdatingRestaurant || isUpdatingHours || isCreatingMenu || isUpdatingMenu || isDeletingMenu;
  
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="leftAngle" size={20} />
        </Pressable>
        <Text className="text-lg font-bold">{restaurant.name} 수정</Text>
        <View style={{ width: 20 }} />
      </View>
      
      {/* 탭 */}
      <View className="flex-row border-b border-gray-200">
        <Pressable
          className={`flex-1 items-center py-3 ${selectedTab === 'phone' ? 'border-b-2 border-blue-500' : ''}`}
          onPress={() => setSelectedTab('phone')}
        >
          <Text className={`font-medium ${selectedTab === 'phone' ? 'text-blue-500' : 'text-gray-600'}`}>
            전화번호
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 items-center py-3 ${selectedTab === 'hours' ? 'border-b-2 border-blue-500' : ''}`}
          onPress={() => setSelectedTab('hours')}
        >
          <Text className={`font-medium ${selectedTab === 'hours' ? 'text-blue-500' : 'text-gray-600'}`}>
            운영시간
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 items-center py-3 ${selectedTab === 'menu' ? 'border-b-2 border-blue-500' : ''}`}
          onPress={() => setSelectedTab('menu')}
        >
          <Text className={`font-medium ${selectedTab === 'menu' ? 'text-blue-500' : 'text-gray-600'}`}>
            메뉴
          </Text>
        </Pressable>
      </View>
      
      <ScrollView className="flex-1">
        {/* 전화번호 수정 */}
        {selectedTab === 'phone' && (
          <View className="p-4">
            <Text className="text-sm text-gray-600 mb-2">전화번호</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-4"
              value={phone}
              onChangeText={setPhone}
              placeholder="02-1234-5678"
              keyboardType="phone-pad"
              editable={!isPending}
            />
            <Pressable
              className="bg-blue-500 rounded-lg p-3 items-center"
              onPress={handleSavePhone}
              disabled={isPending}
            >
              {isUpdatingRestaurant ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-medium">저장</Text>
              )}
            </Pressable>
          </View>
        )}
        
        {/* 운영시간 수정 */}
        {selectedTab === 'hours' && (
          <View className="p-4">
            {DAYS.map((day) => {
              const dayData = hours[day];
              if (!dayData) return null;
              
              return (
                <View key={day} className="mb-6 border-b border-gray-200 pb-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-bold">{day}요일</Text>
                    <Switch
                      value={!dayData.is_closed}
                      onValueChange={(value) => updateHour(day, 'is_closed', !value)}
                      disabled={isPending}
                    />
                  </View>
                  
                  {!dayData.is_closed && (
                    <View>
                      <View className="flex-row mb-2">
                        <View className="flex-1 mr-2">
                          <Text className="text-sm text-gray-600 mb-1">오픈</Text>
                          <TextInput
                            className="border border-gray-300 rounded-lg p-2"
                            value={dayData.open_time || ''}
                            onChangeText={(value) => updateHour(day, 'open_time', value)}
                            placeholder="09:00"
                            editable={!isPending}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm text-gray-600 mb-1">마감</Text>
                          <TextInput
                            className="border border-gray-300 rounded-lg p-2"
                            value={dayData.close_time || ''}
                            onChangeText={(value) => updateHour(day, 'close_time', value)}
                            placeholder="22:00"
                            editable={!isPending}
                          />
                        </View>
                      </View>
                      
                      <View className="flex-row mb-2">
                        <View className="flex-1 mr-2">
                          <Text className="text-sm text-gray-600 mb-1">브레이크 시작</Text>
                          <TextInput
                            className="border border-gray-300 rounded-lg p-2"
                            value={dayData.break_start || ''}
                            onChangeText={(value) => updateHour(day, 'break_start', value)}
                            placeholder="14:00"
                            editable={!isPending}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm text-gray-600 mb-1">브레이크 종료</Text>
                          <TextInput
                            className="border border-gray-300 rounded-lg p-2"
                            value={dayData.break_end || ''}
                            onChangeText={(value) => updateHour(day, 'break_end', value)}
                            placeholder="15:00"
                            editable={!isPending}
                          />
                        </View>
                      </View>
                      
                      <View className="mb-2">
                        <Text className="text-sm text-gray-600 mb-1">라스트오더</Text>
                        <TextInput
                          className="border border-gray-300 rounded-lg p-2"
                          value={dayData.last_order || ''}
                          onChangeText={(value) => updateHour(day, 'last_order', value)}
                          placeholder="21:30"
                          editable={!isPending}
                        />
                      </View>
                      
                      <View className="mb-2">
                        <Text className="text-sm text-gray-600 mb-1">특이사항</Text>
                        <TextInput
                          className="border border-gray-300 rounded-lg p-2"
                          value={dayData.special_note || ''}
                          onChangeText={(value) => updateHour(day, 'special_note', value)}
                          placeholder="공휴일 휴무"
                          editable={!isPending}
                        />
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
            
            <Pressable
              className="bg-blue-500 rounded-lg p-3 items-center mt-4"
              onPress={handleSaveHours}
              disabled={isPending}
            >
              {isUpdatingHours ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-medium">저장</Text>
              )}
            </Pressable>
          </View>
        )}
        
        {/* 메뉴 수정 */}
        {selectedTab === 'menu' && (
          <View className="p-4">
            <Pressable
              className="bg-blue-500 rounded-lg p-3 items-center mb-4"
              onPress={() => handleOpenMenuEdit()}
              disabled={isPending}
            >
              <Text className="text-white font-medium">+ 메뉴 추가</Text>
            </Pressable>
            
            {/* 메뉴 목록 */}
            {menus.map((menu) => (
              <View key={menu.id} className="border border-gray-300 rounded-lg p-4 mb-3">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-lg font-bold">{menu.name}</Text>
                    {menu.price && (
                      <Text className="text-gray-600">{menu.price.toLocaleString()}원</Text>
                    )}
                    {menu.description && (
                      <Text className="text-gray-500 text-sm mt-1">{menu.description}</Text>
                    )}
                  </View>
                  <View className="flex-row gap-2">
                    <Pressable
                      className="bg-blue-500 rounded px-3 py-1"
                      onPress={() => {
                        console.log('Menu edit button pressed for menu:', menu.id);
                        handleOpenMenuEdit(menu);
                      }}
                      disabled={isPending}
                    >
                      <Text className="text-white text-sm">수정</Text>
                    </Pressable>
                    <Pressable
                      className="bg-red-500 rounded px-3 py-1"
                      onPress={() => handleDeleteMenu(menu)}
                      disabled={isPending}
                    >
                      <Text className="text-white text-sm">삭제</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
            
            {/* 메뉴 추가/수정 폼 */}
            {editingMenu !== undefined && (
              <View className="mt-4 border border-gray-300 rounded-lg p-4 bg-gray-50">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-bold">
                    {editingMenu ? '메뉴 수정' : '메뉴 추가'}
                  </Text>
                  <Pressable onPress={() => setEditingMenu(undefined)}>
                    <Text className="text-blue-500">닫기</Text>
                  </Pressable>
                </View>
                
                <Text className="text-sm text-gray-600 mb-1">메뉴명 *</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2 mb-3 bg-white"
                  value={menuName}
                  onChangeText={setMenuName}
                  placeholder="제육볶음"
                  editable={!isPending}
                />
                
                <Text className="text-sm text-gray-600 mb-1">가격</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2 mb-3 bg-white"
                  value={menuPrice}
                  onChangeText={setMenuPrice}
                  placeholder="12000"
                  keyboardType="number-pad"
                  editable={!isPending}
                />
                
                <Text className="text-sm text-gray-600 mb-1">설명</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2 mb-3 bg-white"
                  value={menuDescription}
                  onChangeText={setMenuDescription}
                  placeholder="맛있는 제육볶음입니다"
                  multiline
                  editable={!isPending}
                />
                
                <Text className="text-sm text-gray-600 mb-1">카테고리</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2 mb-3 bg-white"
                  value={menuCategory}
                  onChangeText={setMenuCategory}
                  placeholder="메인"
                  editable={!isPending}
                />
                
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-sm text-gray-600">인기 메뉴</Text>
                  <Switch
                    value={menuIsPopular}
                    onValueChange={setMenuIsPopular}
                    disabled={isPending}
                  />
                </View>
                
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-sm text-gray-600">판매 가능</Text>
                  <Switch
                    value={menuIsAvailable}
                    onValueChange={setMenuIsAvailable}
                    disabled={isPending}
                  />
                </View>
                
                <Text className="text-sm text-gray-600 mb-1">표시 순서</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2 mb-3 bg-white"
                  value={menuDisplayOrder.toString()}
                  onChangeText={(value) => setMenuDisplayOrder(parseInt(value) || 0)}
                  placeholder="0"
                  keyboardType="number-pad"
                  editable={!isPending}
                />
                
                <View className="flex-row gap-2 mt-2">
                  <Pressable
                    className="flex-1 bg-blue-500 rounded-lg p-3 items-center"
                    onPress={handleSaveMenu}
                    disabled={isPending}
                  >
                    {(isCreatingMenu || isUpdatingMenu) ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-medium">저장</Text>
                    )}
                  </Pressable>
                  <Pressable
                    className="flex-1 bg-gray-400 rounded-lg p-3 items-center"
                    onPress={() => setEditingMenu(undefined)}
                    disabled={isPending}
                  >
                    <Text className="text-white font-medium">취소</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

