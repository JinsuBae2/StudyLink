package com.example.backend.service;

import com.example.backend.dto.studygroup.RecommendedStudyGroupDto;
import com.example.backend.entity.*;
import com.example.backend.repository.StudyGroupRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final UserRepository userRepository;
    private final StudyGroupRepository studyGroupRepository;
    // 🌟 TagService를 주입받아 태그 이름을 정규화할 때 사용
    private final TagService tagService;

    // 🌟 추천 가중치 설정 (조정 가능)
    private static final double GOAL_WEIGHT = 0.4;        // 목표 텍스트 유사도
    private static final double TAG_WEIGHT = 0.3;         // 태그 일치도
    private static final double CAREER_WEIGHT = 0.15;     // 경력 적합도
    private static final double STUDY_STYLE_WEIGHT = 0.1; // 학습 스타일 일치도
    private static final double REGION_WEIGHT = 0.05;     // 지역 일치도 (오프라인/하이브리드만 해당)

    private static final Set<String> STOP_WORDS = Set.of(
            "은", "는", "이", "가", "을", "를", "으로", "로", "와", "과", "도", "만", "좀", "잘", "더",
            "가장", "아주", "정말", "바로", "그리고", "그래서", "그러나", "하지만", "또는", "및", "즉", "등",
            "것", "수", "있습니다", "합니다", "이다", "위해", "대한", "통해", "개발", "스터디", "목표" // "합니다"가 중복되지 않도록 확인
    );

    // 🌟 [수정] recommendGroupsByContent -> calculateAndSortRecommendations
    @Transactional(readOnly = true)
    public List<RecommendedStudyGroupDto> calculateAndSortRecommendations(
            User currentUser,
            List<StudyGroup> allStudyGroups,
            Set<Long> excludedGroupIds) {

        // 1. TF-IDF를 위한 모든 목표 텍스트 수집 (기존 로직 유지)
        List<String> allGoals = new ArrayList<>();
        allStudyGroups.forEach(sg -> allGoals.add(sg.getGoal()));
        allGoals.add(currentUser.getGoal());
        Map<String, Double> idfVocabulary = calculateIdf(allGoals);
        Map<String, Double> userTfIdfVector = createTfIdfVector(currentUser.getGoal(), idfVocabulary);

        // 2. 각 스터디 그룹과의 다차원 매칭 점수 계산
        return allStudyGroups.stream()
                .filter(studyGroup -> !excludedGroupIds.contains(studyGroup.getId())) // 이미 가입/생성한 스터디 제외
                .map(studyGroup -> {
                    double finalScore = calculateMultiDimensionalMatchScore(
                            currentUser, studyGroup, idfVocabulary, userTfIdfVector);
                    return new RecommendedStudyGroupDto(studyGroup, finalScore);
                })
                .filter(dto -> dto.getMatchScore() > 0) // 점수가 0 이상인 것만
                .sorted(Comparator.comparing(RecommendedStudyGroupDto::getMatchScore).reversed())
                .collect(Collectors.toList());
    }

    // 🌟 [새로 추가] 다차원 매칭 점수 계산 메서드
    private double calculateMultiDimensionalMatchScore(
            User user, StudyGroup studyGroup,
            Map<String, Double> idfVocabulary,
            Map<String, Double> userTfIdfVector) {

        double goalSimilarityScore = 0.0;
        if (userTfIdfVector != null && !userTfIdfVector.isEmpty()) {
            Map<String, Double> groupTfIdfVector = createTfIdfVector(studyGroup.getGoal(), idfVocabulary);
            goalSimilarityScore = calculateCosineSimilarity(userTfIdfVector, groupTfIdfVector);
        }

        double tagMatchScore = calculateTagMatchScore(user, studyGroup);
        double careerMatchScore = calculateCareerMatchScore(user, studyGroup);
        double studyStyleMatchScore = calculateStudyStyleMatchScore(user, studyGroup);
        double regionMatchScore = calculateRegionMatchScore(user, studyGroup);

        // 모든 점수를 가중치 합산하여 최종 점수 계산 (각 점수는 0~1 사이로 정규화되어 있다고 가정)
        // 예를 들어, 태그 일치도는 0~100점 사이로 나오므로, 가중치에 곱하기 전에 정규화 필요
        double finalScore =
                (goalSimilarityScore * GOAL_WEIGHT) +
                        (tagMatchScore * TAG_WEIGHT) +
                        (careerMatchScore * CAREER_WEIGHT) +
                        (studyStyleMatchScore * STUDY_STYLE_WEIGHT) +
                        (regionMatchScore * REGION_WEIGHT);

        // 최종 점수를 100점 만점으로 스케일링 (필요하다면)
        // 여기서는 각 점수 자체가 이미 0~1 또는 0~100 범위로 나와서 총점이 0~100 사이가 되도록 조정하는 것이 목표
        return finalScore * 100; // 최대 100점으로 가정하고 곱셈
    }

    // 🌟 [새로 추가] 태그 매칭 점수 계산 (0~100점)
    private double calculateTagMatchScore(User user, StudyGroup studyGroup) {
        Set<String> userTags = user.getUserTags().stream()
                .map(ut -> tagService.normalizeTagName(ut.getTag().getName())) // 태그 이름 정규화
                .collect(Collectors.toSet());
        Set<String> groupTags = studyGroup.getStudyGroupTags().stream()
                .map(sgt -> tagService.normalizeTagName(sgt.getTag().getName())) // 태그 이름 정규화
                .collect(Collectors.toSet());

        if (userTags.isEmpty() || groupTags.isEmpty()) {
            return 0.0;
        }

        Set<String> commonTags = new HashSet<>(userTags);
        commonTags.retainAll(groupTags);

        // 공통 태그 수 / 사용자 태그 수 또는 스터디 그룹 태그 수 중 작은 값으로 정규화
        // 태그 매칭 비율에 비례하여 점수 부여
        double matchRatio = (double) commonTags.size() / Math.min(userTags.size(), groupTags.size());
        return matchRatio; // 0~1 사이의 값 반환, 나중에 최종 점수 계산 시 가중치 적용
    }

    // 🌟 [새로 추가] 경력 적합도 점수 계산 (0~100점)
    private double calculateCareerMatchScore(User user, StudyGroup studyGroup) {
        Career userCareer = user.getCareer();
        Career requiredCareer = studyGroup.getRequiredCareer();

        if (userCareer == null || requiredCareer == null) {
            return 0.0;
        }

        // 경력 레벨을 숫자로 매핑 (NEWBIE < JUNIOR < SENIOR)
        int userLevel = userCareer.ordinal();
        int requiredLevel = requiredCareer.ordinal();

        // 0: 완벽 일치, 1: 한 단계 차이, 2: 두 단계 차이
        int levelDifference = Math.abs(userLevel - requiredLevel);

        // 차이가 적을수록 높은 점수
        return switch (levelDifference) {
            case 0 -> 1.0; // 완벽 일치 (NEWBIE == NEWBIE)
            case 1 -> 0.5; // 한 단계 차이 (NEWBIE < JUNIOR)
            case 2 -> 0.1; // 두 단계 차이 (NEWBIE < SENIOR)
            default -> 0.0;
        };
    }

    // 🌟 [새로 추가] 학습 스타일 일치도 점수 계산 (0~100점)
    private double calculateStudyStyleMatchScore(User user, StudyGroup studyGroup) {
        StudyStyle userStyle = user.getStudyStyle();
        StudyStyle groupStyle = studyGroup.getStudyStyle();

        if (userStyle == null || groupStyle == null) {
            return 0.0;
        }

        return userStyle == groupStyle ? 1.0 : 0.0; // 일치하면 1, 아니면 0
    }

    // 🌟 [새로 추가] 지역 일치도 점수 계산 (0~100점)
    private double calculateRegionMatchScore(User user, StudyGroup studyGroup) {
        String userRegion = user.getRegion();
        String groupRegion = studyGroup.getRegion();
        StudyStyle groupStyle = studyGroup.getStudyStyle();

        if (userRegion == null || groupRegion == null || groupStyle == null) {
            return 0.0;
        }

        // 스터디 그룹이 온라인이면 지역은 중요하지 않음 (단, 사용자가 온라인 선호 시 가산점 가능)
        if (groupStyle == StudyStyle.ONLINE) {
            // 사용자가 온라인을 선호하면 추가 점수 부여 (옵션)
            return user.getStudyStyle() == StudyStyle.ONLINE ? 0.5 : 0.0; // 온라인 선호 유저에게 중간 점수
        }

        // 오프라인 또는 하이브리드 스터디일 경우 지역 비교
        return userRegion.equalsIgnoreCase(groupRegion) ? 1.0 : 0.0; // 지역 일치하면 1, 아니면 0
    }


    // --- 기존 TF-IDF 및 코사인 유사도 계산 헬퍼 메소드들 (변경 없음) ---

    private Map<String, Double> createTfIdfVector(String text, Map<String, Double> idfVocabulary) { /* ... */ return Collections.emptyMap(); }
    private Map<String, Double> calculateIdf(List<String> documents) { /* ... */ return Collections.emptyMap(); }
    private Map<String, Long> calculateTf(List<String> tokens) { /* ... */ return Collections.emptyMap(); }
    private List<String> tokenize(String text) { /* ... */ return Collections.emptyList(); }
    private double calculateCosineSimilarity(Map<String, Double> vec1, Map<String, Double> vec2) { /* ... */ return 0.0; }

}