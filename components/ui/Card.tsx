import { ReactNode} from "react"
import { View, ViewStyle } from "react-native";

interface CardProps{
    children: ReactNode;
    variant?: 'default' | 'banner' | 'danger' | 'success';
    style?: ViewStyle;
}

const variantStyles = {
    default: 'bg-white border border-gray-300',
    banner: 'bg-blue-500',
    danger: 'bg-red-500',
    success: 'bg-green-500',
};

export default function Card({children, variant = 'default', style}:CardProps){
    return(
        <View className={`rounded-2xl p-4 mx-2 my-2 self-stretch ${variantStyles[variant]}`} style={{ gap: 8, ...style }}>
            {children}
        </View>
    )
}