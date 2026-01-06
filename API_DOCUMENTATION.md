# 📡 StudyLink API 문서 (API Documentation)

Base URL: `http://localhost:8080`

## 🔐 인증 (Authentication)

| Method | Endpoint | 설명 | 인증 필요 |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | 신규 회원 가입 | No |
| `POST` | `/api/auth/login` | 로그인 및 JWT 토큰 발급 | No |

### 요청 예시 (Request Examples)

**회원가입 (Signup)**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "study_master",
  "career": "JUNIOR",
  "birthDate": "1995-01-01",
  "job": "Backend Developer",
  "goal": "Master Spring Boot",
  "studyStyle": "ONLINE",
  "region": "Seoul",
  "tags": ["Java", "Spring"]
}
```

**로그인 (Login)**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## 👤 사용자 (Users/Members)

| Method | Endpoint | 설명 | 인증 필요 |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/members/me` | 내 프로필 정보 조회 | Yes |
| `PUT` | `/api/members/me` | 내 프로필 수정 | Yes |
| `GET` | `/api/members/me/applications` | 내 스터디 신청 내역 조회 | Yes |
| `GET` | `/api/members/me/study-groups` | 내가 참여 중인 스터디 그룹 조회 | Yes |
| `GET` | `/api/members/me/created-study-groups` | 내가 생성한 스터디 그룹 조회 | Yes |
| `GET` | `/api/members/me/interests` | 내가 찜한(관심) 스터디 그룹 조회 | Yes |

---

## 📚 스터디 그룹 (Study Groups)

| Method | Endpoint | 설명 | 인증 필요 |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/study-groups` | 스터디 그룹 생성 | Yes |
| `GET` | `/api/study-groups` | 전체 스터디 그룹 조회 (필터링 포함) | No |
| `GET` | `/api/study-groups/{id}` | 스터디 그룹 상세 조회 | No |
| `PUT` | `/api/study-groups/{id}` | 스터디 그룹 수정 | Yes (Leader) |
| `DELETE` | `/api/study-groups/{id}` | 스터디 그룹 삭제 | Yes (Leader) |
| `GET` | `/api/study-groups/recommendations` | 추천 스터디 목록 조회 (v1) | Yes |
| `GET` | `/api/study-groups/recommendations/v2` | 추천 스터디 목록 조회 (v2) | Yes |
| `POST` | `/api/study-groups/{id}/interest` | 관심 스터디 등록/해제 (토글) | Yes |

### 쿼리 파라미터 (Query Parameters)
- `region`: 지역 필터 (예: "Seoul")
- `sort`: 정렬 기준 (`latest`: 최신순, `popular`: 인기순)
- `search`: 검색어

### 요청 예시 (Request Examples)

**스터디 그룹 생성**
```json
{
  "title": "Spring Boot 스터디",
  "topic": "Backend",
  "description": "스프링 부트 같이 공부해요!",
  "goal": "프로젝트 완성",
  "memberCount": 5,
  "recruitmentDeadline": "2024-12-31",
  "studyStyle": "ONLINE",
  "region": "Seoul",
  "tags": ["Spring", "Java"],
  "requiredCareer": "JUNIOR"
}
```

---

## 📝 지원서 (Applications)

| Method | Endpoint | 설명 | 인증 필요 |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/study-groups/{groupId}/applications` | 스터디 그룹 참여 신청 | Yes |
| `GET` | `/api/study-groups/{groupId}/applications` | 스터디 그룹 지원자 목록 조회 | Yes (Leader) |
| `POST` | `/api/study-groups/{groupId}/applications/{appId}/process` | 지원 수락 또는 거절 처리 | Yes (Leader) |

### 요청 예시 (Request Examples)

**참여 신청**
```json
{
  "message": "열심히 하겠습니다!"
}
```

**지원 처리**
```json
{
  "status": "ACCEPTED" // 또는 "REJECTED"
}
```

---

## 💬 댓글 (Comments)

| Method | Endpoint | 설명 | 인증 필요 |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/study-groups/{groupId}/comments` | 댓글 작성 | Yes |
| `GET` | `/api/study-groups/{groupId}/comments` | 댓글 목록 조회 | No |
| `DELETE` | `/api/comments/{commentId}` | 댓글 삭제 | Yes (Author) |

### 요청 예시 (Request Examples)

**댓글 작성**
```json
{
  "content": "아직 모집 중인가요?",
  "parentId": null // 대댓글일 경우 부모 댓글 ID
}
```
