package com.example.backend.dto.user;

import com.example.backend.entity.Career;
import com.example.backend.entity.StudyStyle;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class UserProfileUpdateRequestDto {
    private String nickname;
    private Career career;
    private String job;
    private String goal;
    private StudyStyle studyStyle;
    private List<String> tags;
    private String region;

}
