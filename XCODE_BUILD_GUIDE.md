# Xcode에서 프로덕션 빌드 가이드

## 1. 환경 변수 설정

### 방법 1: .env 파일 생성 (권장)

프로젝트 루트에 `.env` 파일을 생성하고 환경 변수를 추가합니다:

```bash
cd frontend
cat > .env << 'EOF'
EXPO_PUBLIC_API_BASE_URL=https://xn--oy2b88bd4n32i.com/api/v1
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=1041029378289-m6skrn7fc5d2gp3b7vi06rg82om46s9d.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=1041029378289-vbb01mjh4fd9403g5ifde1nrnv51eng9.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=1041029378289-puugfhcoucnpvmi8bk8k2a5uapiaak38.apps.googleusercontent.com
EOF
```

**중요**: `.env` 파일은 `.gitignore`에 추가되어 있어야 합니다 (보안상).

### 방법 2: Xcode Scheme에서 환경 변수 설정

1. Xcode에서 프로젝트 열기
2. 상단 메뉴: **Product** → **Scheme** → **Edit Scheme...**
3. 왼쪽 사이드바에서 **Run** 선택
4. **Arguments** 탭 선택
5. **Environment Variables** 섹션에서 `+` 버튼 클릭
6. 다음 환경 변수 추가:
   - `EXPO_PUBLIC_API_BASE_URL` = `https://xn--oy2b88bd4n32i.com/api/v1`
   - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` = `1041029378289-m6skrn7fc5d2gp3b7vi06rg82om46s9d.apps.googleusercontent.com`
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` = `1041029378289-vbb01mjh4fd9403g5ifde1nrnv51eng9.apps.googleusercontent.com`
   - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` = `1041029378289-puugfhcoucnpvmi8bk8k2a5uapiaak38.apps.googleusercontent.com`
7. **Archive** 스킴에도 동일하게 적용 (왼쪽 사이드바에서 **Archive** 선택 후 동일한 설정)

## 2. 네이티브 프로젝트 생성/업데이트

```bash
cd frontend
npx expo prebuild --platform ios --clean
```

이 명령어는:
- `ios/` 폴더의 네이티브 프로젝트를 생성/업데이트합니다
- 환경 변수를 읽어서 `app.config.js`에 적용합니다
- `.env` 파일이 있으면 자동으로 읽습니다

## 3. Xcode에서 프로젝트 열기

```bash
cd frontend/ios
open front.xcworkspace
```

**중요**: `.xcodeproj`가 아닌 `.xcworkspace`를 열어야 합니다 (CocoaPods 사용).

## 4. 빌드 설정 확인

1. Xcode에서 프로젝트 네비게이터에서 **front** 프로젝트 선택
2. **TARGETS** → **front** 선택
3. **General** 탭에서 확인:
   - **Display Name**: 에푸
   - **Bundle Identifier**: com.efoo.app
   - **Version**: 1.0.0
   - **Build**: 3
4. **Signing & Capabilities** 탭에서 확인:
   - **Team**: Apple Developer 계정 선택
   - **Signing Certificate**: 자동으로 설정됨

## 5. Archive 빌드

1. 상단 메뉴: **Product** → **Scheme** → **front** 선택
2. 상단 메뉴: **Product** → **Destination** → **Any iOS Device (arm64)** 선택
3. 상단 메뉴: **Product** → **Archive**
4. 빌드가 완료되면 **Organizer** 창이 자동으로 열립니다

## 6. App Store Connect에 업로드

1. **Organizer** 창에서 방금 생성한 Archive 선택
2. **Distribute App** 버튼 클릭
3. **App Store Connect** 선택 → **Next**
4. **Upload** 선택 → **Next**
5. 배포 옵션 확인 → **Next**
6. 자동 서명 확인 → **Next**
7. **Upload** 버튼 클릭
8. 업로드 완료 후 App Store Connect에서 확인

## 7. 환경 변수 확인 방법

빌드 전에 환경 변수가 제대로 로드되는지 확인:

```bash
cd frontend
npx expo config --type introspect | grep EXPO_PUBLIC
```

또는 Xcode에서 빌드 로그를 확인하여 환경 변수가 포함되어 있는지 확인할 수 있습니다.

## 문제 해결

### 환경 변수가 적용되지 않는 경우

1. `.env` 파일이 `frontend/` 폴더에 있는지 확인
2. `npx expo prebuild --clean` 실행 후 다시 시도
3. Xcode Scheme에서 환경 변수가 설정되어 있는지 확인
4. Xcode를 완전히 종료하고 다시 열기

### 빌드 에러 발생 시

1. **Product** → **Clean Build Folder** (Shift + Cmd + K)
2. `cd frontend/ios && pod install` 실행
3. `npx expo prebuild --clean` 실행
4. Xcode에서 다시 빌드

## 참고사항

- 환경 변수는 빌드 타임에 번들에 포함됩니다
- `EXPO_PUBLIC_` 접두사가 붙은 변수만 클라이언트에서 접근 가능합니다
- `.env` 파일은 절대 Git에 커밋하지 마세요 (보안상 위험)

