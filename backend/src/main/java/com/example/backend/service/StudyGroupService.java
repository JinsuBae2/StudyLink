package com.example.backend.service;

import com.example.backend.dto.studygroup.StudyGroupCreateRequestDto;
import com.example.backend.dto.studygroup.StudyGroupDetailResponseDto;
import com.example.backend.dto.studygroup.StudyGroupListResponseDto;
import com.example.backend.dto.studygroup.StudyGroupUpdateRequestDto;
import com.example.backend.entity.*;
import com.example.backend.repository.StudyGroupRepository;
import com.example.backend.repository.TagRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyGroupService {

    private final StudyGroupRepository studyGroupRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;

    // 스터디 그룹 생성
    @Transactional
    public void createStudyGroup(StudyGroupCreateRequestDto requestDto, UserDetails userDetails) {
        String email = userDetails.getUsername();
        User creator = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        StudyGroup newStudyGroup = StudyGroup.builder()
                .title(requestDto.getTitle())
                .topic(requestDto.getTopic())
                .description(requestDto.getDescription())
                .goal(requestDto.getGoal())
                .memberCount(requestDto.getMemberCount())
                .recruitmentDeadline(requestDto.getRecruitmentDeadline())
                .creator(creator)
                .build();

        // 태그 처리 로직

        if (requestDto.getTags() != null && !requestDto.getTags().isEmpty()) {
            Set<String> uniqueTagNames = new HashSet<>(requestDto.getTags());
            uniqueTagNames.stream()
                    .map(tagName -> tagRepository.findByName(tagName)
                            .orElseGet(() -> new Tag(tagName)))
                    .forEach(tag -> {
                        StudyGroupTag studyGroupTag = new StudyGroupTag(newStudyGroup, tag);
                        newStudyGroup.getStudyGroupTags().add(studyGroupTag);
                    });
        }

        studyGroupRepository.save(newStudyGroup);
    }


    // 스터디 그룹 전체 조회
    @Transactional(readOnly = true)
    public List<StudyGroupListResponseDto> findAllStudyGroup() {
        return studyGroupRepository.findAll().stream()
                .map(StudyGroupListResponseDto::new)
                .collect(Collectors.toList());
    }

    // 스터디 그룹 단일 조회
    @Transactional(readOnly = true)
    public StudyGroupDetailResponseDto findStudyGroupById(Long groupId) {
        StudyGroup studyGroup = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("해당 스터디 그룹을 찾을 수 없습니다."));
        return new StudyGroupDetailResponseDto(studyGroup);
    }

    // 그룹장 -> 스터디 그룹 수정
    @Transactional
    public void     updateStudyGroup(Long groupId, StudyGroupUpdateRequestDto requestDto, UserDetails userDetails) {
        StudyGroup studyGroup = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("해당 스터디 그룹을 찾을 수 없습니다."));

        if (!studyGroup.getCreator().getEmail().equals(userDetails.getUsername())) {
            throw new IllegalArgumentException("스터디 그룹을 수정할 권한이 없습니다.");
        }

        // 태그 정보 업데이트 (기존 태그는 모두 지우고 새로 추가하는 방식)
        studyGroup.getStudyGroupTags().clear();
        if (requestDto.getTags() != null && !requestDto.getTags().isEmpty()) {
            Set<String> uniqueTagNames = new HashSet<>(requestDto.getTags());
            uniqueTagNames.stream()
                    .map(tagName -> tagRepository.findByName(tagName)
                            .orElseGet(() -> new Tag(tagName)))
                    .forEach(tag -> {
                        StudyGroupTag studyGroupTag = new StudyGroupTag(studyGroup, tag);
                        studyGroup.getStudyGroupTags().add(studyGroupTag);
                    });
        }

        studyGroup.update(requestDto);
    }

    // 그룹장 -> 스터디 그룹 삭제
    @Transactional
    public void deleteStudyGroup(Long groupId, UserDetails userDetails) {
        StudyGroup studyGroup = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("해당 스터디 그룹을 찾을 수 없습니다."));

        if (!studyGroup.getCreator().getEmail().equals(userDetails.getUsername())){
            throw new IllegalArgumentException("스터디 그룹을 삭제할 권한이 없습니다.");
        }

        studyGroupRepository.delete(studyGroup);
    }
}
