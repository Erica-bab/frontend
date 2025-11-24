export default {
  expo: {
    name: "front",
    slug: "front",
    version: "1.0.0",
    extra: {
      eas: {
        projectId: "3536b605-1fa3-4649-aae3-4ccc299ae2f4"
      }
    },
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/app/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.efoo.front",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "주변 맛집을 위치순으로 정렬하기 위해 위치 정보가 필요합니다."
      },
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/app/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      },
      package: "com.anonymous.front"
    },
    web: {
      favicon: "./assets/app/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-web-browser",
      [
        "react-native-maps",
        {
          googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      ],
      [
        "expo-location",
        {
          locationWhenInUsePermission: "주변 맛집을 위치순으로 정렬하기 위해 위치 정보가 필요합니다."
        }
      ]
    ]
  }
};
