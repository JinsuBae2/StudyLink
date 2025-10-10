package com.example.backend.dto.studygroup;

import com.example.backend.entity.StudyGroup;
import lombok.Getter;
import java.time.LocalDate;

@Getter
public class MyParticipatingStudyGroupResponseDto {
    private final Long id;
    private final String title;
    private final String topic;
    private final int currentParticipants;
    private final int maxParticipants;
    private final LocalDate recruitmentDeadline;

    public MyParticipatingStudyGroupResponseDto(StudyGroup studyGroup) {
        this.id = studyGroup.getId();
        this.title = studyGroup.getTitle();
        this.topic = studyGroup.getTopic();
        this.currentParticipants = studyGroup.getStudyMembers().size();
        this.maxParticipants = studyGroup.getMemberCount();
        this.recruitmentDeadline = studyGroup.getRecruitmentDeadline();
    }
}