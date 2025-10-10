package com.example.backend.dto.Application;

import com.example.backend.entity.Application;
import com.example.backend.entity.ApplicationStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class MemberApplicationResponseDto {
    private Long applicationId;
    private Long studyGroupId; // 어떤 스터디에 신청했는지 ID
    private String studyGroupTitle; // 어떤 스터디에 신청했는지 제목
    private String message;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;

    public MemberApplicationResponseDto(Application application) {
        this.applicationId = application.getId();
        this.studyGroupId = application.getStudyGroup().getId();
        this.studyGroupTitle = application.getStudyGroup().getTitle();
        this.message = application.getMessage();
        this.status = application.getStatus();
        this.appliedAt = application.getCreatedAt();
    }
}