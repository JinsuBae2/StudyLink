package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
@Table(name = "application")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message; // 지원자가 남기는 메시지

    @Enumerated(EnumType.STRING) // Enum 값을 DB에 String으로 저장
    @Column(name = "status", nullable = false)
    private ApplicationStatus status; // 지원 상태 (PENDING, ACCEPTED, REJECTED)

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // --- 연관관계 ---

    // Application(N) : User(1) => 지원자 정보
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false)
    private User applicant;

    // Application(N) : StudyGroup(1) => 지원한 스터디 그룹 정보
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_group_id", nullable = false)
    private StudyGroup studyGroup;


    @Builder
    public Application(User applicant, StudyGroup studyGroup, String message) {
        this.applicant = applicant;
        this.studyGroup = studyGroup;
        this.message = message;
        this.status = ApplicationStatus.PENDING; // 지원서는 처음 만들 때 항상 '대기 중' 상태
    }

    public void updateStatus(ApplicationStatus status) {
        this.status = status;
    }
}