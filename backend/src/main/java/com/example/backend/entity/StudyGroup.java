package com.example.backend.entity;

import com.example.backend.dto.studygroup.StudyGroupUpdateRequestDto;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List; // List는 Set으로 변경하는 것이 좋습니다 (중복 방지)
import java.util.Set; // 🌟 Set으로 변경

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

    @Column(name = "region")
    private String region;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 연관관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Enumerated(EnumType.STRING)
    private StudyStyle studyStyle;

    // 🌟 추가: 스터디에 필요한 경력 수준 필드
    @Enumerated(EnumType.STRING)
    @Column(name = "required_career")
    private Career requiredCareer; // NEWBIE, JUNIOR, SENIOR 사용

    // StudyGroup(1) : StudyMember(N)
    @OneToMany(mappedBy = "studyGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private final Set<StudyMember> studyMembers = new HashSet<>();

    // StudyGroup(1) : Application(N)
    @OneToMany(mappedBy = "studyGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private final Set<Application> applications = new HashSet<>();

    // StudyGroup(1) : StudyGroupTag(N)
    @OneToMany(mappedBy = "studyGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private final Set<StudyGroupTag> studyGroupTags = new HashSet<>();

    // 댓글 연관관계 (스터디 삭제 시 댓글도 삭제)
    @OneToMany(mappedBy = "studyGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<Comment> comments = new ArrayList<>();


    //Builder
    @Builder
    public StudyGroup(String title, String topic, String description,
                      String goal, int memberCount, LocalDate recruitmentDeadline,
                      User creator, StudyStyle studyStyle, String region, // 🌟 requiredCareer 추가
                      Career requiredCareer) {
        this.title = title;
        this.topic = topic;
        this.description = description;
        this.goal = goal;
        this.memberCount = memberCount;
        this.recruitmentDeadline = recruitmentDeadline;
        this.creator = creator;
        this.studyStyle = studyStyle;
        this.region = region;
        this.requiredCareer = requiredCareer; // 🌟 필드 초기화
    }

    public void update(StudyGroupUpdateRequestDto requestDto) {
        if (requestDto.getTitle() != null) this.title = requestDto.getTitle();
        if (requestDto.getTopic() != null) this.topic = requestDto.getTopic();
        if (requestDto.getDescription() != null) this.description = requestDto.getDescription();
        if (requestDto.getGoal() != null) this.goal = requestDto.getGoal();
        if (requestDto.getMemberCount() != null) this.memberCount = requestDto.getMemberCount();
        if (requestDto.getRecruitmentDeadline() != null) this.recruitmentDeadline = requestDto.getRecruitmentDeadline();
        if (requestDto.getStudyStyle() != null) this.studyStyle = requestDto.getStudyStyle();
        if (requestDto.getRegion() != null) this.region = requestDto.getRegion();
        // 🌟 추가: requiredCareer 업데이트 로직
        if (requestDto.getRequiredCareer() != null) this.requiredCareer = requestDto.getRequiredCareer();
    }

    // 🌟 [수정] setTags 메서드를 제거하고, TagService에서 studyGroupTags 컬렉션을 직접 관리하도록 위임합니다.
    // User 엔티티의 userTags 처리 방식과 동일하게 맞춥니다.
    /*
    public void setTags(List<Tag> newTags) {
        this.studyGroupTags.clear();
        if (newTags != null && !newTags.isEmpty()) {
            for (Tag tag : newTags) {
                addStudyGroupTag(new StudyGroupTag(this, tag));
            }
        }
    }
    */

    public void addStudyGroupTag(StudyGroupTag studyGroupTag) {
        this.studyGroupTags.add(studyGroupTag);
        if (studyGroupTag.getStudyGroup() != this) {
            studyGroupTag.setStudyGroup(this);
        }
    }

    public int getCurrentMemberCount() {
        return this.studyMembers.size();
    }
}