import { WebView } from 'react-native-webview';
import { View, ActivityIndicator } from 'react-native';

interface NaverMapWebViewProps {
  latitude: number;
  longitude: number;
  name?: string;
}

export default function NaverMapWebView({ latitude, longitude, name }: NaverMapWebViewProps) {
  const mapUrl = `https://에리카밥.com/map?lat=${latitude}&lng=${longitude}&name=${encodeURIComponent(name || '')}`;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: mapUrl }}
        style={{ flex: 1 }}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        )}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        bounces={false}
        scrollEnabled={false}
      />
    </View>
  );
}
