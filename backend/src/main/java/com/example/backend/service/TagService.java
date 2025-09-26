package com.example.backend.service;

import com.example.backend.entity.*;
import com.example.backend.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class TagService {
    private final TagRepository tagRepository;

    // 스터디 그룹 태그 처리
    public void processStudyGroupTags(StudyGroup studyGroup, List<String> tagNames) {
        studyGroup.getStudyGroupTags().clear();

        if (tagNames != null && !tagNames.isEmpty()) {
            Set<String> uniqueTagNames = new HashSet<>(tagNames);
            uniqueTagNames.stream()
                    .map(this::findOrCreateTag) // findOrCreateTag 메소드 사용
                    .forEach(tag -> {
                        StudyGroupTag studyGroupTag = new StudyGroupTag(studyGroup, tag);
                        studyGroup.addStudyGroupTag(studyGroupTag); // StudyGroup에 추가 메소드 필요
                    });
        }
    }

    // --- 사용자 태그 처리 ---
    public void processUserTags(User user, List<String> tagNames) {
        user.getUserTags().clear(); // 기존 태그 연결 모두 제거

        if (tagNames != null && !tagNames.isEmpty()) {
            Set<String> uniqueTagNames = new HashSet<>(tagNames);
            uniqueTagNames.stream()
                    .map(this::findOrCreateTag) // findOrCreateTag 메소드 사용
                    .forEach(tag -> {
                        UserTag userTag = new UserTag(user, tag);
                        user.addUserTag(userTag); // User에 추가 메소드 필요
                    });
        }
    }

    private Tag findOrCreateTag(String tagName) {
        String normalizedTagName = normalizeTagName(tagName);

        return tagRepository.findByName(normalizedTagName)
                .orElseGet(() -> tagRepository.save(new Tag(normalizedTagName))); // 없으면 새로 만들어서 저장
    }

    private String normalizeTagName(String name) {
        return name.trim().toLowerCase().replaceAll("\\s+", "");
    }
}
