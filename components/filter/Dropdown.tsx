import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

interface DropdownProps {
  label: string;
  options: string[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function Dropdown({ label, options, selectedValue, onSelect, placeholder = '선택하세요', isOpen: externalIsOpen, onToggle }: DropdownProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  return (
    <View className="mb-4 relative">
      <Pressable
        onPress={handleToggle}
        className="px-8 py-3 rounded-lg"
        style={{
          backgroundColor: (isOpen || selectedValue) ? 'rgba(59, 130, 246, 1)' : 'rgba(248, 250, 252, 1)',
          borderWidth: 1,
          borderColor: 'rgba(226, 232, 240, 1)'
        }}
      >
        <Text className={(isOpen || selectedValue) ? 'text-white' : 'text-black'}>
          {selectedValue || placeholder}
        </Text>
      </Pressable>

      {isOpen && (
        <View
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg overflow-hidden"
          style={{
            borderWidth: 1,
            borderColor: 'rgba(226, 232, 240, 1)',
            maxHeight: 200,
            zIndex: 1000
          }}
        >
          <ScrollView>
            {options.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  onSelect(option);
                  if (onToggle) {
                    onToggle();
                  } else {
                    setInternalIsOpen(false);
                  }
                }}
                className="px-4 py-3 border-b border-gray-100"
              >
                <Text className={`text-base ${selectedValue === option ? 'font-bold text-blue-600' : 'text-black'}`}>
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
