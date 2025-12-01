package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter // 👈 [다시 추가] 양방향 연관관계 관리를 위해 @Setter 또는 특정 setter 필요
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = {"studyGroup", "tag"})
@IdClass(StudyGroupTagId.class)
@Table(name = "study_group_tag")
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

    // 🌟 양방향 연관관계 설정을 위한 편의 메서드 (StudyGroup, TagService에서 호출)
    // Lombok @Setter를 사용해도 되지만, 특정 필드에만 setter를 만들고 싶다면 이렇게 정의
    // (현재는 @Setter를 추가하는게 가장 간단합니다.)
    public void setStudyGroup(StudyGroup studyGroup) {
        this.studyGroup = studyGroup;
    }

    public void setTag(Tag tag) { // 🌟 추가
        this.tag = tag;
    }
}