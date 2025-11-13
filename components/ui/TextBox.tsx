import { View, Text, Image } from 'react-native';

interface TextBoxProps {
    boxClass?: string,
    imagefile?: any,
    imageClass?: string,
    text?: string,
    textClass?: string,
}

const stylePreset = {
  red: "",
  blue: "",
  yellow: "",
  black: "",
}

export default function TextBox({ boxClass = "", imagefile = "", imageClass = "", text = "", textClass = "" }: TextBoxProps) {
  return (
    <View className={` ${boxClass}`}>
      <Image source={imagefile} className={`${imageClass}`}/>
      <Text className={`class ${textClass}`}>{text}</Text>
    </View>
  );
}