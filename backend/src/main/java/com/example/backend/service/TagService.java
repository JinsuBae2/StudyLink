package com.example.backend.service;

import com.example.backend.entity.*;
import com.example.backend.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TagService {
    private final TagRepository tagRepository;

    // 스터디 그룹 태그 처리
    // 🌟 [수정] 스터디 그룹 태그 처리 - UserTags 처리와 동일하게 비교 로직 적용
    public void processStudyGroupTags(StudyGroup studyGroup, List<String> newTagNames) {
        // 1. 기존 태그들을 Set으로 변환하여 효율적인 검색을 준비합니다.
        Set<String> existingTagNames = studyGroup.getStudyGroupTags().stream()
                .map(sgt -> sgt.getTag().getName())
                .collect(Collectors.toSet());

        // 2. 새로운 태그 목록을 Set으로 변환하여 중복을 제거하고 효율적으로 비교합니다.
        Set<String> uniqueNewTagNames = newTagNames != null ? new HashSet<>(newTagNames) : new HashSet<>();
        uniqueNewTagNames.removeIf(String::isEmpty); // 빈 문자열 태그 제거

        // 3. 삭제해야 할 태그들을 식별하고 studyGroup.studyGroupTags 컬렉션에서 제거합니다.
        // (orphanRemoval=true 덕분에 컬렉션에서 제거만 해도 DB에서 삭제됩니다.)
        studyGroup.getStudyGroupTags().removeIf(studyGroupTag -> {
            String tagName = studyGroupTag.getTag().getName();
            return !uniqueNewTagNames.contains(tagName);
        });

        // 4. 추가해야 할 태그들을 식별하고 studyGroup.studyGroupTags 컬렉션에 추가합니다.
        // 기존 태그 이름에 없는 새로운 태그 이름만 필터링합니다.
        uniqueNewTagNames.stream()
                .filter(tagName -> !existingTagNames.contains(tagName))
                .map(this::findOrCreateTag) // Tag 엔티티를 찾거나 생성
                .forEach(tag -> {
                    StudyGroupTag studyGroupTag = new StudyGroupTag(studyGroup, tag);
                    studyGroup.addStudyGroupTag(studyGroupTag); // StudyGroup에 StudyGroupTag 추가
                });
    }

    // --- 사용자 태그 처리 ---
    public void processUserTags(User user, List<String> newTagNames) {
        // 1. 기존 태그들을 Set으로 변환하여 효율적인 검색을 준비합니다.
        Set<String> existingTagNames = user.getUserTags().stream()
                .map(ut -> ut.getTag().getName())
                .collect(Collectors.toSet());

        // 2. 새로운 태그 목록을 Set으로 변환하여 중복을 제거하고 효율적으로 비교합니다.
        Set<String> uniqueNewTagNames = newTagNames != null ? new HashSet<>(newTagNames) : new HashSet<>();
        uniqueNewTagNames.removeIf(String::isEmpty); // 빈 문자열 태그 제거

        // 3. 삭제해야 할 태그들을 식별하고 user.userTags 컬렉션에서 제거합니다.
        // (orphanRemoval=true 덕분에 컬렉션에서 제거만 해도 DB에서 삭제됩니다.)
        user.getUserTags().removeIf(userTag -> {
            String tagName = userTag.getTag().getName();
            return !uniqueNewTagNames.contains(tagName);
        });

        // 4. 추가해야 할 태그들을 식별하고 user.userTags 컬렉션에 추가합니다.
        // 기존 태그 이름에 없는 새로운 태그 이름만 필터링합니다.
        uniqueNewTagNames.stream()
                .filter(tagName -> !existingTagNames.contains(tagName))
                .map(this::findOrCreateTag) // Tag 엔티티를 찾거나 생성
                .forEach(tag -> {
                    UserTag userTag = new UserTag(user, tag);
                    user.addUserTag(userTag); // User에 UserTag 추가
                });
    }

    private Tag findOrCreateTag(String tagName) {
        String normalizedTagName = normalizeTagName(tagName);

        return tagRepository.findByName(normalizedTagName)
                .orElseGet(() -> tagRepository.save(new Tag(normalizedTagName)));
    }

    String normalizeTagName(String name) {
        return name.trim().toLowerCase().replaceAll("\\s+", "");
    }
}
