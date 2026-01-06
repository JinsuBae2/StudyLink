# 🗄️ StudyLink 데이터베이스 스키마 (Database Schema)

## ER 다이어그램 (ER Diagram)

```mermaid
erDiagram
    User ||--o{ StudyGroup : "생성 (creates)"
    User ||--o{ StudyMember : "참여 (joins)"
    User ||--o{ Application : "지원 (applies)"
    User ||--o{ Interest : "찜 (likes)"
    User ||--o{ Comment : "작성 (writes)"
    User ||--o{ UserTag : "보유 (has)"

    StudyGroup ||--o{ StudyMember : "포함 (has)"
    StudyGroup ||--o{ Application : "수신 (receives)"
    StudyGroup ||--o{ Interest : "찜 받음 (liked_by)"
    StudyGroup ||--o{ Comment : "포함 (contains)"
    StudyGroup ||--o{ StudyGroupTag : "보유 (has)"

    Tag ||--o{ UserTag : "태그됨 (tagged_in)"
    Tag ||--o{ StudyGroupTag : "태그됨 (tagged_in)"

    Comment ||--o{ Comment : "답글 (replies_to)"

    User {
        Long id PK
        String email UK "이메일 (로그인 ID)"
        String password "비밀번호"
        String nickname UK "닉네임"
        LocalDate birthDate "생년월일"
        String career "경력 (NEWBIE, JUNIOR, SENIOR)"
        String job "직무"
        String goal "학습 목표"
        String studyStyle "학습 스타일"
        String region "지역"
        Boolean isAvailableNow "현재 참여 가능 여부"
        LocalDateTime createdAt "가입일"
        LocalDateTime updatedAt "수정일"
    }

    StudyGroup {
        Long id PK
        String title "스터디 제목"
        String topic "주제"
        String description "설명"
        String goal "목표"
        int memberCount "모집 인원"
        LocalDate recruitmentDeadline "모집 마감일"
        String region "지역"
        String studyStyle "진행 방식"
        String requiredCareer "필요 경력"
        LocalDateTime createdAt "생성일"
        LocalDateTime updatedAt "수정일"
    }

    StudyMember {
        Long id PK
        String role "역할 (LEADER, MEMBER)"
        LocalDateTime joinedAt "가입일"
    }

    Application {
        Long id PK
        String message "지원 메시지"
        String status "상태 (PENDING, ACCEPTED, REJECTED)"
        LocalDateTime createdAt "지원일"
        LocalDateTime updatedAt "처리일"
    }

    Comment {
        Long id PK
        String content "내용"
        LocalDateTime createdAt "작성일"
    }

    Interest {
        Long id PK
        LocalDateTime createdAt "등록일"
    }

    Tag {
        Long id PK
        String name UK "태그명"
    }

    UserTag {
        Long userId PK, FK
        Long tagId PK, FK
    }

    StudyGroupTag {
        Long studyGroupId PK, FK
        Long tagId PK, FK
    }
```

## 테이블 설명 (Table Descriptions)

### 1. User (사용자)
사용자 계정 정보 및 프로필을 저장합니다.
- **id**: 기본 키 (PK)
- **email**: 고유 이메일 주소 (로그인 ID)
- **nickname**: 고유 닉네임
- **career**: 경력 수준 (NEWBIE, JUNIOR, SENIOR)
- **studyStyle**: 선호 학습 방식 (ONLINE, OFFLINE, HYBRID)

### 2. StudyGroup (스터디 그룹)
사용자가 생성한 스터디 그룹 정보를 저장합니다.
- **id**: 기본 키 (PK)
- **creator_id**: 외래 키 (User) - 스터디장(Leader)
- **recruitmentDeadline**: 모집 마감 날짜
- **requiredCareer**: 참여에 필요한 최소 경력 수준

### 3. StudyMember (스터디 멤버)
스터디 그룹에 참여 중인 사용자를 매핑하는 테이블입니다.
- **user_id**: 외래 키 (User)
- **study_group_id**: 외래 키 (StudyGroup)
- **role**: 역할 (LEADER: 스터디장, MEMBER: 일반 멤버)

### 4. Application (지원서)
사용자가 스터디 그룹에 참여하기 위해 보낸 지원서를 저장합니다.
- **applicant_id**: 외래 키 (User) - 지원자
- **study_group_id**: 외래 키 (StudyGroup)
- **status**: 상태 (PENDING: 대기, ACCEPTED: 수락, REJECTED: 거절)

### 5. Interest (관심/찜)
사용자가 관심 있는 스터디를 찜한 정보를 저장합니다.
- **user_id**: 외래 키 (User)
- **study_group_id**: 외래 키 (StudyGroup)
- **Unique Constraint**: (user_id, study_group_id) 쌍은 유일해야 합니다. (중복 찜 불가)

### 6. Comment (댓글)
스터디 그룹 페이지에 작성된 댓글 및 대댓글을 저장합니다.
- **study_group_id**: 외래 키 (StudyGroup)
- **author_id**: 외래 키 (User) - 작성자
- **parent_id**: 외래 키 (Comment) - 대댓글일 경우 부모 댓글 ID

### 7. Tag (태그)
고유한 태그 이름을 저장합니다. (예: #Java, #Spring)
- **name**: 태그명 (중복 불가)

### 8. UserTag & StudyGroupTag
태그와 사용자, 태그와 스터디 그룹을 연결하는 다대다(N:M) 매핑 테이블입니다.
