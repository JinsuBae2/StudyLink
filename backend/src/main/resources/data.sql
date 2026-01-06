-- 사용자 (비밀번호: password123 / BCrypt Encoded)
INSERT INTO user (id, email, password, nickname, career, job, goal, study_style, region, created_at, updated_at, is_available_now)
VALUES 
(1, 'test@studylink.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOPauJYTTTHeCnEr6dyL.9GYnJ.W.5b/m', 'StudyMaster', 'SENIOR', '개발자', '팀 리드', 'ONLINE', '서울', NOW(), NOW(), true),
(2, 'backend@test.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOPauJYTTTHeCnEr6dyL.9GYnJ.W.5b/m', 'BackendKing', 'JUNIOR', '백엔드 개발자', 'CTO가 되는 것', 'OFFLINE', '부산', NOW(), NOW(), true),
(3, 'front@test.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOPauJYTTTHeCnEr6dyL.9GYnJ.W.5b/m', 'FrontQueen', 'SENIOR', '프론트엔드 개발자', 'UX 마스터', 'ONLINE', '서울', NOW(), NOW(), false),
(4, 'student@test.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOPauJYTTTHeCnEr6dyL.9GYnJ.W.5b/m', 'CampusLife', 'NEWBIE', '학생', '취업 뽀개기', 'HYBRID', '대구', NOW(), NOW(), true),
(5, 'design@test.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOPauJYTTTHeCnEr6dyL.9GYnJ.W.5b/m', 'PixelArt', 'JUNIOR', '디자이너', '아트 디렉터', 'OFFLINE', '인천', NOW(), NOW(), true)
ON DUPLICATE KEY UPDATE id=id;

-- 스터디 그룹
INSERT INTO study_group (id, title, topic, description, goal, member_count, recruitment_deadline, region, created_at, updated_at, creator_id, study_style, required_career)
VALUES
-- User 1 (StudyMaster)
(1, '스프링 부트 백엔드 마스터', '백엔드', '스프링 부트 심층 탐구 및 실무 적용.', '스프링 마스터하기', 5, '2026-12-31', '서울', NOW(), NOW(), 1, 'ONLINE', 'JUNIOR'),
(2, '리액트 프론트엔드 기초', '프론트엔드', '리액트 기초부터 차근차근 배웁니다.', '나만의 웹사이트 만들기', 4, '2026-11-30', '부산', NOW(), NOW(), 1, 'OFFLINE', 'NEWBIE'),

-- User 2 (BackendKing)
(3, 'Node.js 대규모 아키텍처', '백엔드', '확장 가능한 Node.js 아키텍처 연구.', '대용량 트래픽 처리', 6, '2026-11-15', '서울', NOW(), NOW(), 2, 'ONLINE', 'SENIOR'),
(4, '자바 코딩테스트 대비', '백엔드', '주요 IT 기업 코딩테스트 대비반.', '네카라쿠배 합격', 8, '2024-05-20', '부산', NOW(), NOW(), 2, 'OFFLINE', 'JUNIOR'),
(5, '도커 & 쿠버네티스 완전 정복', 'DevOps', '인프라 구축 및 배포 자동화 스터디.', '실무 배포 환경 구축', 5, '2026-10-10', '온라인', NOW(), NOW(), 2, 'ONLINE', 'JUNIOR'),

-- User 3 (FrontQueen)
(6, 'Vue.js 3 심화 스터디', '프론트엔드', 'Vue 3의 새로운 기능과 컴포지션 API 연구.', '레거시 마이그레이션', 4, '2026-09-01', '서울', NOW(), NOW(), 3, 'OFFLINE', 'SENIOR'),
(7, '모던 CSS & Tailwind', '프론트엔드', '최신 CSS 트렌드와 테일윈드 마스터.', '이쁜 UI 빠르게 만들기', 10, '2026-12-01', '온라인', NOW(), NOW(), 3, 'ONLINE', 'NEWBIE'),
(8, '자바스크립트 ES6+ 핵심', '프론트엔드', '자바스크립트 동작 원리와 ES6+ 문법.', '자바스크립트 마스터', 5, '2023-12-31', '서울', NOW(), NOW(), 3, 'HYBRID', 'NEWBIE'),

-- User 4 (CampusLife)
(9, '토익 900+ 달성반', '어학', '매일 단어 시험 및 모의고사 풀이.', '토익 990점', 4, '2026-08-30', '대구', NOW(), NOW(), 4, 'OFFLINE', 'NEWBIE'),
(10, 'CS 전공 지식 부수기', 'CS', '운영체제, 네트워크 등 전공 필수 과목 스터디.', 'A+ 받기', 6, '2026-07-20', '대구', NOW(), NOW(), 4, 'HYBRID', 'NEWBIE'),
(11, '파이썬 자동화 첫걸음', '언어', '파이썬으로 업무 자동화 스크립트 만들기.', '칼퇴근 보장', 10, '2026-12-31', '온라인', NOW(), NOW(), 4, 'ONLINE', 'NEWBIE'),

-- User 5 (PixelArt)
(12, 'UX/UI 취업 포트폴리오', '디자인', '피그마를 활용한 고퀄리티 포트폴리오 제작.', '디자이너 취업', 4, '2026-09-15', '인천', NOW(), NOW(), 5, 'OFFLINE', 'JUNIOR'),
(13, '피그마 프로 꿀팁 공유', '디자인', '실무에서 쓰는 피그마 고급 기능 연구.', '작업 속도 2배 향상', 5, '2026-10-01', '온라인', NOW(), NOW(), 5, 'ONLINE', 'SENIOR'),

-- 기타 다양한 스터디
(14, 'Go 언어 마이크로서비스', '백엔드', 'Go 언어로 MSA 구축하기.', '고성능 서버 개발', 3, '2026-11-05', '서울', NOW(), NOW(), 2, 'OFFLINE', 'SENIOR'),
(15, '아이엘츠(IELTS) 스피킹', '어학', '아이엘츠 스피킹 밴드 7.0 목표.', '해외 유학 가기', 2, '2026-08-01', '부산', NOW(), NOW(), 4, 'OFFLINE', 'NEWBIE'),
(16, 'AWS 솔루션 아키텍트', 'DevOps', 'SAA 자격증 취득 목표 스터디.', '클라우드 전문가', 8, '2026-12-10', '온라인', NOW(), NOW(), 1, 'ONLINE', 'JUNIOR'),
(17, '플러터(Flutter) 앱 개발', '모바일', '안드로이드/iOS 동시 개발 플러터 기초.', '나만의 앱 출시', 5, '2026-10-30', '서울', NOW(), NOW(), 3, 'HYBRID', 'JUNIOR'),
(18, '파이썬 데이터 분석', '데이터', '판다스, 넘파이로 데이터 분석 기초 다지기.', '데이터 문해력 기르기', 6, '2026-09-20', '대전', NOW(), NOW(), 4, 'ONLINE', 'NEWBIE'),
(19, '러스트(Rust) 시스템 프로그래밍', '백엔드', 'The Rust Programming Language 책 떼기.', '메모리 안전성 정복', 4, '2026-11-20', '온라인', NOW(), NOW(), 2, 'ONLINE', 'SENIOR'),
(20, '서양 미술사 스터디', '디자인', '재미있는 미술의 역사 공부.', '교양인 되기', 10, '2024-01-01', '인천', NOW(), NOW(), 5, 'OFFLINE', 'NEWBIE')
ON DUPLICATE KEY UPDATE id=id;
