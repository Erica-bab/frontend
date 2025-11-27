import { useState, useEffect } from 'react';
import { Dropdown } from "@/components/filter/Dropdown";
import { View, Text, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import Button from "@/components/ui/Button";
import { useCurrentUser, useUpdateUser } from '@/api/auth/useAuth';
import { OptionBtn } from '@/components/filter/OptionButton';

// FilterScreen에서 가져온 단과대 목록
const COLLEGES = ['공학대학', '소프트웨어융합대학', '약학대학', '첨단융합대학', '글로벌문화통상대학', '커뮤니케이션&컬쳐대학', '경상대학', '디자인대학', '예체능대학', 'LIONS칼리지'];

// 학번 옵션 생성 (현재 연도 기준으로 최근 10년)
const getStudentYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 10; i++) {
    const year = currentYear - i;
    const shortYear = year.toString().slice(-2);
    years.push(`${shortYear}학번`);
  }
  return years;
};

const STUDENT_YEARS = getStudentYearOptions();

type UserType = 'student' | 'other';

export default function AddInfo() {
  const navigation = useNavigation();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const [userType, setUserType] = useState<UserType>('student');
  const [studentYear, setStudentYear] = useState<string>('');
  const [college, setCollege] = useState<string>('');
  const [activeDropdown, setActiveDropdown] = useState<'year' | 'college' | null>(null);

  // 현재 사용자 정보가 있으면 초기값 설정
  useEffect(() => {
    if (currentUser) {
      // student_year와 college가 모두 있으면 학생, 없으면 기타
      if (currentUser.student_year && currentUser.college) {
        setUserType('student');
        setStudentYear(currentUser.student_year);
        if (currentUser.college?.name) {
          setCollege(currentUser.college.name);
        }
      } else {
        setUserType('other');
      }
    }
  }, [currentUser]);

  const handleSubmit = () => {
    if (userType === 'student') {
      // 학생인 경우 학번과 단과대 모두 필요
      if (!studentYear) {
        Alert.alert('입력 오류', '학번을 선택해주세요.');
        return;
      }
      if (!college) {
        Alert.alert('입력 오류', '단과대를 선택해주세요.');
        return;
      }

      // 단과대 이름으로 ID 찾기
      // 하드코딩된 배열의 인덱스를 사용 (백엔드에서 이름으로 ID를 찾도록 처리 필요)
      // 현재는 인덱스 + 1을 ID로 사용 (실제로는 백엔드에서 이름으로 ID를 조회해야 함)
      const collegeIndex = COLLEGES.indexOf(college);
      if (collegeIndex === -1) {
        Alert.alert('입력 오류', '유효하지 않은 단과대입니다.');
        return;
      }

      // TODO: 백엔드에서 단과대 이름으로 ID를 조회하도록 API 수정 필요
      // 현재는 임시로 인덱스 + 1을 사용
      updateUser(
        {
          student_type: 'student',
          student_year: studentYear,
          college_id: collegeIndex + 1, // 임시: 실제로는 백엔드에서 이름으로 ID 조회 필요
        },
        {
          onSuccess: () => {
            Alert.alert('완료', '정보가 저장되었습니다.', [
              {
                text: '확인',
                onPress: () => navigation.goBack(),
              },
            ]);
          },
          onError: (error: any) => {
            console.error('정보 업데이트 실패:', error);
            Alert.alert('오류', error?.response?.data?.detail || '정보 저장에 실패했습니다.');
          },
        }
      );
    } else {
      // 기타(비공개)인 경우
      updateUser(
        {
          student_type: 'other',
        },
        {
          onSuccess: () => {
            Alert.alert('완료', '정보가 저장되었습니다.', [
              {
                text: '확인',
                onPress: () => navigation.goBack(),
              },
            ]);
          },
          onError: (error: any) => {
            console.error('정보 업데이트 실패:', error);
            Alert.alert('오류', error?.response?.data?.detail || '정보 저장에 실패했습니다.');
          },
        }
      );
    }
  };

  if (isLoadingUser) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">로딩 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="pt-6 pb-4">
          <Text className="text-2xl font-bold mb-2">사용자 정보 입력</Text>
          <Text className="text-gray-600">서비스 이용을 위해 정보를 입력해주세요</Text>
        </View>

        {/* 사용자 유형 선택 */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3">사용자 유형</Text>
          <View className="flex-row gap-2">
            <OptionBtn
              text="학생"
              isSelected={userType === 'student'}
              onPress={() => {
                setUserType('student');
                // 기타에서 학생으로 변경 시 초기화
                if (userType === 'other') {
                  setStudentYear('');
                  setCollege('');
                }
              }}
            />
            <OptionBtn
              text="기타(비공개)"
              isSelected={userType === 'other'}
              onPress={() => {
                setUserType('other');
                // 학생에서 기타로 변경 시 초기화
                if (userType === 'student') {
                  setStudentYear('');
                  setCollege('');
                }
              }}
            />
          </View>
        </View>

        {/* 학생 정보 입력 (학생 선택 시에만 표시) */}
        {userType === 'student' && (
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3">학생 정보</Text>
            <Text className="text-gray-600 mb-4">서비스 이용을 위해 학번과 단과대를 인증해주세요</Text>

            <View className="mb-4">
              <Text className="text-base font-medium mb-2">학번</Text>
              <Dropdown
                label="학번"
                options={STUDENT_YEARS}
                selectedValue={studentYear}
                onSelect={setStudentYear}
                placeholder="학번 선택"
                isOpen={activeDropdown === 'year'}
                onToggle={() => setActiveDropdown(activeDropdown === 'year' ? null : 'year')}
              />
            </View>

            <View className="mb-4">
              <Text className="text-base font-medium mb-2">단과대</Text>
              <Dropdown
                label="단과대"
                options={COLLEGES}
                selectedValue={college}
                onSelect={setCollege}
                placeholder="단과대 선택"
                isOpen={activeDropdown === 'college'}
                onToggle={() => setActiveDropdown(activeDropdown === 'college' ? null : 'college')}
              />
            </View>
          </View>
        )}

        {/* 제출 버튼 */}
        <View className="mt-4">
          <Button
            onPress={handleSubmit}
            disabled={isUpdating || (userType === 'student' && (!studentYear || !college))}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text>저장하기</Text>
            )}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}