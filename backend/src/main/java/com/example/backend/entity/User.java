package com.example.backend.entity;

import com.example.backend.dto.user.UserProfileUpdateRequestDto;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@EqualsAndHashCode(of = "id")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String nickname;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    private Career career;

    private String job;

    @Column(columnDefinition = "TEXT")
    private String goal;

    @Enumerated(EnumType.STRING)
    private StudyStyle studyStyle;

    @Column(name = "is_available_now")
    private Boolean isAvailableNow;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // --- 연관관계 ---
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private final Set<UserTag> userTags = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private final Set<StudyMember> studyMembers = new HashSet<>();

    @OneToMany(mappedBy = "applicant", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<Application> applications = new ArrayList<>();


    @Builder
    public User(String email, String password, String nickname, LocalDate birthDate, Career career, String job, String goal, StudyStyle studyStyle) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.birthDate = birthDate;
        this.career = career;
        this.job = job;
        this.goal = goal;
        this.studyStyle = studyStyle;
        this.isAvailableNow = false; // 기본값은 false로 설정
    }

    public void updateProfile(UserProfileUpdateRequestDto requestDto) {
        if (requestDto.getNickname() != null) this.nickname = requestDto.getNickname();
        if (requestDto.getCareer() != null) this.career = requestDto.getCareer();
        if (requestDto.getJob() != null) this.job = requestDto.getJob();
        if (requestDto.getGoal() != null) this.goal = requestDto.getGoal();
        if (requestDto.getStudyStyle() != null) this.studyStyle = requestDto.getStudyStyle();
    }

    public void addUserTag(UserTag userTag) {
        this.userTags.add(userTag);
        if (userTag.getUser() != this) { // 무한 루프 방지
            userTag.setUser(this);
        }
    }
}