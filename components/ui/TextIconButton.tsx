import React from "react";
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import Icon, { IconName } from "@/components/Icon";

interface TextIconButtonProps {
  isOn: boolean;

  iconName?: IconName;
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

  iconSize?: number;
  iconStyle?: StyleProp<ViewStyle>;
}

export default function TextIconButton({
  isOn,
  iconName,
  text = "",
  onPress,
  disabled = false,
  baseBoxClass = "",
  baseTextClass = "",
  onBoxClass = "",
  offBoxClass = "",
  onTextClass = "",
  offTextClass = "",
  onIconColor,
  offIconColor,
  iconSize = 20,
  iconStyle,
}: TextIconButtonProps) {
  const boxClass = `${baseBoxClass} ${isOn ? onBoxClass : offBoxClass}`;
  const textClass = `${baseTextClass} ${isOn ? onTextClass : offTextClass}`;
  const iconColor = isOn ? onIconColor : offIconColor;

  /* if (isOn) {
    console.log(`${text} ON`);
  } */

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center px-[8px] py-[8px] ${boxClass} ${
        disabled ? "opacity-40" : ""
      }`}
    >
      {iconName && (
        <View className="mr-[5px]">
          <Icon
            name={iconName}
            size={iconSize}
            color={iconColor}
            style={iconStyle}
          />
        </View>
      )}

      <Text className={textClass}>{text}</Text>
    </TouchableOpacity>
  );
}
