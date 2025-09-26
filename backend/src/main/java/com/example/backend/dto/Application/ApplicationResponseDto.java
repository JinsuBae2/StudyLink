package com.example.backend.dto.Application;

import com.example.backend.entity.Application;
import com.example.backend.entity.ApplicationStatus;
import lombok.Getter;

@Getter
public class ApplicationResponseDto {
    private final Long applicantId;
    private final Long applicationId;
    private final String applicantNickname;
    private final String message;
    private final ApplicationStatus status;

    public ApplicationResponseDto(Application application) {
        this.applicantId = application.getApplicant().getId();
        this.applicationId = application.getId();
        this.applicantNickname = application.getApplicant().getNickname();
        this.message = application.getMessage();
        this.status = application.getStatus();
    }
}
