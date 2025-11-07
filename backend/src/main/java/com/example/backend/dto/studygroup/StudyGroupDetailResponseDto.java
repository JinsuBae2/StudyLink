package com.example.backend.dto.studygroup;

import com.example.backend.entity.StudyGroup;
import com.example.backend.entity.StudyStyle;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class StudyGroupDetailResponseDto {
    private final Long id;
    private final String title;
    private final String topic;
    private final String description;
    private final String goal;
    private final int currentMemberCount; // 현재 참여 인원
    private final int maxMemberCount;     // 최대 모집 인원
    private final String region;
    private final StudyStyle studyStyle; // 스터디 스타일
    private final List<String> tags;   // 태그 목록
    private final Long creatorId;      // 그룹장 ID
    private final String creatorNickname;
    private final LocalDate recruitmentDeadline;
    private final LocalDateTime createdAt;

    public StudyGroupDetailResponseDto(StudyGroup studyGroup) {
        this.id = studyGroup.getId();
        this.title = studyGroup.getTitle();
        this.topic = studyGroup.getTopic();
        this.description = studyGroup.getDescription();
        this.goal = studyGroup.getGoal();
        this.currentMemberCount = studyGroup.getStudyMembers().size(); // 현재 멤버 수 계산
        this.maxMemberCount = studyGroup.getMemberCount(); // 최대 정원
        this.region = studyGroup.getRegion();
        this.studyStyle = studyGroup.getStudyStyle();
        this.tags = studyGroup.getStudyGroupTags().stream()
                .map(studyGroupTag -> studyGroupTag.getTag().getName())
                .collect(Collectors.toList());
        this.creatorId = studyGroup.getCreator().getId();
        this.creatorNickname = studyGroup.getCreator().getNickname();
        this.recruitmentDeadline = studyGroup.getRecruitmentDeadline();
        this.createdAt = studyGroup.getCreatedAt();
    }
}