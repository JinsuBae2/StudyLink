package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "interests", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "study_group_id"}) // 중복 찜 방지
})
public class Interest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_group_id", nullable = false)
    private StudyGroup studyGroup;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Builder
    public Interest(User user, StudyGroup studyGroup) {
        this.user = user;
        this.studyGroup = studyGroup;
    }
}