import React from "react";
import { View, Text } from "react-native";
import Icon, { IconName } from "@/components/Icon";

const stylePreset = {
  red: {
    box: "rounded-2xl border-[#E63946] border-2",
    text: "text-[#E63946] font-bold text-base",
    iconColor: "#E63946",
  },
  blue: {
    box: "rounded-2xl border-[#2563EB] border-2",
    text: "text-[#2563EB] font-bold text-base",
    iconColor: "#2563EB",
  },
  yellow: {
    box: "rounded-2xl border-[#F59E0B] border-2",
    text: "text-[#F59E0B] font-bold text-base",
    iconColor: "#F59E0B",
  },
  gray: {
    box: "rounded-2xl border-[#6C6C6C] border-2",
    text: "text-[#6C6C6C] font-bold text-base",
    iconColor: "#6C6C6C",
  },
  white: {
    box: "",
    text: "",
    iconColor: "#FFFFFF",
  },
  none: {
    box: "",
    text: "",
    iconColor: undefined,
  },
} as const;

interface TextIconBoxProps {
  preset?: keyof typeof stylePreset;
  boxClass?: string;
  icon?: IconName;
  text?: string;
  textClass?: string;
  iconSize?: number;
  iconColor?: string;
}

export default function TextIconBox({
  preset = "none",
  boxClass = "",
  icon = "clock",
  text = "",
  textClass = "",
  iconSize = 16,
  iconColor,
}: TextIconBoxProps) {
  const presetStyle = stylePreset[preset];

  return (
    <View className={`flex-row items-center px-[5px] py-[5px] ${presetStyle.box} ${boxClass}`}>
      <View className="pl-[5px]">
        <Icon
          name={icon}
          size={iconSize}
          color={iconColor ?? presetStyle.iconColor}
        />
      </View>

      <Text className={`px-[5px] ${presetStyle.text} ${textClass}`}>
        {text}
      </Text>
    </View>
  );
}
