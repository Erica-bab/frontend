import { View, Modal, Text, Pressable } from 'react-native';
import NaverMapWebView from '@/components/NaverMapWebView';
import TextIconButton from '@/components/ui/TextIconButton';
import TextIconBox from '@/components/ui/TextIconBox';

interface MapModalProps {
  location: string
  latitude: number,
  longtitude: number,
  viewName?: string,
  visible: boolean,
  setVisible: (type: boolean) => void;
}

export default function MapModal({ location, latitude, longtitude, viewName, visible, setVisible }: MapModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      {/* 반투명 배경 */}
      <Pressable
        className="flex-1 bg-black/40 justify-center items-center"
        onPress={() => setVisible(false)} // 바깥 클릭 시 닫기
      >
        {/* 모달 박스 */}
        <Pressable
          className="w-4/5 bg-white rounded-2xl p-5"
          onPress={() => {}}
        >
          <View className="w-full h-64 mb-4 rounded-xl overflow-hidden border border-[#E5E5EC]">
            <NaverMapWebView
              latitude={latitude}
              longitude={longtitude}
              name={viewName}
            />
          </View>
    
          <View className="flex-row justify-between items-center">
            <TextIconBox
              preset='blue'
              boxClass="bg-white"
              text={location}
            />
            <TextIconButton 
              isOn
              onPress={() => setVisible(false)}
              baseBoxClass="px-3 py-2 rounded-full bg-[#2563EB]"
              text="닫기"
              baseTextClass="text-white font-bold mx-2"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}