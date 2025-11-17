import React from "react";
import { View, Text } from "react-native";

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
  icon?: React.ComponentType<{ color?: string; width?: number; height?: number }>;
  text?: string;
  textClass?: string;
}

export default function TextIconBox({ preset = "none", boxClass = "", icon: Icon, text = "", textClass = "", }: TextIconBoxProps) {
  const presetStyle = stylePreset[preset];

  return (
    <View className={`flex-row items-center px-[5px] py-[5px] ${presetStyle.box} ${boxClass}`}>
      {Icon && (
        <View className="pl-[5px]">
          <Icon width={20} height={20} color={presetStyle.iconColor} />
        </View>
      )}

      <Text className={`px-[5px] ${presetStyle.text} ${textClass}`}>
        {text}
      </Text>
    </View>
  );
}
