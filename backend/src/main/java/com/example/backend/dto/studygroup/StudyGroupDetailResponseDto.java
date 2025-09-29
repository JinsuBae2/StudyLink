package com.example.backend.dto.studygroup;

import com.example.backend.entity.StudyGroup;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class StudyGroupDetailResponseDto {
    private final Long id;
    private final String title;
    private final String topic;
    private final String description;
    private final String goal;
    private final Integer memberCount;
    private final LocalDate recruitmemtDeadLine;
    private final String region;
    private final String creatorNickname;
    private final LocalDateTime createAt;

    public StudyGroupDetailResponseDto(StudyGroup studyGroup) {
        this.id = studyGroup.getId();
        this.title = studyGroup.getTitle();
        this.topic = studyGroup.getTopic();
        this.description = studyGroup.getDescription();
        this.goal = studyGroup.getGoal();
        this.memberCount = studyGroup.getMemberCount();
        this.recruitmemtDeadLine = studyGroup.getRecruitmentDeadline();
        this.region = studyGroup.getRegion();
        this.creatorNickname = studyGroup.getCreator().getNickname();
        this.createAt = studyGroup.getCreatedAt();
    }

}
