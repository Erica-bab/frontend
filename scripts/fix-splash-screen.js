#!/usr/bin/env node

/**
 * iOS 스플래시 스크린 수정 스크립트
 * 
 * prebuild 후 실행하여:
 * 1. SplashScreen.storyboard를 전체 화면으로 수정
 * 2. 스플래시 이미지 리소스를 올바른 크기로 교체
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');
const SPLASH_IMAGE_SOURCE = path.join(PROJECT_ROOT, 'assets/app/splash-image.png');
const STORYBOARD_PATH = path.join(PROJECT_ROOT, 'ios/app/SplashScreen.storyboard');
const IMAGESET_PATH = path.join(PROJECT_ROOT, 'ios/app/Images.xcassets/SplashScreenLogo.imageset');

console.log('🚀 iOS 스플래시 스크린 수정 시작...\n');

// 1. SplashScreen.storyboard 수정
function fixStoryboard() {
  if (!fs.existsSync(STORYBOARD_PATH)) {
    console.log('⚠️  SplashScreen.storyboard 파일을 찾을 수 없습니다.');
    return false;
  }

  console.log('📝 SplashScreen.storyboard 수정 중...');
  
  let storyboard = fs.readFileSync(STORYBOARD_PATH, 'utf8');
  
  // 이미지뷰를 전체 화면으로 수정
  storyboard = storyboard.replace(
    /<imageView id="EXPO-SplashScreen" userLabel="SplashScreenLogo" image="SplashScreenLogo" contentMode="scaleAspectFill" clipsSubviews="true" userInteractionEnabled="false" translatesAutoresizingMaskIntoConstraints="false">\s*<rect key="frame" x="[^"]*" y="[^"]*" width="[^"]*" height="[^"]*"\/>/,
    '<imageView id="EXPO-SplashScreen" userLabel="SplashScreen" image="SplashScreenLogo" contentMode="scaleAspectFill" clipsSubviews="true" userInteractionEnabled="false" translatesAutoresizingMaskIntoConstraints="false">\n                                <rect key="frame" x="0.0" y="0.0" width="393" height="852"/>'
  );
  
  // 제약 조건을 전체 화면으로 수정
  storyboard = storyboard.replace(
    /<constraints>\s*<constraint firstItem="EXPO-SplashScreen" firstAttribute="centerX"[^>]*\/>\s*<constraint firstItem="EXPO-SplashScreen" firstAttribute="centerY"[^>]*\/>\s*<\/constraints>/,
    `<constraints>
                            <constraint firstItem="EXPO-SplashScreen" firstAttribute="leading" secondItem="EXPO-ContainerView" secondAttribute="leading" id="leading-constraint"/>
                            <constraint firstItem="EXPO-SplashScreen" firstAttribute="trailing" secondItem="EXPO-ContainerView" secondAttribute="trailing" id="trailing-constraint"/>
                            <constraint firstItem="EXPO-SplashScreen" firstAttribute="top" secondItem="EXPO-ContainerView" secondAttribute="top" id="top-constraint"/>
                            <constraint firstItem="EXPO-SplashScreen" firstAttribute="bottom" secondItem="EXPO-ContainerView" secondAttribute="bottom" id="bottom-constraint"/>
                        </constraints>`
  );
  
  // 이미지 크기 정보 수정
  storyboard = storyboard.replace(
    /<image name="SplashScreenLogo" width="\d+" height="\d+"\/>/,
    '<image name="SplashScreenLogo" width="393" height="852"/>'
  );
  
  fs.writeFileSync(STORYBOARD_PATH, storyboard, 'utf8');
  console.log('✅ SplashScreen.storyboard 수정 완료\n');
  return true;
}

// 2. 이미지 리소스 교체
function replaceImages() {
  if (!fs.existsSync(SPLASH_IMAGE_SOURCE)) {
    console.log('⚠️  원본 스플래시 이미지를 찾을 수 없습니다:', SPLASH_IMAGE_SOURCE);
    return false;
  }

  if (!fs.existsSync(IMAGESET_PATH)) {
    console.log('⚠️  SplashScreenLogo.imageset 폴더를 찾을 수 없습니다.');
    return false;
  }

  console.log('🖼️  스플래시 이미지 리소스 교체 중...');

  const image1x = path.join(IMAGESET_PATH, 'image.png');
  const image2x = path.join(IMAGESET_PATH, 'image@2x.png');
  const image3x = path.join(IMAGESET_PATH, 'image@3x.png');

  try {
    // sips 명령어로 이미지 리사이즈 (macOS)
    // 1x: 393x852
    execSync(`sips -z 852 393 "${SPLASH_IMAGE_SOURCE}" --out "${image1x}"`, { stdio: 'inherit' });
    console.log('✅ 1x 이미지 생성 완료 (393x852)');

    // 2x: 786x1704
    execSync(`sips -z 1704 786 "${SPLASH_IMAGE_SOURCE}" --out "${image2x}"`, { stdio: 'inherit' });
    console.log('✅ 2x 이미지 생성 완료 (786x1704)');

    // 3x: 원본 사용 (1284x2778)
    execSync(`cp "${SPLASH_IMAGE_SOURCE}" "${image3x}"`, { stdio: 'inherit' });
    console.log('✅ 3x 이미지 복사 완료 (1284x2778)');

    console.log('\n✅ 모든 이미지 리소스 교체 완료\n');
    return true;
  } catch (error) {
    console.error('❌ 이미지 리소스 교체 실패:', error.message);
    console.log('\n💡 수동으로 이미지를 교체해주세요:');
    console.log(`   1x: ${image1x} (393x852)`);
    console.log(`   2x: ${image2x} (786x1704)`);
    console.log(`   3x: ${image3x} (1284x2778 - 원본 사용)`);
    return false;
  }
}

// 메인 실행
function main() {
  const storyboardFixed = fixStoryboard();
  const imagesReplaced = replaceImages();

  if (storyboardFixed && imagesReplaced) {
    console.log('🎉 모든 작업이 완료되었습니다!');
    console.log('📱 이제 iOS 앱을 빌드하면 전체 화면 스플래시 이미지가 선명하게 표시됩니다.\n');
  } else {
    console.log('⚠️  일부 작업이 실패했습니다. 위의 메시지를 확인해주세요.\n');
    process.exit(1);
  }
}

main();

