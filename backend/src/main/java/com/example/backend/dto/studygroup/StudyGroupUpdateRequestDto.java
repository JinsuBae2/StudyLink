package com.example.backend.dto.studygroup;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@NoArgsConstructor
public class StudyGroupUpdateRequestDto {
    private String title;
    private String topic;
    private String description;
    private String goal;
    private Integer memberCount;
    private LocalDate recruitmentDeadLine;
    private List<String> tags;
}
