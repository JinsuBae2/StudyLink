package com.example.backend.dto.studygroup;

import com.example.backend.entity.Career; // 🌟 Career Enum import
import com.example.backend.entity.StudyStyle;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@NoArgsConstructor
public class StudyGroupCreateRequestDto {
    private String title;
    private String topic;
    private String description;
    private String goal;
    private Integer memberCount;
    private StudyStyle studyStyle;
    private String region;
    private List<String> tags;

    // 🌟 추가: 스터디에 필요한 경력 수준
    private Career requiredCareer; // NEWBIE, JUNIOR, SENIOR 중 하나

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd", timezone = "Asia/Seoul")
    private LocalDate recruitmentDeadline;
}