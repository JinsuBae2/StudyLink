# 📚 StudyLink

**StudyLink**는 사용자의 관심사와 학습 스타일을 분석하여 최적의 스터디 그룹을 매칭해주고, 효율적인 스터디 관리를 돕는 **알고리즘 기반 스터디 매칭 플랫폼**입니다.

단순한 모임 결성을 넘어, 개인의 성장을 돕는 학습 커뮤니티를 지향합니다.

---

## ✨ 주요 기능 (Key Features)

### 1. 사용자 맞춤형 스터디 추천 (Algorithm)
* **콘텐츠 기반 필터링 (Content-based Filtering):** 사용자의 학습 목표(`goal`)와 스터디 그룹의 목표를 분석하여 **TF-IDF 및 코사인 유사도 알고리즘**을 통해 가장 연관성 높은 스터디를 추천합니다.
* **다차원 매칭 시스템:** 관심 태그, 선호하는 학습 스타일(온라인/오프라인), 지역, 경력 수준 등을 종합적으로 고려하여 정교한 매칭 점수를 계산합니다.

### 2. 스터디 그룹 관리 (CRUD)
* **스터디 생성:** 주제, 목표, 모집 인원, 마감일, 지역, 태그 등을 설정하여 스터디를 개설할 수 있습니다.
* **스터디 관리:** 그룹장은 스터디 정보를 수정하거나 삭제할 수 있으며, 모집 상태를 관리할 수 있습니다.

### 3. 스터디 참여 및 멤버 관리
* **참여 신청:** 사용자는 원하는 스터디에 가입 신청 메시지와 함께 지원할 수 있습니다.
* **신청 관리:** 그룹장은 지원자 목록을 확인하고, 신청을 **수락**하거나 **거절**할 수 있습니다.
* **내 활동 관리:** 마이페이지에서 내가 생성한 스터디, 참여 중인 스터디, 신청한 스터디의 상태(대기/수락/거절)를 한눈에 확인할 수 있습니다.

### 4. 강력한 검색 및 필터링
* **키워드 검색:** 스터디 제목, 주제, 설명, 태그 등을 통합적으로 검색할 수 있습니다.
* **조건별 정렬:** 최신순, 인기순(신청자 수), 마감 임박순 등 다양한 기준으로 스터디를 정렬하여 볼 수 있습니다.

### 5. 사용자 프로필 및 태그 시스템
* **프로필 관리:** 닉네임, 직무, 경력, 학습 목표 등을 설정하고 수정할 수 있습니다.
* **관심 태그:** 자신만의 기술 스택이나 관심 분야를 태그로 등록하여 추천 시스템에 반영합니다.

---

## 🛠 기술 스택 (Tech Stack)

### **Backend**
* **Language:** Java 17
* **Framework:** Spring Boot 3.2.5
* **Database:** MySQL 8.0
* **ORM:** Spring Data JPA (Hibernate)
* **Security:** Spring Security, JWT (JSON Web Token)
* **Build Tool:** Maven

### **Frontend**
* **Language:** TypeScript
* **Framework:** React (Vite)
* **State Management:** React Context API (`AuthContext`, `SearchContext`)
* **Routing:** React Router DOM v6
* **HTTP Client:** Axios (Interceptors for JWT handling)
* **Styling:** CSS Modules (Custom Design System with CSS Variables)

---

## 🚀 설치 및 실행 방법 (Getting Started)

### 1. Backend (Spring Boot)

1.  **데이터베이스 설정:**
    * MySQL을 설치하고 `StudyLink`라는 이름의 데이터베이스를 생성합니다.
    * `src/main/resources/application.properties` 파일에서 DB 설정을 본인 환경에 맞게 수정합니다.
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/StudyLink?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8&allowPublicKeyRetrieval=true
    spring.datasource.username=YOUR_DB_USERNAME
    spring.datasource.password=YOUR_DB_PASSWORD
    ```

2.  **JWT 비밀키 설정:**
    * `application.properties`에 JWT 서명을 위한 비밀키를 설정합니다.
    ```properties
    jwt.secret=YOUR_SECURE_RANDOM_SECRET_KEY
    ```

3.  **빌드 및 실행:**
    ```bash
    ./mvnw clean install
    ./mvnw spring-boot:run
    ```

### 2. Frontend (React)

1.  **의존성 설치:**
    ```bash
    cd studylink-react-frontend
    npm install
    ```

2.  **환경 변수 설정:**
    * 프로젝트 루트에 `.env` 파일을 생성하고 백엔드 API 주소를 설정합니다. (기본값 사용 시 생략 가능)
    ```env
    VITE_API_BASE_URL=http://localhost:8080
    ```

3.  **개발 서버 실행:**
    ```bash
    npm run dev
    ```
    * 브라우저에서 `http://localhost:5173`으로 접속합니다.

---

## 📖 상세 문서 (Documentation)
더 자세한 내용은 아래 문서를 참고하세요.

* **[API Documentation](API_DOCUMENTATION.md)**: 백엔드 API 명세서
* **[Database Schema](DATABASE_SCHEMA.md)**: 데이터베이스 ERD 및 테이블 설명
* **[Frontend Guide](FRONTEND_GUIDE.md)**: 프론트엔드 구조 및 컴포넌트 가이드

---

## 📂 프로젝트 구조 (Project Structure)

### Backend
```
src/main/java/com/example/backend
├── config # Security, CORS 설정 
├── controller # REST API 컨트롤러 
├── dto # 데이터 전송 객체 (Request/Response) 
├── entity # JPA 엔티티 (User, StudyGroup, Tag 등) 
├── jwt # JWT 토큰 생성 및 검증 로직 
├── repository # JPA 리포지토리 
└── service # 비즈니스 로직 (UserService, StudyGroupService, RecommendationService 등)


### Frontend
src 
├── api # Axios 인스턴스 및 API 호출 함수 (apiService.ts) 
├── components # 재사용 가능한 컴포넌트 (Header, Footer, Layout, PrivateRoute) 
├── contexts # 전역 상태 관리 (AuthContext, SearchContext) 
├── pages # 주요 페이지 컴포넌트 (HomePage, MyPage, StudyDetailPage 등) 
└── App.tsx # 라우팅 설정
```

---
