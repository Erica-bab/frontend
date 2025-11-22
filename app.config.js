export default {
  expo: {
    name: "front",
    slug: "front",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/Group 2.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/app/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
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
      ]
    ]
  }
};
