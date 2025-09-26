package com.example.backend.service;

import com.example.backend.dto.studygroup.RecommendedStudyGroupDto;
import com.example.backend.entity.StudyGroup;
import com.example.backend.entity.User;
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

    private static final Set<String> STOP_WORDS = Set.of(
            "은", "는", "이", "가", "을", "를", "으로", "로", "와", "과", "도", "만", "좀", "잘", "더",
            "가장", "아주", "정말", "바로", "그리고", "그래서", "그러나", "하지만", "또는", "및", "즉", "등",
            "것", "수", "있습니다", "합니다", "이다", "위해", "대한", "통해"
    );

    @Transactional(readOnly = true)
    public List<RecommendedStudyGroupDto> recommendGroupsByContent(UserDetails userDetails) {
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<StudyGroup> allStudyGroups = studyGroupRepository.findAll();

        // 1. 전체 문서(학습 목표 텍스트) 수집
        List<String> allGoals = new ArrayList<>();
        allStudyGroups.forEach(sg -> allGoals.add(sg.getGoal()));
        allGoals.add(currentUser.getGoal());

        // 2. IDF 어휘 사전 생성
        Map<String, Double> idfVocabulary = calculateIdf(allGoals);

        // 3. 현재 사용자의 TF-IDF 벡터 생성
        Map<String, Double> userTfIdfVector = createTfIdfVector(currentUser.getGoal(), idfVocabulary);

        // 4. 각 스터디 그룹과의 코사인 유사도 계산 및 정렬
        return allStudyGroups.stream()
                .map(studyGroup -> {
                    Map<String, Double> groupTfIdfVector = createTfIdfVector(studyGroup.getGoal(), idfVocabulary);
                    double similarity = calculateCosineSimilarity(userTfIdfVector, groupTfIdfVector);
                    return new RecommendedStudyGroupDto(studyGroup, similarity * 100); // 점수를 100점 만점으로 변환
                })
                .filter(dto -> dto.getMatchScore() > 0) // 유사도가 0 이상인 것만
                .sorted(Comparator.comparing(RecommendedStudyGroupDto::getMatchScore).reversed())
                .collect(Collectors.toList());
    }

    // --- TF-IDF 및 코사인 유사도 계산을 위한 private 헬퍼 메소드들 ---

    // TF-IDF 벡터 생성 (TF * IDF)
    private Map<String, Double> createTfIdfVector(String text, Map<String, Double> idfVocabulary) {
        if (text == null || text.isBlank()) {
            return Collections.emptyMap();
        }
        List<String> tokens = tokenize(text);
        Map<String, Long> tf = calculateTf(tokens);

        Map<String, Double> tfIdfVector = new HashMap<>();
        for (String term : tf.keySet()) {
            if (idfVocabulary.containsKey(term)) {
                double tfIdf = tf.get(term) * idfVocabulary.get(term);
                tfIdfVector.put(term, tfIdf);
            }
        }
        return tfIdfVector;
    }

    // IDF 계산: log(전체 문서 수 / 해당 단어가 포함된 문서 수)
    private Map<String, Double> calculateIdf(List<String> documents) {
        Map<String, Double> idf = new HashMap<>();
        Set<String> allTerms = new HashSet<>();
        List<Set<String>> docTermsList = new ArrayList<>();

        for (String doc : documents) {
            if (doc == null || doc.isBlank()) continue;
            Set<String> terms = new HashSet<>(tokenize(doc));
            allTerms.addAll(terms);
            docTermsList.add(terms);
        }

        int totalDocuments = documents.size();
        for (String term : allTerms) {
            long docCountWithTerm = docTermsList.stream().filter(docTerms -> docTerms.contains(term)).count();
            double idfValue = Math.log((double) totalDocuments / (docCountWithTerm + 1)); // +1은 0으로 나누는 것을 방지
            idf.put(term, idfValue);
        }
        return idf;
    }

    // TF 계산: (문서 내 특정 단어 수) / (문서 내 전체 단어 수)
    private Map<String, Long> calculateTf(List<String> tokens) {
        return tokens.stream().collect(Collectors.groupingBy(token -> token, Collectors.counting()));
    }

    // 간단한 텍스트 토큰화
    private List<String> tokenize(String text) {
        if (text == null || text.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(
                        text.toLowerCase() // 소문자 변환
                                .replaceAll("[^a-zA-Z0-9가-힣\\s]", "") // 특수문자 제거
                                .split("\\s+")) // 공백으로 분리
                .filter(token -> !token.isBlank() && !STOP_WORDS.contains(token)) // 👈 불용어 제거!
                .collect(Collectors.toList());
    }

    // 코사인 유사도 계산
    private double calculateCosineSimilarity(Map<String, Double> vec1, Map<String, Double> vec2) {
        if (vec1.isEmpty() || vec2.isEmpty()) {
            return 0.0;
        }

        Set<String> intersection = new HashSet<>(vec1.keySet());
        intersection.retainAll(vec2.keySet());

        double dotProduct = 0.0;
        for (String key : intersection) {
            dotProduct += vec1.get(key) * vec2.get(key);
        }

        double norm1 = 0.0;
        for (double value : vec1.values()) {
            norm1 += Math.pow(value, 2);
        }
        norm1 = Math.sqrt(norm1);

        double norm2 = 0.0;
        for (double value : vec2.values()) {
            norm2 += Math.pow(value, 2);
        }
        norm2 = Math.sqrt(norm2);

        if (norm1 == 0.0 || norm2 == 0.0) {
            return 0.0;
        }

        return dotProduct / (norm1 * norm2);
    }
}