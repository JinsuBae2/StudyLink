package com.example.backend.service;

import com.example.backend.dto.studygroup.*;
import com.example.backend.entity.*;
import com.example.backend.repository.StudyGroupRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyGroupService {

    private final StudyGroupRepository studyGroupRepository;
    private final UserRepository userRepository;
    private final TagService tagService;

    // 스터디 그룹 생성
    @Transactional
    public StudyGroupDetailResponseDto createStudyGroup(StudyGroupCreateRequestDto requestDto, UserDetails userDetails) {
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
                .region(requestDto.getRegion())
                .creator(creator)
                .studyStyle(requestDto.getStudyStyle())
                .build();

        StudyGroup savedStudyGroup = studyGroupRepository.save(newStudyGroup);

        // 태그 처리 로직 (기존 코드 유지)
        tagService.processStudyGroupTags(savedStudyGroup, requestDto.getTags());

        // 생성된 스터디 그룹의 상세 정보를 DTO로 변환하여 반환
        return new StudyGroupDetailResponseDto(savedStudyGroup);
    }


    // 스터디 그룹 전체 조회
    @Transactional(readOnly = true)
    public List<StudyGroupListResponseDto> findAllStudyGroup(String region, String sort, String search) {
        List<StudyGroup> studyGroups;
        boolean hasRegion = region != null && !region.isBlank();
        boolean hasSearch = search != null && !search.isBlank();

        if (hasSearch) {
            List<StudyGroup> allGroups = studyGroupRepository.findAllWithTags();
            String lowerCaseSearch = search.toLowerCase();
            studyGroups = allGroups.stream()
                    .filter(group ->
                        group.getTitle().toLowerCase().contains(lowerCaseSearch) ||
                        group.getTopic().toLowerCase().contains(lowerCaseSearch) ||
                        group.getDescription().toLowerCase().contains(lowerCaseSearch) ||
                        group.getCreator().getNickname().toLowerCase().contains(lowerCaseSearch) ||
                        (group.getRegion() != null && group.getRegion().toLowerCase().contains(lowerCaseSearch)) ||
                        group.getStudyGroupTags().stream()
                                .anyMatch(sgTag -> sgTag.getTag().getName().toLowerCase().contains(lowerCaseSearch))
                    )
                    .collect(Collectors.toList());
        } else {
            // 검색어가 없을 경우: 기존 region/sort 로직 유지
            if (hasRegion) {
                // 지역 필터링이 있는 경우
                studyGroups = switch (sort) {
                    case "popular" -> studyGroupRepository.findAllByRegionOrderByPopularity(region, PageRequest.of(0, 10));
                    case "deadline" ->
                                    studyGroupRepository.findAllByRegionAndRecruitmentDeadlineAfterOrderByRecruitmentDeadlineAsc(region, LocalDate.now());
                    default -> // "latest"
                                    studyGroupRepository.findAllByRegionOrderByIdDesc(region);
                };
            } else {
                // 지역 필터링이 없는 경우
                studyGroups = switch (sort) {
                    case "popular" -> studyGroupRepository.findAllOrderByPopularity(PageRequest.of(0, 10));
                    case "deadline" ->
                                   studyGroupRepository.findAllByRecruitmentDeadlineAfterOrderByRecruitmentDeadlineAsc(LocalDate.now());
                    default -> // "latest"
                                    studyGroupRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
                };
            }
        }

        return studyGroups.stream()
                .map(StudyGroupListResponseDto::new)
                .toList();
    }

        // 스터디 그룹 목록 정렬을 위한 헬퍼 메서드 (검색 결과에도 적용 가능)
        private List<StudyGroup> applySorting(List<StudyGroup> groups, String sort) {
        return switch (sort) {
           case "popular" -> groups.stream() // 예시: 인기 기준이 없다면 단순히 id 역순
                            .sorted(Comparator.comparing(StudyGroup::getId).reversed())
                            .limit(10) // 인기 10개만 가정
                            .toList();
           case "deadline" -> groups.stream()
                            .filter(group -> group.getRecruitmentDeadline().isAfter(LocalDate.now()))
                            .sorted(Comparator.comparing(StudyGroup::getRecruitmentDeadline))
                            .toList();
           default -> // "latest"
                            groups.stream()
                                            .sorted(Comparator.comparing(StudyGroup::getId).reversed())
                                    .toList();
        };
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
    public StudyGroupDetailResponseDto updateStudyGroup(Long groupId, StudyGroupUpdateRequestDto requestDto, UserDetails userDetails) {
        StudyGroup studyGroup = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("해당 스터디 그룹을 찾을 수 없습니다."));

        if (!studyGroup.getCreator().getEmail().equals(userDetails.getUsername())) {
            throw new IllegalArgumentException("스터디 그룹을 수정할 권한이 없습니다.");
        }

        // 태그 정보 업데이트 (기존 태그는 모두 지우고 새로 추가하는 방식)
        studyGroup.getStudyGroupTags().clear();
        tagService.processStudyGroupTags(studyGroup, requestDto.getTags());

        studyGroup.update(requestDto);

        // 변경된 studyGroup을 영속성 컨텍스트가 자동으로 감지하므로, DTO로 변환하여 반환
        return new StudyGroupDetailResponseDto(studyGroup);
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

    // 스터디 그룹 추천 목록 (v1: 점수 기반 추천 알고리즘)
    @Transactional(readOnly = true)
    public List<RecommendedStudyGroupDto> recommendStudyGroups(UserDetails userDetails) {
        User currentUser = userRepository.findByEmailWithDetails(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 사용자가 이미 속해있거나, 생성한 스터디 그룹 ID 목록을 미리 준비
        Set<Long> excludedGroupIds = currentUser.getStudyMembers().stream()
                                                .map(sm -> sm.getStudyGroup().getId())
                                                .collect(Collectors.toSet());

        studyGroupRepository.findAllByCreator(currentUser)
                .forEach(sg -> excludedGroupIds.add(sg.getId()));

        List<StudyGroup> allStudyGroups = studyGroupRepository.findAllWithTags();

        return allStudyGroups.stream()
                .filter(studyGroup -> !excludedGroupIds.contains(studyGroup.getId()))
                .map(studyGroup -> new RecommendedStudyGroupDto(studyGroup, calculateMatchScore(currentUser, studyGroup)))
                .filter(dto -> dto.getMatchScore() > 0)
                .sorted(Comparator.comparing(RecommendedStudyGroupDto::getMatchScore).reversed())
                .toList();
    }

    // 추천 알고리즘 점수 계산
    private double calculateMatchScore(User user, StudyGroup studyGroup) {
        double score = 0;

        Set<String> userTags = user.getUserTags().stream()
                .map(userTag -> userTag.getTag().getName())
                .collect(Collectors.toSet());

        Set<String> groupTags = studyGroup.getStudyGroupTags().stream()
                .map(studyGroupTag -> studyGroupTag.getTag().getName())
                .collect(Collectors.toSet());

        Set<String> commonTags = new HashSet<>(userTags);
        commonTags.retainAll(groupTags);
        score += commonTags.size() * 20.0;

        if (user.getStudyStyle() != null && studyGroup.getStudyGroupTags() != null && user.getStudyStyle() == studyGroup.getStudyStyle()) {
            score += 15;
        }

        return score;
    }

    // 👈 [추가] 내가 참여 중인 스터디 그룹 목록 조회
    @Transactional(readOnly = true)
    public List<MyParticipatingStudyGroupResponseDto> getMyParticipatingStudyGroups(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return user.getStudyMemberships().stream()
                .map(StudyMember::getStudyGroup)
                .map(MyParticipatingStudyGroupResponseDto::new)
                .collect(Collectors.toList());
    }

    // 👈 [추가] 내가 생성한 스터디 그룹 목록 조회
    @Transactional(readOnly = true)
    public List<MyCreatedStudyGroupResponseDto> getMyCreatedStudyGroups(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        return studyGroupRepository.findAllByCreator(user).stream()
                .map(MyCreatedStudyGroupResponseDto::new)
                .collect(Collectors.toList());
    }
}
