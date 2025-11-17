import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface TextIconButtonProps {
  isOn: boolean;

  icon?: React.ComponentType<{ color?: string; width?: number; height?: number }>;
  text?: string;
  onPress?: () => void;
  disabled?: boolean;

  baseBoxClass?: string;
  baseTextClass?: string;

  onBoxClass?: string;
  offBoxClass?: string;
  onTextClass?: string;
  offTextClass?: string;
  onIconColor?: string;
  offIconColor?: string;
}

export default function TextIconButton({ isOn, icon: Icon, text = "", onPress, disabled = false, baseBoxClass = "", baseTextClass = "", onBoxClass = "", offBoxClass = "", onTextClass = "", offTextClass = "", onIconColor, offIconColor }: TextIconButtonProps) {

  const boxClass = `${baseBoxClass} ${isOn ? onBoxClass : offBoxClass}`;
  const textClass = `${baseTextClass} ${isOn ? onTextClass : offTextClass}`;
  const iconColor = isOn ? onIconColor : offIconColor;

  if (isOn) {
    console.log(`${text} ON`);
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center px-[8px] py-[8px] ${boxClass} ${
        disabled ? "opacity-40" : ""
      }`}
    >
      {Icon && (
        <View className="mr-[5px]">
          <Icon width={20} height={20} color={iconColor} />
        </View>
      )}

      <Text className={textClass}>{text}</Text>
    </TouchableOpacity>
  );
}
