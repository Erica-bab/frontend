export default {
  expo: {
    name: "에푸",
    slug: "efoo",
    version: "1.0.0",
    scheme: ["efoo", "com.googleusercontent.apps.1041029378289-puugfhcoucnpvmi8bk8k2a5uapiaak38"],
    extra: {
      "eas": {
        "projectId": "bbf9506d-af02-4c2e-98df-81034e95805b"
      }
    },
    orientation: "portrait",
    icon: "./assets/app/adaptive-icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/app/adaptive-icon.png",
      resizeMode: "contain",
      backgroundColor: "#3072F0"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.efoo.app",
      usesAppleSignIn: true,
      displayName: "에푸",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "주변 맛집을 위치순으로 정렬하기 위해 위치 정보가 필요합니다.",
        CFBundleDisplayName: "에푸"
      },
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/app/adaptive-icon.png",
        backgroundColor: "#3072F0"
      },
      label: "에푸",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      },
      package: "com.efoo.app"
    },
    web: {
      favicon: "./assets/app/adaptive-icon.png"
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
      "expo-apple-authentication",
      [
        "expo-location",
        {
          locationWhenInUsePermission: "주변 맛집을 위치순으로 정렬하기 위해 위치 정보가 필요합니다."
        }
      ]
    ]
  }
};
