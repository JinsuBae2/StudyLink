package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
@Table(name = "study_member")
public class StudyMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "role")
    private String role; // e.g., "LEADER", "MEMBER"

    @CreationTimestamp
    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    // --- 연관관계 ---

    // StudyMember(N) : User(1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // StudyMember(N) : StudyGroup(1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_group_id", nullable = false)
    private StudyGroup studyGroup;


    @Builder
    public StudyMember(User user, StudyGroup studyGroup, String role) {
        this.user = user;
        this.studyGroup = studyGroup;
        this.role = role;
    }
}