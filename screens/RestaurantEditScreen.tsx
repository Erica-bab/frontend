import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, Switch, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRestaurantDetail, useUpdateRestaurant, useUpdateRestaurantHours, useCreateMenu, useUpdateMenu, useDeleteMenu, useRestaurantMenus } from '@/api/restaurants/useRestaurant';
import { RestaurantDetailResponse, BusinessHoursDay, MenuItem } from '@/api/restaurants/types';
import Icon from '@/components/Icon';
import { useAuth } from '@/api/auth/useAuth';
import { AxiosError } from 'axios';
import { getSafeErrorMessage } from '@/utils/errorHandler';
import { Dropdown } from '@/components/filter/Dropdown';

type EditTabType = 'phone' | 'hours' | 'menu' | 'affiliation';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const DAY_NUMBERS = ['1', '2', '3', '4', '5', '6', '7'];

// 단과대 목록
const COLLEGES = ['공학대학', '소프트웨어융합대학', '약학대학', '첨단융합대학', '글로벌문화통상대학', '커뮤니케이션&컬쳐대학', '경상대학', '디자인대학', '예체능대학', 'LIONS칼리지'];

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
  const [menuName, setMenuName] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  
  // 제휴 수정 상태
  const [affiliations, setAffiliations] = useState<Array<{ college_id: number; college_name: string; year: number; description?: string }>>([]);
  const [editingAffiliation, setEditingAffiliation] = useState<{ college_id: number; college_name: string; year: number; description?: string } | null | undefined>(undefined);
  const [selectedCollege, setSelectedCollege] = useState<string>('');
  const [affiliationDescription, setAffiliationDescription] = useState<string>('');
  const [activeDropdown, setActiveDropdown] = useState<'college' | null>(null);
  
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
      
      // 제휴 초기화
      if (restaurant.affiliations) {
        setAffiliations(restaurant.affiliations.map(aff => ({
          college_id: aff.college_id,
          college_name: aff.college_name,
          year: aff.year,
        })));
      }
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
          const message = getSafeErrorMessage(error, '전화번호 수정에 실패했습니다.');
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
          const message = getSafeErrorMessage(error, '운영시간 수정에 실패했습니다.');
          Alert.alert('오류', message);
        },
      }
    );
  };
  
  // 메뉴 추가/수정 모달 열기
  const handleOpenMenuEdit = (menu?: MenuItem) => {
    if (menu) {
      setEditingMenu(menu);
      setMenuName(menu.name);
      setMenuPrice(menu.price?.toString() || '');
    } else {
      setEditingMenu(null);
      setMenuName('');
      setMenuPrice('');
    }
  };
  
  // 메뉴 저장
  const handleSaveMenu = () => {
    if (!menuName.trim()) {
      Alert.alert('오류', '메뉴명을 입력해주세요.');
      return;
    }
    
    if (editingMenu) {
      // 메뉴 수정 - 이름과 가격만 수정 가능
      updateMenu(
        {
          menuId: editingMenu.id,
          request: {
            name: menuName.trim(),
            price: menuPrice ? parseInt(menuPrice) : undefined,
            version: editingMenu.meta?.version || 1,
          },
        },
        {
          onSuccess: (data) => {
            Alert.alert('성공', data.message || '메뉴 수정 요청이 접수되었습니다.');
            setEditingMenu(undefined);
            refetch();
          },
          onError: (error) => {
            const message = getSafeErrorMessage(error, '메뉴 수정에 실패했습니다.');
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
        },
        {
          onSuccess: (data) => {
            Alert.alert('성공', data.message || '메뉴 추가 요청이 접수되었습니다.');
            setEditingMenu(undefined);
            refetch();
          },
          onError: (error) => {
            const message = getSafeErrorMessage(error, '메뉴 추가에 실패했습니다.');
            Alert.alert('오류', message);
          },
        }
      );
    }
  };
  
  // 제휴 추가/수정 모달 열기
  const handleOpenAffiliationEdit = (affiliation?: { college_id: number; college_name: string; year: number; description?: string }) => {
    if (affiliation) {
      setEditingAffiliation(affiliation);
      setSelectedCollege(affiliation.college_name);
      setAffiliationDescription(affiliation.description || '');
    } else {
      setEditingAffiliation(null);
      setSelectedCollege('');
      setAffiliationDescription('');
    }
  };
  
  // 제휴 저장
  const handleSaveAffiliation = () => {
    if (!selectedCollege) {
      Alert.alert('오류', '단과대를 선택해주세요.');
      return;
    }
    
    const collegeIndex = COLLEGES.indexOf(selectedCollege);
    if (collegeIndex === -1) {
      Alert.alert('오류', '유효하지 않은 단과대입니다.');
      return;
    }
    
    const currentYear = new Date().getFullYear();
    const newAffiliation = {
      college_id: collegeIndex + 1,
      college_name: selectedCollege,
      year: currentYear,
      description: affiliationDescription.trim() || undefined,
    };
    
    if (editingAffiliation) {
      // 제휴 수정
      setAffiliations(prev => prev.map(aff => 
        aff.college_id === editingAffiliation.college_id 
          ? newAffiliation 
          : aff
      ));
    } else {
      // 제휴 추가
      const exists = affiliations.some(aff => aff.college_id === newAffiliation.college_id);
      if (exists) {
        Alert.alert('오류', '이미 추가된 단과대입니다.');
        return;
      }
      setAffiliations(prev => [...prev, newAffiliation]);
    }
    
    setEditingAffiliation(undefined);
    setSelectedCollege('');
    setAffiliationDescription('');
  };
  
  // 제휴 삭제
  const handleDeleteAffiliation = (affiliation: { college_id: number; college_name: string; year: number; description?: string }) => {
    Alert.alert('제휴 삭제', '정말 이 제휴를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          setAffiliations(prev => prev.filter(aff => aff.college_id !== affiliation.college_id));
        },
      },
    ]);
  };
  
  // 제휴 저장 (서버에 전송)
  const handleSaveAffiliations = () => {
    if (!restaurant) return;
    
    // 백엔드 API 형식에 맞게 변환 (college_id와 description만 전송)
    const affiliationsData = affiliations.map(aff => ({
      college_id: aff.college_id,
      description: aff.description,
    }));
    
    updateRestaurant(
      { 
        affiliations: affiliationsData, 
        version: restaurant.meta.version 
      },
      {
        onSuccess: (data) => {
          Alert.alert('성공', data.message || '제휴 수정 요청이 접수되었습니다.');
          refetch();
        },
        onError: (error) => {
          const message = getSafeErrorMessage(error, '제휴 수정에 실패했습니다.');
          Alert.alert('오류', message);
        },
      }
    );
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
              const message = getSafeErrorMessage(error, '메뉴 삭제에 실패했습니다.');
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
  
  // 사용 가능한 단과대 목록 (이미 추가된 단과대 제외)
  const availableColleges = COLLEGES.filter(college => 
    !affiliations.some(aff => aff.college_name === college) || 
    (editingAffiliation && editingAffiliation.college_name === college)
  );
  
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
        <Pressable
          className={`flex-1 items-center py-3 ${selectedTab === 'affiliation' ? 'border-b-2 border-blue-500' : ''}`}
          onPress={() => setSelectedTab('affiliation')}
        >
          <Text className={`font-medium ${selectedTab === 'affiliation' ? 'text-blue-500' : 'text-gray-600'}`}>
            제휴
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
          </View>
        )}
        
        {/* 제휴 수정 */}
        {selectedTab === 'affiliation' && (
          <View className="p-4">
            <Pressable
              className="bg-blue-500 rounded-lg p-3 items-center mb-4"
              onPress={() => handleOpenAffiliationEdit()}
              disabled={isPending}
            >
              <Text className="text-white font-medium">+ 제휴 추가</Text>
            </Pressable>
            
            {/* 제휴 목록 */}
            {affiliations.map((affiliation) => (
              <View key={affiliation.college_id} className="border border-gray-300 rounded-lg p-4 mb-3">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-lg font-bold">{affiliation.college_name}</Text>
                    {affiliation.description && (
                      <Text className="text-gray-600 mt-1">{affiliation.description}</Text>
                    )}
                    {!affiliation.description && (
                      <Text className="text-gray-400 text-sm mt-1">제휴 내용 없음</Text>
                    )}
                  </View>
                  <View className="flex-row gap-2">
                    <Pressable
                      className="bg-blue-500 rounded px-3 py-1"
                      onPress={() => handleOpenAffiliationEdit(affiliation)}
                      disabled={isPending}
                    >
                      <Text className="text-white text-sm">수정</Text>
                    </Pressable>
                    <Pressable
                      className="bg-red-500 rounded px-3 py-1"
                      onPress={() => handleDeleteAffiliation(affiliation)}
                      disabled={isPending}
                    >
                      <Text className="text-white text-sm">삭제</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
            
            {affiliations.length === 0 && (
              <View className="border border-gray-300 rounded-lg p-8 items-center">
                <Text className="text-gray-500">등록된 제휴가 없습니다.</Text>
              </View>
            )}
            
            {affiliations.length > 0 && (
              <Pressable
                className="bg-blue-500 rounded-lg p-3 items-center mt-4"
                onPress={handleSaveAffiliations}
                disabled={isPending}
              >
                <Text className="text-white font-medium">저장</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
      
      {/* 제휴 추가/수정 모달 */}
      <Modal
        visible={editingAffiliation !== undefined}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditingAffiliation(undefined)}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-center items-center px-4"
          onPress={() => setEditingAffiliation(undefined)}
        >
          <Pressable 
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold">
                {editingAffiliation ? '제휴 수정' : '제휴 추가'}
              </Text>
              <Pressable onPress={() => setEditingAffiliation(undefined)}>
                <Icon name="cancel" width={24} height={24} />
              </Pressable>
            </View>
            
            <Text className="text-sm text-gray-600 mb-2">단과대 *</Text>
            <Dropdown
              label="단과대"
              options={availableColleges}
              selectedValue={selectedCollege}
              onSelect={setSelectedCollege}
              placeholder="단과대 선택"
              isOpen={activeDropdown === 'college'}
              onToggle={() => setActiveDropdown(activeDropdown === 'college' ? null : 'college')}
            />
            
            <Text className="text-sm text-gray-600 mb-2 mt-2">제휴 내용</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-6 bg-white"
              value={affiliationDescription}
              onChangeText={setAffiliationDescription}
              placeholder="예: 10% 할인, 학생증 제시 시 5% 할인 등"
              multiline
              editable={!isPending}
            />
            
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 bg-gray-300 rounded-lg p-4 items-center"
                onPress={() => setEditingAffiliation(undefined)}
                disabled={isPending}
              >
                <Text className="text-white font-medium">취소</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-blue-500 rounded-lg p-4 items-center"
                onPress={handleSaveAffiliation}
                disabled={isPending}
              >
                <Text className="text-white font-medium">저장</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      
      {/* 메뉴 추가/수정 모달 */}
      <Modal
        visible={editingMenu !== undefined}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditingMenu(undefined)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <Pressable 
            className="flex-1" 
            onPress={() => setEditingMenu(undefined)}
          />
          <View className="bg-white rounded-t-3xl p-6 pb-8">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold">
                {editingMenu ? '메뉴 수정' : '메뉴 추가'}
              </Text>
              <Pressable onPress={() => setEditingMenu(undefined)}>
                <Icon name="cancel" width={24} height={24} />
              </Pressable>
            </View>
            
            <Text className="text-sm text-gray-600 mb-2">메뉴명 *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-4 bg-white"
              value={menuName}
              onChangeText={setMenuName}
              placeholder="제육볶음"
              editable={!isPending}
            />
            
            <Text className="text-sm text-gray-600 mb-2">가격</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-6 bg-white"
              value={menuPrice}
              onChangeText={setMenuPrice}
              placeholder="12000"
              keyboardType="number-pad"
              editable={!isPending}
            />
            
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 bg-gray-300 rounded-lg p-4 items-center"
                onPress={() => setEditingMenu(undefined)}
                disabled={isPending}
              >
                <Text className="text-white font-medium">취소</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-blue-500 rounded-lg p-4 items-center"
                onPress={handleSaveMenu}
                disabled={isPending}
              >
                {(isCreatingMenu || isUpdatingMenu) ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-medium">저장</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

