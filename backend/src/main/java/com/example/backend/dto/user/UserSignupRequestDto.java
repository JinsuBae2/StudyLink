package com.example.backend.dto.user;

import com.example.backend.entity.Career;
import com.example.backend.entity.StudyStyle;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class UserSignupRequestDto {
    private String email;
    private String password;
    private String nickname;
    private Career career;
    private LocalDate birthDate;
    private String job;
    private String goal;
    private StudyStyle studyStyle;
}
