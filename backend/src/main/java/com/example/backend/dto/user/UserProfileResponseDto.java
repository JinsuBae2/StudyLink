package com.example.backend.dto.user;

import com.example.backend.entity.User;
import lombok.Getter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class UserProfileResponseDto {
    private final Long id;
    private final String email;
    private final String nickname;
    private final LocalDate birthDate;
    private final String career;
    private final String job;
    private final String goal;
    private final String studyStyle;
    private final String region;
    private final List<String> tags;
    private final LocalDateTime createdAt;

    public UserProfileResponseDto(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.nickname = user.getNickname();
        this.birthDate = user.getBirthDate();
        this.career = user.getCareer() != null ? user.getCareer().name() : null;
        this.job = user.getJob();
        this.goal = user.getGoal();
        this.studyStyle = user.getStudyStyle() != null ? user.getStudyStyle().name() : null;
        this.region = user.getRegion();
        this.tags = user.getUserTags().stream()
                .map(userTag -> userTag.getTag().getName()) // user.getTags() -> user.getUserTags()로 수정
                .collect(Collectors.toList());
        this.createdAt = user.getCreatedAt();
    }
}