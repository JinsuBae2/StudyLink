package com.example.backend.dto.studygroup;

import com.example.backend.entity.StudyGroup;
import lombok.Getter;
import java.time.LocalDate;

@Getter
public class MyCreatedStudyGroupResponseDto {
    private final Long id;
    private final String title;
    private final String topic;
    private final int currentParticipants; // 현재 참여자 수
    private final int maxParticipants; // 최대 모집 인원
    private final LocalDate recruitmentDeadline;

    public MyCreatedStudyGroupResponseDto(StudyGroup studyGroup) {
        this.id = studyGroup.getId();
        this.title = studyGroup.getTitle();
        this.topic = studyGroup.getTopic();
        this.currentParticipants = studyGroup.getStudyMembers().size(); // .size()로 계산
        this.maxParticipants = studyGroup.getMemberCount(); // memberCount 필드 사용
        this.recruitmentDeadline = studyGroup.getRecruitmentDeadline();
    }
}