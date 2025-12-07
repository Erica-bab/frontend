export default {
  expo: {
    name: "에푸",
    slug: "efoo",
    version: "1.2.2",
    scheme: ["efoo", "com.googleusercontent.apps.1041029378289-puugfhcoucnpvmi8bk8k2a5uapiaak38"],
    orientation: "portrait",
    icon: "./assets/app/adaptive-icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/app/splash-image.png",
      resizeMode: "cover",
      backgroundColor: "#2563EB"
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.efoo.app",
      buildNumber: "1",
      usesAppleSignIn: true,
      displayName: "에푸",
      splash: {
        image: "./assets/app/splash-image.png",
        resizeMode: "cover",
        backgroundColor: "#2563EB"
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "주변 맛집을 위치순으로 정렬하기 위해 위치 정보가 필요합니다.",
        NSPhotoLibraryUsageDescription: "식당 사진을 추가하기 위해 갤러리 접근 권한이 필요합니다.",
        NSCameraUsageDescription: "식당 사진을 촬영하기 위해 카메라 접근 권한이 필요합니다.",
        CFBundleDisplayName: "에푸",
        ITSAppUsesNonExemptEncryption: false
      },
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      }
    },
    android: {
      splash: {
        image: "./assets/app/splash-image.png",
        resizeMode: "cover",
        backgroundColor: "#2563EB"
      },
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
        "expo-splash-screen",
        {
          image: "./assets/app/splash-image.png",
          resizeMode: "cover",
          backgroundColor: "#2563EB"
        }
      ],
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
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "식당 사진을 추가하기 위해 갤러리 접근 권한이 필요합니다.",
          cameraPermission: "식당 사진을 촬영하기 위해 카메라 접근 권한이 필요합니다."
        }
      ]
    ]
  }
};
