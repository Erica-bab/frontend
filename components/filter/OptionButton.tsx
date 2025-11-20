import { Pressable,Text } from "react-native"

interface OptionButtonProps{
    onPress?:()=>void;
    text:string;
    isSelected?:boolean;
}

export function OptionBtn({onPress,text,isSelected}:OptionButtonProps){
    return(
        <Pressable
            onPress={onPress}
            className="px-6 py-3 rounded-full"
            style={{
                backgroundColor: isSelected ? 'rgba(59, 130, 246, 1)' : 'rgba(248, 250, 252, 1)',
                borderWidth: 1,
                borderColor: 'rgba(226, 232, 240, 1)'
            }}
        >
            <Text className={`text-center ${isSelected ? 'text-white' : 'text-black'}`}>{text}</Text>
        </Pressable>
    )
}