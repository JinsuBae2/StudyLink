package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 👈 [수정] @Setter 대신 이 부분만 제거
@EqualsAndHashCode(of = {"studyGroup", "tag"}) // 👈 [유지] 복합키의 필드를 사용
@IdClass(StudyGroupTagId.class) // 👈 [유지] 복합키 클래스 지정
@Table(name = "study_group_tag") // 👈 [추가] 테이블 이름 명시
public class StudyGroupTag {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_group_id")
    private StudyGroup studyGroup;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id")
    private Tag tag;

    public StudyGroupTag(StudyGroup studyGroup, Tag tag) {
        this.studyGroup = studyGroup;
        this.tag = tag;
    }

    // 양방향 연관관계 설정을 위한 편의 메서드 (StudyGroup에서 호출)
    public void setStudyGroup(StudyGroup studyGroup) {
        this.studyGroup = studyGroup;
    }
}
