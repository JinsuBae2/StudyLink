package com.example.backend.dto.Application;

import com.example.backend.entity.ApplicationStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ApplicationProcessRequestDto {
    private ApplicationStatus status;
}
