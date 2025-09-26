package com.example.backend.dto.studygroup;

import com.example.backend.entity.StudyGroup;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class StudyGroupListResponseDto {
    private final Long id;
    private final String title;
    private final String topic;
    private final String creatorNickname;
    private final LocalDate recruitmentDeadline;

    public StudyGroupListResponseDto(StudyGroup studyGroup) {
        this.id = studyGroup.getId();
        this.title = studyGroup.getTitle();
        this.topic = studyGroup.getTopic();
        this.creatorNickname = studyGroup.getCreator().getNickname();
        this.recruitmentDeadline = studyGroup.getRecruitmentDeadline();
    }
}
