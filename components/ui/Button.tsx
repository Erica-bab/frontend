import { Pressable, Text } from 'react-native';

interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
}

const variantStyles = {
  primary: 'bg-blue-500',
  secondary: 'bg-gray-500',
  danger: 'bg-red-500',
};

const variantTextStyles = {
  primary: 'text-white',
  secondary: 'text-white',
  danger: 'text-white',
};

export default function Button({ onPress, children, variant = 'primary', disabled = false, className }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`px-6 py-3 rounded-lg ${variantStyles[variant]} ${disabled ? 'opacity-50' : ''} ${className || ''}`}
    >
      <Text className={`text-center font-bold ${variantTextStyles[variant]}`}>
        {children}
      </Text>
    </Pressable>
  );
}
