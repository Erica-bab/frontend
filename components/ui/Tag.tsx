import { View } from "react-native";
import { ReactNode } from "react";

interface TagProps{
    children:ReactNode;
    bgColor?: string;
    borderColor?: string;
    variant?: 'filled' | 'outlined';
}

// 가능한 모든 색상 정의 (NativeWind가 스캔할 수 있도록)
const borderColors = {
    'border-blue-500': 'border-blue-500',
    'border-red-500': 'border-red-500',
    'border-orange-400': 'border-orange-400',
    'border-green-500': 'border-green-500',
    'border-yellow-500': 'border-yellow-500',
};

const bgColors = {
    'bg-blue-500': 'bg-blue-500',
    'bg-red-500': 'bg-red-500',
    'bg-orange-400': 'bg-orange-400',
    'bg-green-500': 'bg-green-500',
    'bg-yellow-100': 'bg-yellow-100',
};

export default function Tag({
    children,
    bgColor = 'bg-blue-500',
    borderColor,
    variant = 'filled'
}:TagProps){
    const baseStyle = 'rounded-xl px-3 py-1';

    if (variant === 'outlined') {
        // 테두리만 있는 스타일
        const border = (borderColor && borderColors[borderColor as keyof typeof borderColors]) || borderColors['border-blue-500'];
        return(
            <View className={`${baseStyle} border ${border} bg-transparent`}>
                {children}
            </View>
        )
    }

    // 배경색이 있는 기본 스타일
    const bg = (bgColor && bgColors[bgColor as keyof typeof bgColors]) || bgColors['bg-blue-500'];
    return(
        <View className={`${baseStyle} ${bg}`}>
            {children}
        </View>
    )
}