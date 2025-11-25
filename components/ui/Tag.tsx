import { View } from "react-native";
import { ReactNode } from "react";

interface TagProps {
  children: ReactNode;
  className?: string;
}

export default function Tag({ children, className = '' }: TagProps) {
  return (
    <View className={`rounded-full px-3 py-1 border ${className}`}>
      {children}
    </View>
  );
}
