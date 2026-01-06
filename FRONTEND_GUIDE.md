# 🎨 StudyLink 프론트엔드 가이드 (Frontend Guide)

## 📂 프로젝트 구조 (Project Structure)

```
src/
├── api/                # Axios 인스턴스 및 API 서비스 함수
│   └── apiService.ts   # 중앙화된 API 호출 로직
├── components/         # 재사용 가능한 UI 컴포넌트
│   ├── Header.tsx      # 전역 네비게이션 헤더
│   ├── Footer.tsx      # 전역 푸터
│   ├── Layout.tsx      # 페이지 레이아웃 래퍼
│   └── PrivateRoute.tsx # 보호된 라우트 (로그인 필요 페이지) 래퍼
├── contexts/           # 전역 상태 관리 (Context API)
│   ├── AuthContext.tsx # 사용자 인증 상태 (로그인 여부, 유저 정보)
│   └── SearchContext.tsx # 검색어 상태
├── pages/              # 페이지 컴포넌트 (라우트)
│   ├── HomePage.tsx    # 메인 랜딩 페이지
│   ├── LoginPage.tsx   # 로그인 페이지
│   ├── SignupPage.tsx  # 회원가입 페이지
│   ├── MyPage.tsx      # 마이페이지 (대시보드)
│   ├── StudyDetailPage.tsx # 스터디 상세 정보 및 댓글
│   ├── CreateStudyPage.tsx # 스터디 생성 페이지
│   └── ...
└── App.tsx             # 메인 앱 컴포넌트 및 라우팅 설정
```

## 🔑 주요 컴포넌트 (Key Components)

### 1. PrivateRoute (`src/components/PrivateRoute.tsx`)
- 보호된 라우트(예: 마이페이지, 스터디 생성)를 감싸는 컴포넌트입니다.
- `AuthContext`를 통해 로그인 여부를 확인합니다.
- 비로그인 상태일 경우 `/login` 페이지로 리다이렉트합니다.

### 2. Header (`src/components/Header.tsx`)
- 로그인 상태에 따라 다른 네비게이션 링크를 표시합니다.
- 검색바를 포함하며, 입력 시 `SearchContext`를 업데이트합니다.
- 게스트에게는 "로그인/회원가입", 사용자에게는 "마이페이지/로그아웃"을 보여줍니다.

### 3. StudyDetailPage (`src/pages/StudyDetailPage.tsx`)
- 스터디 그룹의 상세 정보를 표시합니다.
- "지원하기(Apply)" 기능을 처리합니다.
- 댓글 및 대댓글(답글) 목록을 표시하고 관리합니다.
- 스터디장(Leader)에게는 "수정/삭제" 버튼을 노출합니다.

## 🌐 상태 관리 (State Management - Context API)

### AuthContext (`src/contexts/AuthContext.tsx`)
- `isLoggedIn` 상태와 `user` 프로필 정보를 관리합니다.
- `login()` 및 `logout()` 함수를 제공합니다.
- `localStorage`에 저장된 JWT 토큰을 사용하여 로그인 상태를 유지합니다.

### SearchContext (`src/contexts/SearchContext.tsx`)
- 전역 검색어(`keyword`) 상태를 관리합니다.
- `Header`에서 검색어를 입력하면 업데이트되고, `HomePage`나 `SearchResultPage`에서 이를 이용해 필터링합니다.

## 📡 API 연동 (`src/api/apiService.ts`)

- **Axios** 라이브러리를 사용하여 HTTP 요청을 처리합니다.
- **인터셉터 (Interceptors)**:
    - **Request**: 요청 헤더에 자동으로 `Authorization: Bearer <token>`을 추가합니다.
    - **Response**: `401 Unauthorized` 에러 발생 시 자동으로 로그인 페이지로 이동시킵니다.
- **주요 함수**:
    - `login`, `signup`: 인증 관련 API
    - `getStudyGroups`, `createStudyGroup`: 스터디 그룹 CRUD
    - `applyToStudyGroup`: 스터디 지원 로직
    - `toggleInterest`: 관심 스터디 등록/해제 (찜하기)
