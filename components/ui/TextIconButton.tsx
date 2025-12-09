import React, { useEffect } from "react";
import { View, Text, StyleProp, ViewStyle, Pressable } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
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

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
    opacity.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  }, [isOn]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.95, {
        damping: 15,
        stiffness: 300,
      });
      opacity.value = withSpring(0.8, {
        damping: 15,
        stiffness: 300,
      });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });
      opacity.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={animatedStyle}
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
      </Animated.View>
    </Pressable>
  );
}
