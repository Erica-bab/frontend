import { View, Text, Image } from "react-native";

interface TextBoxProps {
  preset?: keyof typeof stylePreset;
  boxClass?: string;
  imagefile?: any;
  imageClass?: string;
  text?: string;
  textClass?: string;
}

const stylePreset = {
  red: {
    box: "rounded-2xl border-[#E63946] border-2",
    text: "text-[#E63946] font-bold text-base",
    image: "#E63946",
  },
  blue: {
    box: "rounded-2xl border-[#2563EB] border-2",
    text: "text-[#2563EB] font-bold text-base",
    image: "#2563EB",
  },
  yellow: {
    box: "rounded-2xl border-[#F59E0B] border-2",
    text: "text-[#F59E0B] font-bold text-base",
    image: "#F59E0B",
  },
  gray: {
    box: "rounded-2xl border-[#6C6C6C] border-2",
    text: "text-[#6C6C6C] font-bold text-base",
    image: "#6C6C6C",
  },
  none: { box: "", text: "", image: undefined },
} as const;


export default function TextBox({ preset = "none", boxClass = "", imagefile, imageClass = "", text = "", textClass = "", }: TextBoxProps) {

  const presetStyle = stylePreset[preset];

  return (
    <View className={`flex-row px-[5px] py-[5px] ${presetStyle.box} ${boxClass}`}>
      {imagefile && (
      <View className="px-[5px]">
        <Image
          source={imagefile}
          className={`${imageClass}`}
          style={{ tintColor: `${presetStyle.image}` }}
        />
      </View>
      )}
      <Text className={`px-[5px] ${presetStyle.text} ${textClass}`}>
        {text}
      </Text>
    </View>
  );
}
