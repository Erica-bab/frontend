import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler'; // ★ gesture-handler에서 가져오기

interface DropdownProps {
  label: string;
  options: string[];
  selectedValue?: string;
  onSelect: (value: string | undefined) => void;
  placeholder?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function Dropdown({
  label,
  options,
  selectedValue,
  onSelect,
  placeholder = '선택하세요',
  isOpen: externalIsOpen,
  onToggle,
}: DropdownProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen ?? internalIsOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!isOpen);
    }
  };

  return (
    <View className="mb-4 relative">
      <Pressable
        onPress={handleToggle}
        className="px-8 py-3 rounded-lg"
        style={{
          backgroundColor:
            isOpen || selectedValue
              ? 'rgba(59, 130, 246, 1)'
              : 'rgba(248, 250, 252, 1)',
          borderWidth: 1,
          borderColor: 'rgba(226, 232, 240, 1)',
        }}
      >
        <Text className={isOpen || selectedValue ? 'text-white' : 'text-black'}>
          {selectedValue || placeholder}
        </Text>
      </Pressable>

      {isOpen && (
        <View
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg"
          style={{
            borderWidth: 1,
            borderColor: 'rgba(226, 232, 240, 1)',
            maxHeight: 220, // ★ 스크롤이 실제로 생기도록 높이 제한
            zIndex: 2000,
            overflow: 'hidden',
          }}
        >
          <ScrollView
            nestedScrollEnabled={true} // ★ 안드로이드 중첩 스크롤 허용
            keyboardShouldPersistTaps="handled"
          >
            {options.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  onSelect(selectedValue === option ? undefined : option);
                  if (onToggle) {
                    onToggle();
                  } else {
                    setInternalIsOpen(false);
                  }
                }}
                className="px-4 py-3 border-b border-gray-100"
              >
                <Text
                  className={`text-base ${
                    selectedValue === option
                      ? 'font-bold text-blue-600'
                      : 'text-black'
                  }`}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
