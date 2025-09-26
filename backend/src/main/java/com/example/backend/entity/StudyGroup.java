package com.example.backend.entity;

import com.example.backend.dto.studygroup.StudyGroupUpdateRequestDto;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@EqualsAndHashCode(of = "id")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "study_group")
public class StudyGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, unique = true)
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "topic")
    private String topic;

    @Column(name = "description")
    private String description;

    @Column(name = "goal")
    private String goal;

    @Column(name = "member_count")
    private int memberCount;

    @Column(name = "recruitment_deadline")
    private LocalDate recruitmentDeadline;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 연관관계
    // creatorId 대신 User 객체를 직접 참조하도록 수정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    // StudyGroup(1) : StudyMember(N)
    @OneToMany(mappedBy = "studyGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<StudyMember> studyMembers = new ArrayList<>();

    // StudyGroup(1) : Application(N)
    @OneToMany(mappedBy = "studyGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<Application> applications = new ArrayList<>();

    @OneToMany(mappedBy = "studyGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<StudyGroupTag> studyGroupTags = new ArrayList<>();


    //Builder
    @Builder
    public StudyGroup(String title, String topic, String description, String goal, int memberCount, LocalDate recruitmentDeadline, User creator) {
        this.title = title;
        this.topic = topic;
        this.description = description;
        this.goal = goal;
        this.memberCount = memberCount;
        this.recruitmentDeadline = recruitmentDeadline;
        this.creator = creator;
    }

    public void update(StudyGroupUpdateRequestDto requestDto) {
        // title 필드가 null이 아니면, this.title을 업데이트한다.
        if (requestDto.getTitle() != null) {
            this.title = requestDto.getTitle();
        }
        if (requestDto.getTopic() != null) {
            this.topic = requestDto.getTopic();
        }
        if (requestDto.getDescription() != null) {
            this.description = requestDto.getDescription();
        }
        if (requestDto.getGoal() != null) {
            this.goal = requestDto.getGoal();
        }
        if (requestDto.getMemberCount() != null) {
            this.memberCount = requestDto.getMemberCount();
        }
        if (requestDto.getRecruitmentDeadLine() != null) {
            this.recruitmentDeadline = requestDto.getRecruitmentDeadLine();
        }
    }
}
