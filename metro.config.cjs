const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Expo 기본 설정 불러오기
const config = getDefaultConfig(__dirname);

// SVG transformer 추가
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

// SVG 확장자 우선 처리
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
};

// NativeWind(v4)랑 global.css 연결
module.exports = withNativeWind(config, {
  input: "./global.css",
});